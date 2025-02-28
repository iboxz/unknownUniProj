const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public")); // fix host folder permission
const port = process.env.PORT || 3000; // fix host port issue

const db = new sqlite3.Database("database.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    created_at DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(bodyParser.urlencoded({ extended: false })); // encode post method data
app.use(bodyParser.json()); // encode json

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

// submit data to database
app.post("/api/submit", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const message = req.body.message;

  db.run("INSERT INTO users (name, email, phone, message) VALUES (?, ?, ?, ?)", [name, email, phone, message], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data saved successfully",
      id: this.lastID,
    });
  });
});

// receive data from database
app.get("/api/data", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: "An error occurred" });
    }
    return res.status(200).json({ success: true, data: rows });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

/* app.delete("/api/clear", (req, res) => {
  db.run("DELETE FROM users", [], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error deleting data",
      });
    }
    
    // Reset the AUTOINCREMENT counter
    db.run("DELETE FROM sqlite_sequence WHERE name='users'", [], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error resetting counter",
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "All data deleted and counter reset",
      });
    });
  });
}); */