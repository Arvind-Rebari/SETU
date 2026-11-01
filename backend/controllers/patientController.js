
const Patient = require("../models/patientModel");

// GET: Fetch all patients
function getPatients(req, res) {
  try {
    const patients = Patient.getAllPatients();

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error("Get patients error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch patients."
    });
  }
}

// GET: Fetch one patient
function getPatient(req, res) {
  try {
    const patient = Patient.getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found."
      });
    }

    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    console.error("Get patient error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch patient."
    });
  }
}

// POST: Add a new patient
function addPatient(req, res) {
  try {
    const {
      name,
      age,
      gender,
      phone,
      blood_group,
      clinic
    } = req.body;

    // Basic validation
    if (!name || !age || !gender || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, age, gender and phone are required."
      });
    }

    if (
      !Number.isInteger(Number(age)) ||
      Number(age) < 1 ||
      Number(age) > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "Age must be between 1 and 120."
      });
    }

    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({
        success: false,
        message: "Phone must contain exactly 10 digits."
      });
    }

    const patient = Patient.createPatient({
      patient_id: `SETU-${Date.now()}`,
      name: String(name).trim(),
      age: Number(age),
      gender,
      phone: String(phone),
      blood_group,
      clinic
    });

    res.status(201).json({
      success: true,
      message: "Patient added successfully.",
      patient
    });
  } catch (error) {
    console.error("Add patient error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add patient."
    });
  }
}

module.exports = {
  getPatients,
  getPatient,
  addPatient
};
