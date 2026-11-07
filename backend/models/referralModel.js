
const db = require("../config/database");

// Create the table with all required fields if it does not exist.
// This does not replace or delete an existing table.
db.exec(`
  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referral_id TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_age INTEGER NOT NULL,
    referring_clinic TEXT NOT NULL,
    reason TEXT NOT NULL,
    referral_date TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Normal',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    patient_database_id INTEGER,
    referring_clinic_id INTEGER,
    receiving_clinic_id INTEGER
  )
`);

// Safely backfill referring clinic IDs only when the clinic name
// exactly matches a registered clinic name.
db.exec(`
  UPDATE referrals
  SET referring_clinic_id = (
    SELECT id
    FROM clinics
    WHERE LOWER(TRIM(clinics.name)) =
          LOWER(TRIM(referrals.referring_clinic))
    LIMIT 1
  )
  WHERE referring_clinic_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM clinics
      WHERE LOWER(TRIM(clinics.name)) =
            LOWER(TRIM(referrals.referring_clinic))
    )
`);

// Existing demo records are preserved.
const demoReferrals = [
  ["SETU-1024", "Ananya Sharma", 34, "Sunrise Clinic", "Cardiology consultation", "01 Nov 2026", "Received", "Normal"],
  ["SETU-1025", "Rahul Mehta", 48, "City Health Centre", "Orthopaedic referral", "01 Nov 2026", "Accepted", "Urgent"],
  ["SETU-1026", "Priya Nair", 29, "Green Life Hospital", "General medicine", "31 Oct 2026", "Accepted", "Normal"],
  ["SETU-1027", "Vikram Patel", 56, "Wellness Medical", "Neurology consultation", "31 Oct 2026", "In Review", "Urgent"],
  ["SETU-1028", "Meera Joshi", 41, "Sunrise Clinic", "General check-up", "30 Oct 2026", "In Review", "Normal"]
];

const insertDemoReferral = db.prepare(`
  INSERT OR IGNORE INTO referrals (
    referral_id,
    patient_name,
    patient_age,
    referring_clinic,
    reason,
    referral_date,
    status,
    priority
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const seedReferrals = db.transaction(() => {
  for (const referral of demoReferrals) {
    insertDemoReferral.run(...referral);
  }
});

seedReferrals();

// Shared query for referral details.
const referralSelect = `
  SELECT
    r.*,
    p.patient_id AS patient_code,
    referring.name AS referring_clinic_name,
    receiving.name AS receiving_clinic_name
  FROM referrals r
  LEFT JOIN patients p
    ON p.id = r.patient_database_id
  LEFT JOIN clinics referring
    ON referring.id = r.referring_clinic_id
  LEFT JOIN clinics receiving
    ON receiving.id = r.receiving_clinic_id
`;

// Get all referrals.
function getAllReferrals() {
  return db.prepare(`
    ${referralSelect}
    ORDER BY r.id DESC
  `).all();
}

// Get one referral.
function getReferralById(id) {
  return db.prepare(`
    ${referralSelect}
    WHERE r.id = ?
  `).get(id);
}

// Create a referral with both clinic IDs.
function createReferral(referral) {
  const patient = db.prepare(`
    SELECT id, patient_id, name, age
    FROM patients
    WHERE id = ?
  `).get(referral.patient_database_id);

  if (!patient) {
    throw new Error("Selected patient not found.");
  }

  const referringClinic = db.prepare(`
    SELECT id, clinic_code, name
    FROM clinics
    WHERE id = ?
  `).get(referral.referring_clinic_id);

  if (!referringClinic) {
    throw new Error("Selected referring clinic not found.");
  }

  const receivingClinic = db.prepare(`
    SELECT id, clinic_code, name
    FROM clinics
    WHERE id = ?
  `).get(referral.receiving_clinic_id);

  if (!receivingClinic) {
    throw new Error("Selected receiving clinic not found.");
  }

  if (referringClinic.id === receivingClinic.id) {
    throw new Error("Referring and receiving clinics must be different.");
  }

  const insert = db.prepare(`
    INSERT INTO referrals (
      patient_database_id,
      referring_clinic_id,
      receiving_clinic_id,
      referral_id,
      patient_name,
      patient_age,
      referring_clinic,
      reason,
      referral_date,
      priority
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    patient.id,
    referringClinic.id,
    receivingClinic.id,
    referral.referral_id,
    patient.name,
    patient.age,
    referringClinic.name,
    referral.reason,
    referral.referral_date,
    referral.priority || "Normal"
  );

  return getReferralById(result.lastInsertRowid);
}

// Update referral status.
function updateReferralStatus(id, status) {
  const result = db.prepare(`
    UPDATE referrals
    SET status = ?
    WHERE id = ?
  `).run(status, id);

  if (result.changes === 0) {
    return null;
  }

  return getReferralById(id);
}

module.exports = {
  getAllReferrals,
  getReferralById,
  createReferral,
  updateReferralStatus
};
