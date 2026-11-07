
const db = require("../config/database");

try {
  const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name IN ('clinics')
  `).all();

  if (!tables.some((table) => table.name === "clinics")) {
    throw new Error("Clinics table does not exist.");
  }

  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        conversation_id TEXT NOT NULL,
        sender_clinic_id INTEGER NOT NULL,
        receiver_clinic_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0
          CHECK (is_read IN (0, 1)),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (sender_clinic_id)
          REFERENCES clinics(id),

        FOREIGN KEY (receiver_clinic_id)
          REFERENCES clinics(id)
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation
      ON messages(conversation_id, created_at);

      CREATE INDEX IF NOT EXISTS idx_messages_receiver
      ON messages(receiver_clinic_id, is_read);
    `);
  })();

  console.log("MESSAGES MIGRATION SUCCESS");
  console.log("Messages table is ready.");
} catch (error) {
  console.error("MESSAGES MIGRATION FAILED:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
