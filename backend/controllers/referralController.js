
const Referral = require("../models/referralModel");

// GET: Fetch all referrals
function getReferrals(req, res) {
  try {
    const referrals = Referral.getAllReferrals();

    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals
    });

  } catch (error) {
    console.error("Get referrals error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch referrals."
    });
  }
}

// GET: Fetch one referral
function getReferral(req, res) {
  try {
    const referral = Referral.getReferralById(req.params.id);

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
    console.error("Get referral error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch referral."
    });
  }
}

// POST: Create a new referral using an existing patient
function addReferral(req, res) {
  try {
    const {
      patient_database_id,
      referring_clinic,
      reason,
      priority
    } = req.body;

    // Validate patient database ID
    if (
      !Number.isInteger(Number(patient_database_id)) ||
      Number(patient_database_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid patient."
      });
    }

    // Validate required fields
    if (
      !String(referring_clinic || "").trim() ||
      !String(reason || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required referral details."
      });
    }

    // Validate priority
    if (!["Normal", "Urgent"].includes(priority || "Normal")) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral priority."
      });
    }

    const referral = Referral.createReferral({
      patient_database_id: Number(patient_database_id),
      referral_id: `SETU-${Date.now()}`,
      referring_clinic: String(referring_clinic).trim(),
      reason: String(reason).trim(),
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
    console.error("Create referral error:", error);

    if (error.message === "Selected patient not found.") {
      return res.status(404).json({
        success: false,
        message: "Selected patient was not found."
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create referral."
    });
  }
}

// PATCH: Update referral status
function updateStatus(req, res) {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Received",
      "Pending",
      "In Review",
      "Accepted",
      "Rejected"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral status."
      });
    }

    const referral = Referral.updateReferralStatus(
      req.params.id,
      status
    );

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
    console.error("Update referral status error:", error);

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
