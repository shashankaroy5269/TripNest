const bcrypt =
  require("bcryptjs");

const crypto =
  require("crypto");

const httpStatus =
  require("http-status-codes");


const authRepository =
  require(
    "../repositories/auth.repository"
  );


const refreshTokenRepository =
  require(
    "../repositories/refreshToken.repository"
  );


const User =
  require("../models/user.model");

const emailService =
  require("./email.service");

const AppError =
  require("../utils/appError");


const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} =
  require("../utils/generateToken");


const ROLES =
  require("../constants/roles");


const ACCOUNT_STATUS =
  require("../constants/status");


class AuthService {


    // REGISTER
    async register({
    name,
    email,
    phone,
    password
  }) {

    const existingUser =
      await authRepository.findByEmail(
        email
      );


    if (existingUser) {

      throw new AppError(
        "Email already registered",

        httpStatus.StatusCodes.CONFLICT
      );
    }


    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user =
      await authRepository.createUser({

        name,

        email,

        phone,

        passwordHash,

        // Public registration
        // can ONLY create CUSTOMER

        role:
          ROLES.CUSTOMER,

        status:
          ACCOUNT_STATUS.ACTIVE,

        emailVerified: false,

        emailVerificationToken: verificationToken,

        emailVerificationExpires: verificationExpires

      });

    // Send verification email
    await emailService.sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: false,
      message: "Registration successful! Please verify your email before logging in."
    };
  }

    // CHECK ADMIN SETUP STATUS
    async checkAdminSetup() {
    const adminCount = await User.countDocuments({ role: ROLES.SUPER_ADMIN });
    return {
      hasSuperAdmin: adminCount > 0,
      adminCount
    };
  }

    // REGISTER ADMIN / SETUP
    async registerAdmin({
    name,
    email,
    phone,
    password,
    role = ROLES.SUPER_ADMIN,
    adminSecret
  }) {
    const existingUser = await authRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        "Email already registered",
        httpStatus.StatusCodes.CONFLICT
      );
    }

    const superAdminCount = await User.countDocuments({
      role: ROLES.SUPER_ADMIN
    });

    const validAdminSecret =
      process.env.ADMIN_SECRET_KEY || "tripnest_secret_2026";

    // If there is already a Super Admin, require the admin secret
    if (superAdminCount > 0 && adminSecret !== validAdminSecret) {
      throw new AppError(
        "Admin setup secret key is invalid. Please provide the correct Admin Secret Key.",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }

    const validRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.HOTEL_ADMIN,
      ROLES.TRIP_MANAGER
    ];

    const targetRole = validRoles.includes(role) ? role : ROLES.SUPER_ADMIN;
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await authRepository.createUser({
      name,
      email,
      phone: phone || "",
      passwordHash,
      role: targetRole,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerified: true
    });

    const payload = {
      userId: user._id.toString(),
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.storeRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    };
  }


    // VERIFY EMAIL
    async verifyEmail(token) {
    if (!token) {
      throw new AppError(
        "Verification token is required",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError(
        "Invalid or expired verification token",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return {
      message: "Email verified successfully! You can now log in to your account."
    };
  }


    // RESEND VERIFICATION EMAIL
    async resendVerification(email) {
    if (!email) {
      throw new AppError(
        "Email address is required",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(
        "Account with this email does not exist",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }

    if (user.emailVerified) {
      throw new AppError(
        "This account email is already verified. Please log in.",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken
    });

    return {
      message: "Verification email resent successfully! Please check your inbox."
    };
  }


    // LOGIN
    async login(
    email,
    password
  ) {

    const user =
      await authRepository.findByEmail(
        email
      );


    if (!user) {

      throw new AppError(
        "Invalid email or password",

        httpStatus.StatusCodes
          .UNAUTHORIZED
      );
    }


    if (
      user.status !==
      ACCOUNT_STATUS.ACTIVE
    ) {

      throw new AppError(
        "Your account is not active",

        httpStatus.StatusCodes.FORBIDDEN
      );
    }


    // Require Email Verification before Login
    if (!user.emailVerified) {
      throw new AppError(
        "Please verify your email before logging in. Check your inbox for the verification link.",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }


    const passwordMatched =
      await bcrypt.compare(
        password,
        user.passwordHash
      );


    if (!passwordMatched) {

      throw new AppError(
        "Invalid email or password",

        httpStatus.StatusCodes
          .UNAUTHORIZED
      );
    }


    const payload = {

      userId:
        user._id.toString(),

      role:
        user.role

    };


    const accessToken =
      generateAccessToken(
        payload
      );


    const refreshToken =
      generateRefreshToken(
        payload
      );


    await this.storeRefreshToken(
      user._id,
      refreshToken
    );


    return {

      accessToken,

      refreshToken,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        role: user.role,

        status: user.status

      }

    };
  }


    // STORE REFRESH TOKEN
    async storeRefreshToken(
    userId,
    refreshToken
  ) {

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");


    const expiresAt =
      new Date(
        Date.now() +
        7 *
        24 *
        60 *
        60 *
        1000
      );


    return refreshTokenRepository.create({

      user:
        userId,

      tokenHash,

      expiresAt

    });
  }


    // REFRESH ACCESS TOKEN
    async refreshAccessToken(
    refreshToken
  ) {

    if (!refreshToken) {

      throw new AppError(
        "Refresh token required",

        httpStatus.StatusCodes
          .UNAUTHORIZED
      );
    }


    let decoded;


    try {

      decoded =
        verifyRefreshToken(
          refreshToken
        );

    } catch (error) {

      throw new AppError(
        "Invalid or expired refresh token",

        httpStatus.StatusCodes
          .UNAUTHORIZED
      );
    }


    const tokenHash =
      crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");


    const storedToken =
      await refreshTokenRepository
        .findByTokenHash(
          tokenHash
        );


    if (!storedToken) {

      throw new AppError(
        "Refresh token is invalid or already used",

        httpStatus.StatusCodes
          .UNAUTHORIZED
      );
    }


    const user =
      await authRepository.findById(
        decoded.userId
      );


    if (!user) {

      await refreshTokenRepository
        .deleteById(
          storedToken._id
        );


      throw new AppError(
        "User not found",

        httpStatus.StatusCodes
          .UNAUTHORIZED
      );
    }


    if (
      user.status !==
      ACCOUNT_STATUS.ACTIVE
    ) {

      await refreshTokenRepository
        .deleteById(
          storedToken._id
        );


      throw new AppError(
        "Your account is not active",

        httpStatus.StatusCodes
          .FORBIDDEN
      );
    }


        // TOKEN ROTATION
        await refreshTokenRepository
      .deleteById(
        storedToken._id
      );


    const payload = {

      userId:
        user._id.toString(),

      role:
        user.role

    };


    const newAccessToken =
      generateAccessToken(
        payload
      );


    const newRefreshToken =
      generateRefreshToken(
        payload
      );


    await this.storeRefreshToken(
      user._id,
      newRefreshToken
    );


    return {

      accessToken:
        newAccessToken,

      refreshToken:
        newRefreshToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }

    };
  }


    // LOGOUT
    async logout(
    refreshToken
  ) {

    if (!refreshToken) {
      return;
    }


    const tokenHash =
      crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");


    const storedToken =
      await refreshTokenRepository
        .findByTokenHash(
          tokenHash
        );


    if (storedToken) {

      await refreshTokenRepository
        .deleteById(
          storedToken._id
        );
    }
  }


    // LOGOUT ALL DEVICES
    async logoutAll(
    userId
  ) {

    await refreshTokenRepository
      .deleteByUser(
        userId
      );
  }

}


module.exports =
  new AuthService();