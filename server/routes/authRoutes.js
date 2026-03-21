const express = require("express");
const { validationResult } = require("express-validator");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator,
} = require("../middleware/validators");
const {
  register,
  login,
  getProfile,
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
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);

// ─── Protected Routes ────────────────────────────────────
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
