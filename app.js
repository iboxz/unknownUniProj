const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./db/database"); // Database module

const app = express();
const port = process.env.PORT || 3000;

// Use middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Process POST /login for user login (students login)
app.post("/login", (req, res) => {
  const { student_code, password } = req.body;

  if (!student_code || !password) {
    return res.status(400).send("Please provide complete information.");
  }

  // Run query to validate user credentials
  const sql = `SELECT * FROM students WHERE student_code = ? AND password = ?`;
  db.get(sql, [student_code, password], (err, row) => {
    if (err) {
      console.error("Error executing query:", err.message);
      return res.status(500).send("Server error");
    }

    if (row) {
      // Successful login
      res.send("Login successful.");
    } else {
      // Incorrect login information
      res.send("Student code or password is incorrect.");
    }
  });
});

// Serve the login page for students (already exists)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* ------------------ Admin Functionality ------------------ */

// Constant admin password (change as needed)
const ADMIN_PASSWORD = "1234";

// Serve admin login page
app.get("/mod/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mod/login.html"));
});

// Process admin login submission
app.post("/mod/login", (req, res) => {
  const { admin_password } = req.body;
  if (admin_password === ADMIN_PASSWORD) {
    // On successful admin login, serve the admin panel
    res.sendFile(path.join(__dirname, "public", "mod/main.html"));
  } else {
    res.status(401).send("Admin authentication failed.");
  }
});

// Helper function to generate random 10-digit student code as a string
function generateRandomCode() {
  // Generates a random number between 1000000000 and 9999999999 (inclusive)
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Route to add a new student (accessed via admin panel)
app.post("/mod/addStudent", (req, res) => {
  const { first_name, last_name, national_code, city, state, year_of_birth, study_unit } = req.body;

  if (!first_name || !last_name || !national_code || !city || !state || !year_of_birth || !study_unit) {
    return res.status(400).send("Please provide all required student information.");
  }

  // Function to generate a unique student code and insert the student
  function checkAndInsert() {
    const code = generateRandomCode();
    const checkSQL = "SELECT * FROM students WHERE student_code = ?";
    db.get(checkSQL, [code], (err, row) => {
      if (err) {
        return res.status(500).send("Server error while checking student code.");
      }
      if (row) {
        // Code already exists; try generating a new one
        checkAndInsert();
      } else {
        // Insert student with generated code; initial password is same as student code
        const insertSQL = `
          INSERT INTO students (student_code, password, first_name, last_name, national_code, city, state, year_of_birth, study_unit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(insertSQL, [code, code, first_name, last_name, national_code, city, state, year_of_birth, study_unit], function (err) {
          if (err) {
            return res.status(500).send("Server error while inserting student.");
          }
          res.send("Student added successfully with code: " + code);
        });
      }
    });
  }

  checkAndInsert();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
