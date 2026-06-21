const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  res.status(201).json({ success: true, ...data });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body.identifier, req.body.password);
  res.status(200).json({ success: true, ...data });
});

const firebaseLogin = asyncHandler(async (req, res) => {
  const data = await authService.loginFirebaseUser(req.body.idToken);
  res.status(200).json({ success: true, ...data });
});

const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refreshSession(req.body.refreshToken);
  res.status(200).json({ success: true, ...data });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id, req.body.refreshToken);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = {
  register,
  login,
  firebaseLogin,
  refresh,
  logout,
  me,
};
