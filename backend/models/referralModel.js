
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
  [
    "SETU-1024",
    "Ananya Sharma",
    34,
    "Sunrise Clinic",
    "Cardiology consultation",
    "01 Nov 2026",
    "Received",
    "Normal"
  ],
  [
    "SETU-1025",
    "Rahul Mehta",
    48,
    "City Health Centre",
    "Orthopaedic referral",
    "01 Nov 2026",
    "Pending",
    "Urgent"
  ],
  [
    "SETU-1026",
    "Priya Nair",
    29,
    "Green Life Hospital",
    "General medicine",
    "31 Oct 2026",
    "Accepted",
    "Normal"
  ],
  [
    "SETU-1027",
    "Vikram Patel",
    56,
    "Wellness Medical",
    "Neurology consultation",
    "31 Oct 2026",
    "In Review",
    "Urgent"
  ],
  [
    "SETU-1028",
    "Meera Joshi",
    41,
    "Sunrise Clinic",
    "General check-up",
    "30 Oct 2026",
    "Rejected",
    "Normal"
  ]
];

// Insert demo records only once
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
    SELECT * FROM referrals
    ORDER BY id DESC
  `).all();
}

// Get referral by database ID
function getReferralById(id) {
  return db.prepare(`
    SELECT * FROM referrals
    WHERE id = ?
  `).get(id);
}

// Create referral
function createReferral(referral) {
  const insert = db.prepare(`
    INSERT INTO referrals (
      referral_id,
      patient_name,
      patient_age,
      referring_clinic,
      reason,
      referral_date,
      priority
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    referral.referral_id,
    referral.patient_name,
    referral.patient_age,
    referral.referring_clinic,
    referral.reason,
    referral.referral_date,
    referral.priority
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
