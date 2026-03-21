const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");

// GET /api/v1/notifications — current user's notifications (last 20)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    logger.error("GET /notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    logger.error("PATCH /notifications/:id/read error:", err);
    res.status(500).json({ message: "Failed to mark notification as read." });
  }
});

// PATCH /api/v1/notifications/read-all
router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    logger.error("PATCH /notifications/read-all error:", err);
    res.status(500).json({ message: "Failed to mark all notifications as read." });
  }
});

module.exports = router;
