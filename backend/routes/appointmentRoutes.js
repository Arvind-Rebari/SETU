
const express = require("express");
const router = express.Router();

const {
  getAppointments,
  getAppointment,
  addAppointment,
  updateAppointmentStatus,
  removeAppointment
} = require("../controllers/appointmentController");

// GET all appointments
router.get("/", getAppointments);

// GET one appointment
router.get("/:id", getAppointment);

// CREATE appointment
router.post("/", addAppointment);

// UPDATE appointment status
router.patch("/:id/status", updateAppointmentStatus);

// DELETE appointment
router.delete("/:id", removeAppointment);

module.exports = router;
