
const db = require("../config/database");

// Create referrals table
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Demo referral records
const demoReferrals = [
  ["SETU-1024", "Ananya Sharma", 34, "Sunrise Clinic", "Cardiology consultation", "01 Nov 2026", "Received", "Normal"],
  ["SETU-1025", "Rahul Mehta", 48, "City Health Centre", "Orthopaedic referral", "01 Nov 2026", "Accepted", "Urgent"],
  ["SETU-1026", "Priya Nair", 29, "Green Life Hospital", "General medicine", "31 Oct 2026", "Accepted", "Normal"],
  ["SETU-1027", "Vikram Patel", 56, "Wellness Medical", "Neurology consultation", "31 Oct 2026", "In Review", "Urgent"],
  ["SETU-1028", "Meera Joshi", 41, "Sunrise Clinic", "General check-up", "30 Oct 2026", "In Review", "Normal"]
];

const insertReferral = db.prepare(`
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
    insertReferral.run(...referral);
  }
});

seedReferrals();

// Get all referrals
function getAllReferrals() {
  return db.prepare(`
    SELECT
      r.*,
      p.patient_id AS patient_code
    FROM referrals r
    LEFT JOIN patients p
      ON p.id = r.patient_database_id
    ORDER BY r.id DESC
  `).all();
}

// Get one referral
function getReferralById(id) {
  return db.prepare(`
    SELECT
      r.*,
      p.patient_id AS patient_code
    FROM referrals r
    LEFT JOIN patients p
      ON p.id = r.patient_database_id
    WHERE r.id = ?
  `).get(id);
}

// Create referral using an existing patient
function createReferral(referral) {
  // Fetch selected patient
  const patient = db.prepare(`
    SELECT id, patient_id, name, age
    FROM patients
    WHERE id = ?
  `).get(referral.patient_database_id);

  if (!patient) {
    throw new Error("Selected patient not found.");
  }

  // Insert referral with patient details
  const insert = db.prepare(`
    INSERT INTO referrals (
      patient_database_id,
      referral_id,
      patient_name,
      patient_age,
      referring_clinic,
      reason,
      referral_date,
      priority
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    patient.id,
    referral.referral_id,
    patient.name,
    patient.age,
    referral.referring_clinic,
    referral.reason,
    referral.referral_date,
    referral.priority || "Normal"
  );

  return getReferralById(result.lastInsertRowid);
}

// Update referral status
function updateReferralStatus(id, status) {
  const update = db.prepare(`
    UPDATE referrals
    SET status = ?
    WHERE id = ?
  `);

  const result = update.run(status, id);

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
