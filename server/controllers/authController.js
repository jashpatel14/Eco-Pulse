const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const logger = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// ─── Register ────────────────────────────────────────────
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
        message: "Password must be at least 8 characters long, contains at least one uppercase letter, one lowercase letter, and one special character." 
      });
    }

    // Role Validation (Exclude ADMIN for security)
    const validRoles = ["ENGINEERING_USER", "APPROVER", "OPERATIONS_USER"];
    const assignedRole = (role && validRoles.includes(role)) ? role : "ENGINEERING_USER";

    // 2. Check Uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { loginId: loginId },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.loginId === loginId) {
        return res.status(409).json({ message: "Login ID already taken." });
      }
      return res.status(409).json({ message: "Email already registered." });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        password: hashedPassword,
        name: loginId, // Use loginId as default name
        role: assignedRole,
        is_verified: true, // Auto-verify for now as per previous simplification context but keeping it safe
      }
    });

    logger.info(`New user registered: ${user.loginId}`);
    res.status(201).json({ message: "Registration successful. Please log in." });

  } catch (error) {
    logger.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Login ───────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { loginId }
    });

    // 2. Compare Password (Always use a dummy if user not found to prevent timing attacks)
    const DUMMY_HASH = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
    const validPassword = await bcrypt.compare(
      password,
      user ? user.password : DUMMY_HASH
    );

    if (!user || !validPassword) {
      return res.status(401).json({ message: "Invalid Login Id or Password" });
    }

    // 3. Generate JWT
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
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        loginId: user.loginId
      }
    });

  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Profile ────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        loginId: true
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Account Management ───────────────────────────────────
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
        message: "Password must be at least 8 characters long, contains at least one uppercase letter, one lowercase letter, and one special character." 
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    
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
    // Transactionally wipe everything associated with this user to satisfy foreign key rules
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

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  deleteAccount
};
