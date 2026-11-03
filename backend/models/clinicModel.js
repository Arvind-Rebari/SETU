
const db = require("../config/database");

// Get all registered clinics
function getAllClinics() {
  return db.prepare(`
    SELECT
      id,
      clinic_code,
      name,
      address,
      phone,
      latitude,
      longitude,
      created_at
    FROM clinics
    ORDER BY name ASC
  `).all();
}

// Get one clinic by ID
function getClinicById(id) {
  return db.prepare(`
    SELECT
      id,
      clinic_code,
      name,
      address,
      phone,
      latitude,
      longitude,
      created_at
    FROM clinics
    WHERE id = ?
  `).get(id);
}

// Update a clinic's geographical coordinates
function updateClinicLocation(id, latitude, longitude) {
  const result = db.prepare(`
    UPDATE clinics
    SET latitude = ?, longitude = ?
    WHERE id = ?
  `).run(latitude, longitude, id);

  return result.changes > 0;
}

module.exports = {
  getAllClinics,
  getClinicById,
  updateClinicLocation
};
