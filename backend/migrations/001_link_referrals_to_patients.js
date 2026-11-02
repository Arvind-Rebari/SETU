
const db = require("../config/database");

try {
  const migrate = db.transaction(() => {
    // Check whether the migration has already been applied
    const columns = db.prepare(
      "PRAGMA table_info(referrals)"
    ).all();

    const alreadyExists = columns.some(
      column => column.name === "patient_database_id"
    );

    if (alreadyExists) {
      throw new Error(
        "Migration already applied. No changes made."
      );
    }

    // Add a nullable foreign key column
    db.exec(`
      ALTER TABLE referrals
      ADD COLUMN patient_database_id INTEGER
      REFERENCES patients(id)
    `);

    // Link existing referrals to matching patients
    db.exec(`
      UPDATE referrals
      SET patient_database_id = (
        SELECT patients.id
        FROM patients
        WHERE LOWER(TRIM(patients.name)) =
              LOWER(TRIM(referrals.patient_name))
        LIMIT 1
      )
    `);

    // Stop if any referral could not be linked
    const unmatched = db.prepare(`
      SELECT referral_id, patient_name
      FROM referrals
      WHERE patient_database_id IS NULL
    `).all();

    if (unmatched.length > 0) {
      throw new Error(
        "Some referrals could not be matched: " +
        JSON.stringify(unmatched)
      );
    }

    // Add an index for faster patient referral lookups
    db.exec(`
      CREATE INDEX idx_referrals_patient_database_id
      ON referrals(patient_database_id)
    `);

    // Verify foreign key integrity
    const foreignKeyErrors = db.pragma("foreign_key_check");

    if (foreignKeyErrors.length > 0) {
      throw new Error(
        "Foreign key verification failed: " +
        JSON.stringify(foreignKeyErrors)
      );
    }
  });

  migrate();

  console.log("================================");
  console.log("SETU DATABASE MIGRATION SUCCESS");
  console.log("Patient-referral relationships created.");
  console.log("Existing records preserved.");
  console.log("Foreign key check passed.");
  console.log("================================");

} catch (error) {
  console.error("MIGRATION FAILED:", error.message);
  console.error("Transaction rolled back. Check your backup.");

  process.exitCode = 1;

} finally {
  db.close();
}
