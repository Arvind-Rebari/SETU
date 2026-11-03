
const db = require("../config/database");

// Get all appointments
function getAllAppointments() {
  return db.prepare(`
    SELECT
      a.*,
      p.name AS patient_name,
      p.patient_id AS patient_code,
      c.name AS clinic_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN clinics c ON a.clinic_id = c.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `).all();
}

// Get appointment by ID
function getAppointmentById(id) {
  return db.prepare(`
    SELECT
      a.*,
      p.name AS patient_name,
      p.patient_id AS patient_code,
      c.name AS clinic_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN clinics c ON a.clinic_id = c.id
    WHERE a.id = ?
  `).get(id);
}

// Create appointment
function createAppointment(appointment) {
  const insert = db.prepare(`
    INSERT INTO appointments (
      appointment_id,
      patient_id,
      clinic_id,
      appointment_date,
      appointment_time,
      doctor_name,
      purpose,
      status,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    appointment.appointment_id,
    appointment.patient_id,
    appointment.clinic_id || null,
    appointment.appointment_date,
    appointment.appointment_time,
    appointment.doctor_name || "",
    appointment.purpose,
    appointment.status || "Scheduled",
    appointment.notes || ""
  );

  return getAppointmentById(result.lastInsertRowid);
}

// Update appointment status
function updateAppointmentStatus(id, status) {
  const result = db.prepare(`
    UPDATE appointments
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, id);

  return result.changes > 0 ? getAppointmentById(id) : null;
}

// Delete appointment
function deleteAppointment(id) {
  const result = db.prepare(`
    DELETE FROM appointments
    WHERE id = ?
  `).run(id);

  return result.changes > 0;
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment
};
