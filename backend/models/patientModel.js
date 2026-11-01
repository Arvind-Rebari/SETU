
const db = require("../config/database");

// Create patients table
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    blood_group TEXT DEFAULT 'Unknown',
    clinic TEXT,
    referrals INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const demoPatients = [
  ["SETU-1001", "Ananya Sharma", 34, "Female", "9876543210", "B+", "Sunrise Clinic", 2],
  ["SETU-1002", "Rahul Mehta", 48, "Male", "9876543211", "O+", "City Health Centre", 3],
  ["SETU-1003", "Priya Nair", 29, "Female", "9876543212", "A+", "Green Life Hospital", 1],
  ["SETU-1004", "Vikram Patel", 56, "Male", "9876543213", "AB+", "Wellness Medical", 2],
  ["SETU-1005", "Meera Joshi", 41, "Female", "9876543214", "O-", "Sunrise Clinic", 1]
];

const seedPatient = db.prepare(`
  INSERT OR IGNORE INTO patients
  (patient_id, name, age, gender, phone, blood_group, clinic, referrals)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const seedDemoPatients = db.transaction(() => {
  for (const patient of demoPatients) {
    seedPatient.run(...patient);
  }
});

seedDemoPatients();

// Get all patients
function getAllPatients() {
  return db.prepare(`
    SELECT * FROM patients
    ORDER BY id DESC
  `).all();
}

// Get patient by database ID
function getPatientById(id) {
  return db.prepare(`
    SELECT * FROM patients
    WHERE id = ?
  `).get(id);
}

// Add new patient
function createPatient(patient) {
  const insert = db.prepare(`
    INSERT INTO patients (
      patient_id, name, age, gender,
      phone, blood_group, clinic
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    patient.patient_id,
    patient.name,
    patient.age,
    patient.gender,
    patient.phone,
    patient.blood_group || "Unknown",
    patient.clinic || ""
  );

  return getPatientById(result.lastInsertRowid);
}

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient
};
