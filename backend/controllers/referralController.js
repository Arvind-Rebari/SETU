
const Referral = require("../models/referralModel");

// Get all referrals with optional clinic-wise filtering
function getReferrals(req, res) {
  try {
    const { referring_clinic_id, receiving_clinic_id } = req.query;

    let referrals = Referral.getAllReferrals();

    // Validate referring clinic ID
    if (referring_clinic_id !== undefined) {
      const clinicId = Number(referring_clinic_id);

      if (!Number.isInteger(clinicId) || clinicId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid referring clinic ID."
        });
      }

      referrals = referrals.filter(
        (referral) =>
          Number(referral.referring_clinic_id) === clinicId
      );
    }

    // Validate receiving clinic ID
    if (receiving_clinic_id !== undefined) {
      const clinicId = Number(receiving_clinic_id);

      if (!Number.isInteger(clinicId) || clinicId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid receiving clinic ID."
        });
      }

      referrals = referrals.filter(
        (referral) =>
          Number(referral.receiving_clinic_id) === clinicId
      );
    }

    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals
    });
  } catch (error) {
    console.error("Get referrals error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve referrals."
    });
  }
}

// Get one referral
function getReferral(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral ID."
      });
    }

    const referral = Referral.getReferralById(id);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found."
      });
    }

    res.status(200).json({
      success: true,
      referral
    });
  } catch (error) {
    console.error("Get referral error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve referral."
    });
  }
}

// Create a new referral
function addReferral(req, res) {
  try {
    const {
      patient_database_id,
      referring_clinic,
      receiving_clinic_id,
      reason,
      priority
    } = req.body;

    if (
      !Number.isInteger(Number(patient_database_id)) ||
      Number(patient_database_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid patient."
      });
    }

    if (
      !Number.isInteger(Number(receiving_clinic_id)) ||
      Number(receiving_clinic_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid receiving clinic."
      });
    }

    if (!referring_clinic || !referring_clinic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Referring clinic is required."
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Referral reason is required."
      });
    }

    if (
      priority &&
      !["Normal", "Urgent"].includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral priority."
      });
    }

    const referral = Referral.createReferral({
      referral_id: `SETU-${Date.now()}`,
      patient_database_id: Number(patient_database_id),
      referring_clinic: referring_clinic.trim(),
      receiving_clinic_id: Number(receiving_clinic_id),
      reason: reason.trim(),
      referral_date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      priority: priority || "Normal"
    });

    res.status(201).json({
      success: true,
      message: "Referral created successfully.",
      referral
    });
  } catch (error) {
    console.error("Create referral error:", error.message);

    if (
      error.message === "Selected patient not found." ||
      error.message === "Selected receiving clinic not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create referral."
    });
  }
}

// Update referral status
function updateStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "Received",
      "Pending",
      "In Review",
      "Accepted",
      "Rejected"
    ];

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral ID."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral status."
      });
    }

    const referral = Referral.updateReferralStatus(id, status);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral status updated successfully.",
      referral
    });
  } catch (error) {
    console.error("Update referral status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update referral status."
    });
  }
}

module.exports = {
  getReferrals,
  getReferral,
  addReferral,
  updateStatus
};
