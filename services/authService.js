const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signAccessToken, signRefreshToken } = require("../utils/token");

function authPayload(user, refreshToken) {
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
    accessToken: signAccessToken(user),
    refreshToken,
  };
}

async function registerUser(data) {
  const user = await User.create(data);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken });
  await user.save();
  return authPayload(user, refreshToken);
}

async function loginUser(identifier, password) {
  const query = identifier.includes("@")
    ? { email: identifier.toLowerCase() }
    : { phone: identifier };
  const user = await User.findOne(query).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken });
  await user.save();
  return authPayload(user, refreshToken);
}

async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError("Invalid refresh token", 401);
  }

  const tokenExists = user.refreshTokens.some((item) => item.token === refreshToken);
  if (!tokenExists) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  const nextRefreshToken = signRefreshToken(user);
  user.refreshTokens = user.refreshTokens
    .filter((item) => item.token !== refreshToken)
    .concat({ token: nextRefreshToken });
  await user.save();

  return authPayload(user, nextRefreshToken);
}

async function logoutUser(userId, refreshToken) {
  const user = await User.findById(userId);
  if (!user) return;

  user.refreshTokens = refreshToken
    ? user.refreshTokens.filter((item) => item.token !== refreshToken)
    : [];
  await user.save();
}

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
};
