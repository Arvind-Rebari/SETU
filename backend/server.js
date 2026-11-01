
const express = require("express");
const cors = require("cors");

// Import database connection
const db = require("./config/database");

// Import referral routes
const referralRoutes = require("./routes/referralRoutes");
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SETU Backend is running successfully!"
  });
});

// Referral API routes
app.use("/api/referrals", referralRoutes);
// Referral API routes
app.use("/api/referrals", referralRoutes);

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Server configuration
const PORT = 5000;

app.listen(PORT, () => {
  console.log("--------------------------------");
  console.log("SETU Backend Started Successfully");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Patients API: http://localhost:${PORT}/api/patients`);
  console.log("--------------------------------");
});
