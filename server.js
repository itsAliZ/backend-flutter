const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// SQL Server connection configuration
const dbConfig = {
  server: process.env.host || "localhost",
  database: "BookStore",
  user: "bookstore_user", // اضافه کن این خط
  password: "A12344321@", // اضافه کن این خط
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Connect to SQL Server
sql
  .connect(dbConfig)
  .then(() => {
    console.log("Connected to SQL Server database.");
  })
  .catch((err) => {
    console.error("Error connecting to SQL Server:", err);
  });
// Register endpoint
app.get("/", async (req, res) => {
  console.log("hi");
  res.send("welcome to home page");
});
app.post("/register", async (req, res) => {
  console.log("hi register");

  console.log("Received registration request:", req.body);

  const name = JSON.parse(req.body.name);
  const query = "INSERT INTO [user] (name) OUTPUT INSERTED.id VALUES (@name)";
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .query(query);
    res.json({
      message: "User registered successfully.",
      userId: result.recordset[0].id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
app.get("/login/:name", async (req, res) => {
  const { name } = req.params;
  const query = "SELECT * FROM [user] WHERE name = @name";
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .query(query);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "User logged in successfully.",
      user: result.recordset[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add book endpoint
app.post("/addBook", async (req, res) => {
  const { title, price, owner, Bby } = req.body;
  const query =
    "INSERT INTO book (title, price, owner, Bby) OUTPUT INSERTED.id VALUES (@title, @price, @owner, @Bby)";
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("title", sql.VarChar, title)
      .input("price", sql.Int, price)
      .input("owner", sql.Int, owner)
      .input("Bby", sql.Int, Bby)
      .query(query);
    res.status(200).json({
      message: "Book added successfully",
      bookId: result.recordset[0].id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all books endpoint
app.get("/books/all", async (req, res) => {
  const query = "SELECT * FROM book WHERE Bby = -1";
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
