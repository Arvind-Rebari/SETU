
const db = require("../config/database");

function getAllMessages() {
  return db.prepare(`
    SELECT
      m.*,
      sender.name AS sender_clinic_name,
      receiver.name AS receiver_clinic_name
    FROM messages m
    LEFT JOIN clinics sender
      ON m.sender_clinic_id = sender.id
    LEFT JOIN clinics receiver
      ON m.receiver_clinic_id = receiver.id
    ORDER BY m.created_at ASC, m.id ASC
  `).all();
}

function getMessagesByConversation(conversationId) {
  return db.prepare(`
    SELECT
      m.*,
      sender.name AS sender_clinic_name,
      receiver.name AS receiver_clinic_name
    FROM messages m
    LEFT JOIN clinics sender
      ON m.sender_clinic_id = sender.id
    LEFT JOIN clinics receiver
      ON m.receiver_clinic_id = receiver.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC, m.id ASC
  `).all(conversationId);
}

function createMessage(message) {
  const result = db.prepare(`
    INSERT INTO messages (
      message_id,
      conversation_id,
      sender_clinic_id,
      receiver_clinic_id,
      message
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(
    message.message_id,
    message.conversation_id,
    message.sender_clinic_id,
    message.receiver_clinic_id,
    message.message
  );

  return db.prepare(`
    SELECT * FROM messages WHERE id = ?
  `).get(result.lastInsertRowid);
}

function markConversationAsRead(conversationId, receiverClinicId) {
  return db.prepare(`
    UPDATE messages
    SET is_read = 1
    WHERE conversation_id = ?
      AND receiver_clinic_id = ?
      AND is_read = 0
  `).run(conversationId, receiverClinicId).changes;
}

function getUnreadCount(clinicId) {
  return db.prepare(`
    SELECT COUNT(*) AS count
    FROM messages
    WHERE receiver_clinic_id = ?
      AND is_read = 0
  `).get(clinicId).count;
}

module.exports = {
  getAllMessages,
  getMessagesByConversation,
  createMessage,
  markConversationAsRead,
  getUnreadCount
};
