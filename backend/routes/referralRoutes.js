
const express = require("express");

const router = express.Router();

const {
  getReferrals,
  getReferral,
  addReferral,
  updateStatus
} = require("../controllers/referralController");

// GET all referrals
router.get("/", getReferrals);

// GET one referral by database ID
router.get("/:id", getReferral);

// CREATE a new referral
router.post("/", addReferral);

// UPDATE referral status
router.patch("/:id/status", updateStatus);

module.exports = router;
