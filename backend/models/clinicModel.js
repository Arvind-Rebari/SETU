
const db = require("../config/database");

function getAllClinics() {
  return db.prepare(`
    SELECT
      id,
      clinic_code,
      name,
      address,
      phone,
      created_at
    FROM clinics
    ORDER BY name ASC
  `).all();
}

function getClinicById(id) {
  return db.prepare(`
    SELECT
      id,
      clinic_code,
      name,
      address,
      phone,
      created_at
    FROM clinics
    WHERE id = ?
  `).get(id);
}

module.exports = {
  getAllClinics,
  getClinicById
};
