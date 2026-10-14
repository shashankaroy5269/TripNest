
const express =
  require("express");


// CONTROLLERS
const authController =
  require(
    "../controllers/auth.controller"
  );

const userController =
  require(
    "../controllers/user.controller"
  );


// MIDDLEWARES
const validate =
  require(
    "../middlewares/validate.middleware"
  );

const authenticate =
  require(
    "../middlewares/auth.middleware"
  );

const asyncHandler =
  require(
    "../utils/asyncHandler"
  );


// VALIDATORS
const {
  registerSchema,
  loginSchema
} =
  require(
    "../validators/auth.validator"
  );

const {
  forgotPasswordSchema,
  resetPasswordSchema
} =
  require(
    "../validators/user.validator"
  );


// ROUTER
const router =
  express.Router();


// REGISTER

router.post(
  "/register",
  validate(
    registerSchema
  ),
  asyncHandler(
    authController.register
  )
);

// ADMIN SETUP STATUS & ADMIN REGISTRATION
router.get(
  "/admin/setup-status",
  asyncHandler(
    authController.checkAdminSetup
  )
);

router.post(
  "/register-admin",
  asyncHandler(
    authController.registerAdmin
  )
);


// VERIFY EMAIL (GET & POST)
router.get(
  "/verify-email",
  asyncHandler(
    authController.verifyEmail
  )
);

router.post(
  "/verify-email",
  asyncHandler(
    authController.verifyEmail
  )
);

// GET CURRENT USER PROFILE
router.get(
  "/me",
  authenticate,
  asyncHandler(
    userController.getProfile
  )
);


// RESEND VERIFICATION
router.post(
  "/resend-verification",
  asyncHandler(
    authController.resendVerification
  )
);


// LOGIN

router.post(

  "/login",

  validate(
    loginSchema
  ),

  asyncHandler(
    authController.login
  )

);


// REFRESH TOKEN

router.post(

  "/refresh-token",

  asyncHandler(
    authController.refreshToken
  )

);


// LOGOUT

router.post(

  "/logout",

  asyncHandler(
    authController.logout
  )

);


// LOGOUT ALL DEVICES

router.post(

  "/logout-all",

  authenticate,

  asyncHandler(
    authController.logoutAll
  )

);


// FORGOT PASSWORD

router.post(

  "/forgot-password",

  validate(
    forgotPasswordSchema
  ),

  asyncHandler(
    userController.forgotPassword
  )

);


// RESET PASSWORD

router.post(

  "/reset-password",

  validate(
    resetPasswordSchema
  ),

  asyncHandler(
    userController.resetPassword
  )

);


// EXPORT ROUTER
module.exports =
  router;
