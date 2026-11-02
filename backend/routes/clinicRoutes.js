
const express = require("express");
const router = express.Router();

const {
  getClinics,
  getClinic
} = require("../controllers/clinicController");

router.get("/", getClinics);
router.get("/:id", getClinic);

module.exports = router;
