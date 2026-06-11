const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// conexão com banco (Railway usa DATABASE_URL automático)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


// =========================
// TESTE
// =========================
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});


// =========================
// PRODUTOS (já tinha)
// =========================
app.get("/produtos", async (req, res) => {
  const result = await pool.query("SELECT * FROM produtos");
  res.json(result.rows);
});

app.post("/produtos", async (req, res) => {
  const { nome, quantidade } = req.body;

  const result = await pool.query(
    "INSERT INTO produtos (nome, quantidade) VALUES ($1, $2) RETURNING *",
    [nome, quantidade]
  );

  res.json(result.rows[0]);
});


// =========================
// PROJETO 🔥
// =========================
app.post("/projeto", async (req, res) => {
  const { nome, data, cidade } = req.body;

  const result = await pool.query(
    "INSERT INTO projeto (nome, data, cidade) VALUES ($1, $2, $3) RETURNING *",
    [nome, data, cidade]
  );

  res.json(result.rows[0]);
});

app.get("/projeto", async (req, res) => {
  const result = await pool.query("SELECT * FROM projeto");
  res.json(result.rows);
});


// =========================
// EQUIPE 🔥
// =========================
app.post("/equipe", async (req, res) => {
  const { nome } = req.body;

  const result = await pool.query(
    "INSERT INTO equipe (nome) VALUES ($1) RETURNING *",
    [nome]
  );

  res.json(result.rows[0]);
});

app.get("/equipe", async (req, res) => {
  const result = await pool.query("SELECT * FROM equipe");
  res.json(result.rows);
});


// =========================
// PORTA
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
