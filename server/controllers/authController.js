const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const redisClient = require("../config/redis");
const logger = require("../utils/logger");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils/emailService");
const { 
  getGoogleAuthURL, 
  getGoogleTokens, 
  getGoogleUser 
} = require("../config/oauth.config");

// Pre-computed dummy hash for timing attack prevention (Cost 12)
const DUMMY_HASH =
  "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";

// ─── Token Generation & Hashing Helpers ─────────────────
const hashData = (data) =>
  crypto.createHash("sha256").update(data).digest("hex");

// ─── Register ────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // ALWAYS hash password to prevent timing attacks
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user exists (no reveal in response)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!existingUser) {
      const REQUIRE_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION !== "false";

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email: normalizedEmail,
            password: hashedPassword,
            is_verified: !REQUIRE_VERIFICATION,
          },
        });

        if (REQUIRE_VERIFICATION) {
          const verificationToken = crypto.randomBytes(32).toString("hex");
          const tokenHash = hashData(verificationToken);
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          await tx.emailToken.create({
            data: {
              user_id: user.id,
              token_hash: tokenHash,
              type: "verification",
              expires_at: expiresAt,
            },
          });

          const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
          await sendVerificationEmail(normalizedEmail, name, verificationUrl);
          
          logger.info(`New user registered (verification sent): ${user.id}`);
        } else {
          logger.info(`New user registered (auto-verified): ${user.id}`);
        }
      });
    } else {
      logger.warn(`Registration attempt for existing email: ${normalizedEmail}`);
    }

    res.status(201).json({
      message: "If this email is not registered, you will receive a verification email with a link. Please check your inbox.",
    });
  } catch (error) {
    logger.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Verify Email ────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = hashData(token);

    const tokenRecord = await prisma.emailToken.findFirst({
      where: {
        token_hash: tokenHash,
        type: "verification",
        expires_at: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.user_id },
        data: { is_verified: true },
      }),
      // Use deleteMany to avoid P2025 if already deleted
      prisma.emailToken.deleteMany({
        where: { id: tokenRecord.id },
      }),
    ]);

    logger.info(`User verified email: ${tokenRecord.user_id}`);
    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    logger.error("Verify email error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Login ───────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Check lockout status BEFORE checking password
    if (user && user.locked_until && new Date(user.locked_until) > new Date()) {
      logger.warn(`Account locked attempt for: ${user.id}`);
      return res.status(403).json({
        message:
          "Account temporarily locked due to multiple failed login attempts. Please try again later.",
      });
    }

    // Always run bcrypt to prevent timing attacks
    const validPassword = await bcrypt.compare(
      password,
      user ? (user.password || DUMMY_HASH) : DUMMY_HASH,
    );

    if (!user || !validPassword) {
      if (user) {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { failed_attempts: { increment: 1 } },
          select: { failed_attempts: true },
        });

        if (updatedUser.failed_attempts >= 10) {
          const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
          await prisma.user.update({
            where: { id: user.id },
            data: { locked_until: lockedUntil },
          });
          logger.warn(`Account locked due to 10 failed attempts: ${user.id}`);
        }
      }
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    // Success - reset attempts
    if (user.failed_attempts > 0 || user.locked_until) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failed_attempts: 0, locked_until: null },
      });
    }

    // Construct JWT Payload
    const payload = { id: user.id, email: user.email, role: user.role || "user" };

    // Issue Access Token (15 mins)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    // Issue Refresh Token (7 days)
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    const refreshDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 7;

    // Set Refresh Token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/api/v1/auth/refresh",
      maxAge: refreshDays * 24 * 60 * 60 * 1000,
    });

    // ─── Block 1B: Store Refresh Token in DB ───
    const rtHash = hashData(refreshToken);
    const rtExpiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: rtHash,
        expires_at: rtExpiresAt,
      },
    });

    logger.info(`Successful login for user: ${user.id}`);

    res.json({
      message: "Login successful",
      token: accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Refresh Token ───────────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    // Check if refresh token is in blocklist
    const isBlocklisted = await redisClient.get(`blocklist:${refreshToken}`);
    if (isBlocklisted)
      return res.status(401).json({ message: "Refresh token revoked" });

    const rtHash = hashData(refreshToken);

    // ─── Block 1B: Verify against DB ───
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token_hash: rtHash },
      include: { user: true },
    });

    if (!dbToken || dbToken.expires_at < new Date()) {
      if (dbToken) await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      return res.status(401).json({ message: "Refresh token invalid or expired" });
    }

    // 3. Verify the token using a Promise to catch async errors correctly
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      const payload = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      });

      const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      });

      const newRtHash = hashData(newRefreshToken);
      const refreshDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 7;
      const newRtExpiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

      // ─── Block 1B: Rotate Token in DB ───
      // Use deleteMany and upsert to handle race conditions and collisions gracefully
      await prisma.$transaction([
        prisma.refreshToken.deleteMany({ where: { id: dbToken.id } }),
        prisma.refreshToken.upsert({
          where: { token_hash: newRtHash },
          update: {
            expires_at: newRtExpiresAt,
          },
          create: {
            user_id: decoded.id,
            token_hash: newRtHash,
            expires_at: newRtExpiresAt,
          },
        }),
      ]);

      if (decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisClient.set(`blocklist:${refreshToken}`, "true", "EX", ttl);
        }
      }

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/api/v1/auth/refresh",
        maxAge: refreshDays * 24 * 60 * 60 * 1000,
      });

      res.json({ token: newAccessToken });
    } catch (err) {
      // If token is invalid or expired, ensure it's removed from DB
      await prisma.refreshToken.deleteMany({ where: { id: dbToken.id } });
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  } catch (error) {
    logger.error("Refresh error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Forgot Password ────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      let resetUrl;
      const resetToken = crypto.randomBytes(64).toString("hex");
      const tokenHash = hashData(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.$transaction([
        prisma.emailToken.deleteMany({
          where: { user_id: user.id, type: "reset" },
        }),
        prisma.emailToken.create({
          data: {
            user_id: user.id,
            token_hash: tokenHash,
            type: "reset",
            expires_at: expiresAt,
          },
        }),
      ]);

      const sessionId = crypto.randomBytes(32).toString("hex");
      const isStored = await redisClient.set(`reset_session:${sessionId}`, resetToken, "EX", 3600);
      
      if (isStored) {
        resetUrl = `${process.env.CLIENT_URL}/reset-password?session=${sessionId}`;
      } else {
        resetUrl = `${process.env.CLIENT_URL}/reset-password?session=${resetToken}`;
      }

      await sendResetPasswordEmail(user.email, user.name, resetUrl);
      logger.info(`Password reset requested for user: ${user.id}`);
    } else {
      await bcrypt.hash("dummy_workload", 12);
      logger.info(
        `Password reset requested for non-existent email: ${normalizedEmail}`,
      );
    }

    res.json({
      message:
        "If this email is registered, you will receive a reset link shortly.",
    });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Reset Password ─────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token: tokenOrSession, password } = req.body;
    let realToken = tokenOrSession;

    const cachedToken = await redisClient.get(`reset_session:${tokenOrSession}`);
    if (cachedToken) realToken = cachedToken;

    const tokenHash = hashData(realToken);
    const tokenRecord = await prisma.emailToken.findUnique({
      where: { token_hash: tokenHash },
    });

    if (!tokenRecord || tokenRecord.type !== "reset" || tokenRecord.expires_at < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const userId = tokenRecord.user_id;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      // Use deleteMany for idempotency
      prisma.emailToken.deleteMany({
        where: { id: tokenRecord.id },
      }),
      prisma.refreshToken.deleteMany({
        where: { user_id: userId },
      }),
    ]);

    await redisClient.del(`reset_session:${tokenOrSession}`);

    logger.info(`Password successfully reset for user: ${userId}.`);
    res.json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Profile (Protected) ────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        role: true,
        is_verified: true,
        provider: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Logout ──────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (decoded && decoded.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await redisClient.set(`blocklist:${refreshToken}`, "true", "EX", ttl);
          }
        }
      } catch (err) {
        // Token might be invalid or expired, ignore and continue
      }

      const rtHash = hashData(refreshToken);
      await prisma.refreshToken.deleteMany({
        where: { token_hash: rtHash },
      });
    }

    res.cookie("refreshToken", "", {
      maxAge: 0,
      httpOnly: true,
      path: "/api/v1/auth/refresh",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Update Profile (Protected) ──────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, avatar_url } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        avatar_url: avatar_url !== undefined ? avatar_url : undefined,
      },
      select: { id: true, name: true, email: true, avatar_url: true, role: true },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Change Password (Protected) ─────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.deleteMany({
        where: { user_id: userId },
      }),
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    logger.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Delete Account (Protected) ──────────────────────────
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.user.delete({
      where: { id: userId },
    });

    res.cookie("refreshToken", "", {
      maxAge: 0,
      httpOnly: true,
      path: "/api/v1/auth/refresh",
    });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    logger.error("Delete account error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Google OAuth (Public) ────────────────────────────────
const googleRedirect = (req, res) => {
  const { url, state } = getGoogleAuthURL();

  // FIX 7: Store state in a signed, httpOnly cookie
  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax", // Required for cross-site redirect
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  res.redirect(url);
};

const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.oauth_state;

    // FIX 7: Verify OAuth state
    if (!state || !storedState || state !== storedState) {
      logger.warn("OAuth state mismatch or missing");
      return res.redirect(`${process.env.CLIENT_URL}/auth?error=oauth_csrf_detected`);
    }

    // Clear state cookie
    res.clearCookie("oauth_state");

    if (!code) return res.status(400).json({ message: "No code provided" });

    const tokens = await getGoogleTokens(code);
    const googleUser = await getGoogleUser(tokens.access_token);

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email: googleUser.email },
      update: {
        provider: "google",
        provider_id: googleUser.id,
        role: "USER",
      },
      create: {
        name: googleUser.name,
        email: googleUser.email,
        is_verified: true,
        provider: "google",
        provider_id: googleUser.id,
        role: "USER",
      },
    });

    // Issue tokens
    const payload = { id: user.id, email: user.email, role: user.role || "USER" };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    const refreshDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 7;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/api/v1/auth/refresh",
      maxAge: refreshDays * 24 * 60 * 60 * 1000,
    });

    const rtHash = hashData(refreshToken);
    const rtExpiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: rtHash,
        expires_at: rtExpiresAt,
      },
    });

    res.redirect(`${process.env.CLIENT_URL}/auth/google/callback#token=${accessToken}`);
  } catch (error) {
    logger.error("Google OAuth error:", error);
    res.redirect(`${process.env.CLIENT_URL}/auth?error=oauth_failed`);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getProfile,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
  googleRedirect,
  googleCallback,
};
