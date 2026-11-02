
const db = require("../config/database");

try {
  const insertClinic = db.prepare(`
    INSERT OR IGNORE INTO clinics (clinic_code, name, address)
    VALUES (?, ?, ?)
  `);

  insertClinic.run(
    "SETU-CLINIC-002",
    "City Care Hospital",
    "Pune, Maharashtra"
  );

  const clinics = db.prepare(`
    SELECT id, clinic_code, name, address
    FROM clinics
    ORDER BY id
  `).all();

  console.log("\nSETU REGISTERED CLINICS");
  console.table(clinics);

  console.log("Second clinic registered successfully.");
} catch (error) {
  console.error("CLINIC REGISTRATION FAILED:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
