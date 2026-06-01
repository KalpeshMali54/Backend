const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" },
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id.toString(), tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d" },
  );
}

module.exports = { signAccessToken, signRefreshToken };
