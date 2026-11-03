
const db = require("../config/database");

function columnExists(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .some((column) => column.name === columnName);
}

try {
  db.transaction(() => {
    if (!columnExists("clinics", "latitude")) {
      db.exec(`
        ALTER TABLE clinics
        ADD COLUMN latitude REAL;
      `);
    }

    if (!columnExists("clinics", "longitude")) {
      db.exec(`
        ALTER TABLE clinics
        ADD COLUMN longitude REAL;
      `);
    }
  })();

  console.log("CLINIC LOCATION MIGRATION SUCCESS");
  console.log("Latitude and longitude fields added.");
  console.log("Existing clinic records preserved.");
} catch (error) {
  console.error("CLINIC LOCATION MIGRATION FAILED:", error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
