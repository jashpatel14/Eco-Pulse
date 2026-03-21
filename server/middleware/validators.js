const { body, checkExact } = require("express-validator");

const registerValidator = checkExact([
  body("loginId")
    .trim()
    .notEmpty()
    .withMessage("Login ID is required")
    .isLength({ min: 6, max: 12 })
    .withMessage("Login ID must be between 6 and 12 characters")
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one special character",
    ),
]);

const loginValidator = checkExact([
  body("loginId")
    .trim()
    .notEmpty()
    .withMessage("Login ID is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
]);

module.exports = {
  registerValidator,
  loginValidator,
};
