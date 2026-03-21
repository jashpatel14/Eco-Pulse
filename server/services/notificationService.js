/**
 * notificationService.js — Helper to create notifications.
 */
const prisma = require("../config/prisma");
const logger = require("../utils/logger");

/**
 * @param {string} userId - Recipient user UUID
 * @param {string} message - Notification message text
 * @param {string|null} link - Optional relative URL to navigate to on click
 */
const createNotification = async (userId, message, link = null) => {
  try {
    return await prisma.notification.create({
      data: { userId, message, link },
    });
  } catch (err) {
    logger.error("Failed to create notification:", err);
    return null;
  }
};

module.exports = { createNotification };
