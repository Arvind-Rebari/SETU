
const Clinic = require("../models/clinicModel");

// Get all registered clinics
function getClinics(req, res) {
  try {
    const clinics = Clinic.getAllClinics();

    res.status(200).json({
      success: true,
      count: clinics.length,
      clinics
    });
  } catch (error) {
    console.error("Get clinics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve clinics."
    });
  }
}

// Get one clinic by ID
function getClinic(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid clinic ID."
      });
    }

    const clinic = Clinic.getClinicById(id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found."
      });
    }

    res.status(200).json({
      success: true,
      clinic
    });
  } catch (error) {
    console.error("Get clinic error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve clinic."
    });
  }
}

// Update clinic geographical coordinates
function updateClinicLocation(req, res) {
  try {
    const id = Number(req.params.id);
    const { latitude, longitude } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid clinic ID."
      });
    }

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === null ||
      longitude === null ||
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid numeric latitude and longitude."
      });
    }

    const clinic = Clinic.getClinicById(id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found."
      });
    }

    Clinic.updateClinicLocation(id, latitude, longitude);

    res.status(200).json({
      success: true,
      message: "Clinic location updated successfully.",
      clinic: Clinic.getClinicById(id)
    });
  } catch (error) {
    console.error("Update clinic location error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update clinic location."
    });
  }
}

module.exports = {
  getClinics,
  getClinic,
  updateClinicLocation
};
