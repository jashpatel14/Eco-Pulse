const { body, param, checkExact } = require("express-validator");

const registerValidator = checkExact([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 255 })
    .withMessage("Email is too long")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
]);

const loginValidator = checkExact([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 255 })
    .withMessage("Email is too long")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Password too long"),
]);

const forgotPasswordValidator = checkExact([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 255 })
    .withMessage("Email is too long")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
]);

const resetPasswordValidator = checkExact([
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Session token is required")
    .isLength({ max: 255 }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
]);

const verifyEmailValidator = checkExact([
  param("token")
    .trim()
    .notEmpty()
    .withMessage("Verification token is required")
    .isLength({ max: 255 })
    .withMessage("Invalid token length"),
]);


const updateProfileValidator = checkExact([
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .escape(),
  body("avatar_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid URL for the avatar"),
]);

const changePasswordValidator = checkExact([
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
]);

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  updateProfileValidator,
  changePasswordValidator,
};
