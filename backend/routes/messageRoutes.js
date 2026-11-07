
const express = require("express");
const router = express.Router();

const {
  getMessages,
  addMessage,
  markAsRead,
  getUnreadCount
} = require("../controllers/messageController");

// Get messages by conversation or clinic
router.get("/", getMessages);

// Get unread message count
router.get("/unread/:clinicId", getUnreadCount);

// Send a new message
router.post("/", addMessage);

// Mark conversation messages as read
router.patch("/:conversationId/read", markAsRead);

module.exports = router;
