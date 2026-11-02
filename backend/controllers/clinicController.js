
const Clinic = require("../models/clinicModel");

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

module.exports = {
  getClinics,
  getClinic
};
