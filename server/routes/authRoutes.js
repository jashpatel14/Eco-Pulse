const express = require("express");
const { validationResult } = require("express-validator");
const { authMiddleware } = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter } = require("../middleware/securityMiddleware");
const {
  registerValidator,
  loginValidator,
} = require("../middleware/validators");
const {
  register,
  login,
  getProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
  logout
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
router.post("/register", registerLimiter, registerValidator, validate, register);
router.post("/login", loginLimiter, loginValidator, validate, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.post("/logout", logout);

// ─── Protected Routes ────────────────────────────────────
router.get("/profile", authMiddleware, getProfile);
router.post("/change-password", authMiddleware, changePassword);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;
