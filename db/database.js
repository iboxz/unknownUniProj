const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file path in the db folder
const dbPath = path.join(__dirname, "university.db");

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Successfully connected to SQLite database.");
  }
});

// Create students table if it doesn't exist with extended fields
db.serialize(() => {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_code TEXT UNIQUE,
      password TEXT,
      first_name TEXT,
      last_name TEXT,
      national_code TEXT,
      city TEXT,
      state TEXT,
      year_of_birth INTEGER,
      study_unit TEXT
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating students table:", err.message);
      } else {
        console.log("Students table is ready for use.");
      }
    }
  );
});

module.exports = db;