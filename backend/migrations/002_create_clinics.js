
const db = require("../config/database");

function columnExists(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .some((column) => column.name === columnName);
}

try {
  db.transaction(() => {
    // Create clinics table
    db.exec(`
      CREATE TABLE IF NOT EXISTS clinics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clinic_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Register the existing clinic
    db.prepare(`
      INSERT OR IGNORE INTO clinics (clinic_code, name)
      VALUES (?, ?)
    `).run("SETU-CLINIC-001", "Sunrise Clinic");

    // Add clinic relationships to existing referrals
    if (!columnExists("referrals", "referring_clinic_id")) {
      db.exec(`
        ALTER TABLE referrals
        ADD COLUMN referring_clinic_id INTEGER
        REFERENCES clinics(id);
      `);
    }

    if (!columnExists("referrals", "receiving_clinic_id")) {
      db.exec(`
        ALTER TABLE referrals
        ADD COLUMN receiving_clinic_id INTEGER
        REFERENCES clinics(id);
      `);
    }

    // Link existing Sunrise Clinic referrals
    const sunrise = db.prepare(`
      SELECT id FROM clinics
      WHERE clinic_code = ?
    `).get("SETU-CLINIC-001");

    db.prepare(`
      UPDATE referrals
      SET referring_clinic_id = ?
      WHERE referring_clinic_id IS NULL
      AND referring_clinic = ?
    `).run(sunrise.id, "Sunrise Clinic");
  })();

  console.log("SETU CLINIC MIGRATION SUCCESS");
  console.log("Clinics table created.");
  console.log("Existing Sunrise Clinic referrals linked.");
  console.log("Existing patient and referral records preserved.");
} catch (error) {
  console.error("SETU CLINIC MIGRATION FAILED:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
