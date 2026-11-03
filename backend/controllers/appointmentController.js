
const appointmentModel = require("../models/appointmentModel");

// Get all appointments
function getAppointments(req, res) {
  try {
    const appointments = appointmentModel.getAllAppointments();

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error("Get appointments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch appointments."
    });
  }
}

// Get one appointment
function getAppointment(req, res) {
  try {
    const appointment = appointmentModel.getAppointmentById(
      Number(req.params.id)
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error("Get appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch appointment."
    });
  }
}

// Create appointment
function addAppointment(req, res) {
  try {
    const {
      patient_id,
      clinic_id,
      appointment_date,
      appointment_time,
      doctor_name,
      purpose,
      status,
      notes
    } = req.body;

    if (
      !Number.isInteger(Number(patient_id)) ||
      Number(patient_id) <= 0 ||
      !appointment_date ||
      !appointment_time ||
      !purpose ||
      !String(purpose).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Patient, date, time and purpose are required."
      });
    }

    const validStatuses = [
      "Scheduled",
      "Confirmed",
      "Completed",
      "Cancelled",
      "No Show"
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status."
      });
    }

    const appointmentId =
      "SETU-APT-" + Date.now();

    const appointment = appointmentModel.createAppointment({
      appointment_id: appointmentId,
      patient_id: Number(patient_id),
      clinic_id: clinic_id ? Number(clinic_id) : null,
      appointment_date,
      appointment_time,
      doctor_name,
      purpose: String(purpose).trim(),
      status,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Appointment created successfully.",
      data: appointment
    });
  } catch (error) {
    console.error("Add appointment error:", error.message);

    if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({
        success: false,
        message: "Selected patient or clinic does not exist."
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create appointment."
    });
  }
}

// Update appointment status
function updateAppointmentStatus(req, res) {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Scheduled",
      "Confirmed",
      "Completed",
      "Cancelled",
      "No Show"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status."
      });
    }

    const appointment = appointmentModel.updateAppointmentStatus(
      Number(req.params.id),
      status
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    res.json({
      success: true,
      message: "Appointment status updated.",
      data: appointment
    });
  } catch (error) {
    console.error("Update appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update appointment."
    });
  }
}

// Delete appointment
function removeAppointment(req, res) {
  try {
    const deleted = appointmentModel.deleteAppointment(
      Number(req.params.id)
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    res.json({
      success: true,
      message: "Appointment deleted successfully."
    });
  } catch (error) {
    console.error("Delete appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete appointment."
    });
  }
}

module.exports = {
  getAppointments,
  getAppointment,
  addAppointment,
  updateAppointmentStatus,
  removeAppointment
};
