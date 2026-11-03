
const db = require("../config/database");

try {
  const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name IN ('patients', 'clinics')
  `).all();

  const existingTables = tables.map((table) => table.name);

  if (!existingTables.includes("patients")) {
    throw new Error("Patients table does not exist.");
  }

  if (!existingTables.includes("clinics")) {
    throw new Error("Clinics table does not exist.");
  }

  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id TEXT UNIQUE NOT NULL,
        patient_id INTEGER NOT NULL,
        clinic_id INTEGER,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        doctor_name TEXT,
        purpose TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Scheduled'
          CHECK (
            status IN (
              'Scheduled',
              'Confirmed',
              'Completed',
              'Cancelled',
              'No Show'
            )
          ),
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (clinic_id) REFERENCES clinics(id)
      );
    `);
  })();

  console.log("APPOINTMENTS MIGRATION SUCCESS");
  console.log("Appointments table is ready.");
} catch (error) {
  console.error("APPOINTMENTS MIGRATION FAILED:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
