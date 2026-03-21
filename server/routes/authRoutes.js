const express = require("express");
const { validationResult } = require("express-validator");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require("../middleware/validators");
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
} = require("../middleware/securityMiddleware");
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  logout,
  refresh,
  updateProfile,
  changePassword,
  deleteAccount,
  googleRedirect,
  googleCallback,
} = require("../controllers/authController");

const router = express.Router();

// ─── Validation Result Middleware ─────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors
        .array()
        .map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// ─── Public Routes ───────────────────────────────────────
router.post(
  "/register",
  registerLimiter,
  registerValidator,
  validate,
  register,
);
router.post("/login", loginLimiter, loginValidator, validate, login);
router.get("/verify-email/:token", verifyEmailValidator, validate, verifyEmail); // Reverted to GET for link flow
router.post("/refresh", refreshLimiter, refresh);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordValidator,
  validate,
  forgotPassword,
);
router.post(
  "/reset-password", // session ID and password both in body
  forgotPasswordLimiter,
  resetPasswordValidator,
  validate,
  resetPassword,
);
router.get("/google", googleRedirect);
router.get("/google/callback", refreshLimiter, googleCallback);

// ─── Protected Routes ────────────────────────────────────
router.get("/profile", authMiddleware, getProfile);
router.patch(
  "/profile",
  authMiddleware,
  updateProfileValidator,
  validate,
  updateProfile,
);
router.post(
  "/change-password",
  authMiddleware,
  changePasswordValidator,
  validate,
  changePassword,
);
router.post("/logout", authMiddleware, logout);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;
