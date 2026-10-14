const jwt =
  require("jsonwebtoken");


// ACCESS TOKEN
const generateAccessToken =
  (payload) => {

    return jwt.sign(
      payload,

      process.env.JWT_ACCESS_SECRET,

      {
        expiresIn:
          process.env.JWT_ACCESS_EXPIRE ||
          "15m"
      }
    );
  };


// REFRESH TOKEN
const generateRefreshToken =
  (payload) => {

    return jwt.sign(
      payload,

      process.env.JWT_REFRESH_SECRET,

      {
        expiresIn:
          process.env.JWT_REFRESH_EXPIRE ||
          "7d"
      }
    );
  };


// VERIFY ACCESS TOKEN
const verifyAccessToken =
  (token) => {

    return jwt.verify(
      token,

      process.env.JWT_ACCESS_SECRET
    );
  };


// VERIFY REFRESH TOKEN
const verifyRefreshToken =
  (token) => {

    return jwt.verify(
      token,

      process.env.JWT_REFRESH_SECRET
    );
  };


module.exports = {

  generateAccessToken,

  generateRefreshToken,

  verifyAccessToken,

  verifyRefreshToken

};