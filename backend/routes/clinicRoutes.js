
const express = require("express");
const router = express.Router();

const {
  getClinics,
  getClinic,
  updateClinicLocation
} = require("../controllers/clinicController");

// Get all clinics
router.get("/", getClinics);

// Get a clinic by ID
router.get("/:id", getClinic);

// Update a clinic's location
router.put("/:id/location", updateClinicLocation);

module.exports = router;
