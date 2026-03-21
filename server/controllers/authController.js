const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const logger = require("../utils/logger");
const { sendResetPasswordEmail } = require("../utils/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

const register = async (req, res) => {
  try {
    const { loginId, email, password, role } = req.body;

    if (!loginId || loginId.length < 6 || loginId.length > 12) {
      return res.status(400).json({ message: "Login ID must be between 6 and 12 characters." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, and a special character."
      });
    }

    const validRoles = ["ENGINEERING_USER", "APPROVER", "OPERATIONS_USER"];
    const assignedRole = (role && validRoles.includes(role)) ? role : "ENGINEERING_USER";

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ loginId }, { email }] }
    });

    if (existingUser) {
      if (existingUser.loginId === loginId) {
        return res.status(409).json({ message: "Login ID already taken." });
      }
      return res.status(409).json({ message: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        password: hashedPassword,
        name: loginId,
        role: assignedRole,
        is_verified: true,
      }
    });

    logger.info(`New user registered: ${user.loginId}`);
    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (error) {
    logger.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await prisma.user.findUnique({ where: { loginId } });

    // Use a dummy hash when user not found to prevent timing-based username enumeration
    const DUMMY_HASH = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
    const validPassword = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

    if (!user || !validPassword) {
      return res.status(401).json({ message: "Invalid Login Id or Password" });
    }

    const payload = {
      id: user.id,
      loginId: user.loginId,
      role: user.role,
      name: user.name,
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    logger.info(`Successful login for user: ${user.loginId}`);
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email, loginId: user.loginId }
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, loginId: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Fields required" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid current password" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, and a special character."
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });

    logger.info(`User changed password: ${user.loginId}`);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.eCOApprovalRule.deleteMany({ where: { userId } }),
      prisma.eCODraftChange.deleteMany({ where: { eco: { userId } } }),
      prisma.eCO.deleteMany({ where: { userId } }),
      prisma.auditLog.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
    logger.info(`User account deleted: ${userId}`);
    res.json({ message: "Account entirely removed from EcoPulse" });
  } catch (error) {
    logger.error("Delete account error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.emailToken.deleteMany({ where: { user_id: user.id, type: "password_reset" } });

    await prisma.emailToken.create({
      data: { user_id: user.id, token_hash: tokenHash, type: "password_reset", expires_at: expiresAt }
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendResetPasswordEmail(user.email, user.name, resetUrl);

    logger.info(`Password reset token sent to: ${user.email}`);
    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: "Token, email, and new password are required." });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 special character."
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset link." });

    const emailToken = await prisma.emailToken.findFirst({
      where: { user_id: user.id, token_hash: tokenHash, type: "password_reset", expires_at: { gt: new Date() } }
    });

    if (!emailToken) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
      prisma.emailToken.deleteMany({ where: { user_id: user.id, type: "password_reset" } })
    ]);

    logger.info(`Password successfully reset for: ${user.email}`);
    res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, getProfile, changePassword, deleteAccount, forgotPassword, resetPassword };
