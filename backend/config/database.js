
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Database folder
const dataDirectory = path.join(__dirname, "..", "data");

// Create folder if it does not exist
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// Database file
const dbPath = path.join(dataDirectory, "setu.sqlite");

// Connect to SQLite
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Enable WAL mode
db.pragma("journal_mode = WAL");

console.log("SETU SQLite database connected successfully!");

module.exports = db;
