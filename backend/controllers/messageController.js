
const messageModel = require("../models/messageModel");

function getMessages(req, res) {
  try {
    const { conversation_id, clinic_id } = req.query;

    if (conversation_id) {
      const messages =
        messageModel.getMessagesByConversation(String(conversation_id));

      return res.json({
        success: true,
        count: messages.length,
        messages
      });
    }

    if (clinic_id) {
      const messages = messageModel.getAllMessages().filter(
        (item) =>
          Number(item.sender_clinic_id) === Number(clinic_id) ||
          Number(item.receiver_clinic_id) === Number(clinic_id)
      );

      return res.json({
        success: true,
        count: messages.length,
        messages
      });
    }

    return res.status(400).json({
      success: false,
      message: "Please provide a conversation ID or clinic ID."
    });
  } catch (error) {
    console.error("Get messages error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch messages."
    });
  }
}

function addMessage(req, res) {
  try {
    const {
      conversation_id,
      sender_clinic_id,
      receiver_clinic_id,
      message
    } = req.body;

    if (
      !conversation_id ||
      !Number.isInteger(Number(sender_clinic_id)) ||
      Number(sender_clinic_id) <= 0 ||
      !Number.isInteger(Number(receiver_clinic_id)) ||
      Number(receiver_clinic_id) <= 0 ||
      !message ||
      !String(message).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversation, sender, receiver and message are required."
      });
    }

    if (Number(sender_clinic_id) === Number(receiver_clinic_id)) {
      return res.status(400).json({
        success: false,
        message: "Sender and receiver clinics must be different."
      });
    }

    const cleanMessage = String(message).trim();

    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters."
      });
    }

    const createdMessage = messageModel.createMessage({
      message_id: "SETU-MSG-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
      conversation_id: String(conversation_id).trim(),
      sender_clinic_id: Number(sender_clinic_id),
      receiver_clinic_id: Number(receiver_clinic_id),
      message: cleanMessage
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: createdMessage
    });
  } catch (error) {
    console.error("Add message error:", error.message);

    if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({
        success: false,
        message: "Selected sender or receiver clinic does not exist."
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to send message."
    });
  }
}

function markAsRead(req, res) {
  try {
    const { clinic_id } = req.body;
    const { conversationId } = req.params;

    if (!Number.isInteger(Number(clinic_id)) || Number(clinic_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid clinic ID is required."
      });
    }

    const updatedCount = messageModel.markConversationAsRead(
      String(conversationId),
      Number(clinic_id)
    );

    return res.json({
      success: true,
      message: "Messages marked as read.",
      updatedCount
    });
  } catch (error) {
    console.error("Mark messages as read error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update message status."
    });
  }
}

function getUnreadCount(req, res) {
  try {
    const clinicId = Number(req.params.clinicId);

    if (!Number.isInteger(clinicId) || clinicId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid clinic ID is required."
      });
    }

    const count = messageModel.getUnreadCount(clinicId);

    return res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Unread count error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch unread count."
    });
  }
}

module.exports = {
  getMessages,
  addMessage,
  markAsRead,
  getUnreadCount
};
