
const express = require("express");

const router = express.Router();

const {
  getPatients,
  getPatient,
  addPatient
} = require("../controllers/patientController");

// GET all patients
router.get("/", getPatients);

// GET one patient by database ID
router.get("/:id", getPatient);

// POST a new patient
router.post("/", addPatient);

module.exports = router;
