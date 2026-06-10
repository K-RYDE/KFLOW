const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// 🔗 CONEXÃO COM BANCO (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// =========================
// 🚀 ROTA RAIZ (IMPORTANTE)
// =========================
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// =========================
// 🔧 CRIAR TODAS AS TABELAS
// =========================
app.get("/init", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cidades (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS equipes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projetos (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        data DATE,
        cidade_id INTEGER REFERENCES cidades(id),
        equipe_id INTEGER REFERENCES equipes(id)
      );

      CREATE TABLE IF NOT EXISTS materiais (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        quantidade INTEGER DEFAULT 0,
        projeto_id INTEGER REFERENCES projetos(id)
      );
    `);

    res.send("Tabelas criadas com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar tabelas");
  }
});

// =========================
// 🏙️ CIDADES
// =========================
app.post("/cidades", async (req, res) => {
  try {
    const { nome } = req.body;
    const result = await pool.query(
      "INSERT INTO cidades (nome) VALUES ($1) RETURNING *",
      [nome]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar cidade");
  }
});

app.get("/cidades", async (req, res) => {
  const result = await pool.query("SELECT * FROM cidades ORDER BY id DESC");
  res.json(result.rows);
});

// =========================
// 👷 EQUIPES
// =========================
app.post("/equipes", async (req, res) => {
  try {
    const { nome } = req.body;
    const result = await pool.query(
      "INSERT INTO equipes (nome) VALUES ($1) RETURNING *",
      [nome]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar equipe");
  }
});

app.get("/equipes", async (req, res) => {
  const result = await pool.query("SELECT * FROM equipes ORDER BY id DESC");
  res.json(result.rows);
});

// =========================
// 📁 PROJETOS
// =========================
app.post("/projetos", async (req, res) => {
  try {
    const { nome, data, cidade_id, equipe_id } = req.body;

    const result = await pool.query(
      `INSERT INTO projetos (nome, data, cidade_id, equipe_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, data, cidade_id, equipe_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar projeto");
  }
});

app.get("/projetos", async (req, res) => {
  const result = await pool.query(`
    SELECT 
      p.*,
      c.nome AS cidade,
      e.nome AS equipe
    FROM projetos p
    LEFT JOIN cidades c ON p.cidade_id = c.id
    LEFT JOIN equipes e ON p.equipe_id = e.id
    ORDER BY p.id DESC
  `);

  res.json(result.rows);
});

// =========================
// 📦 MATERIAIS
// =========================
app.post("/materiais", async (req, res) => {
  try {
    const { nome, quantidade, projeto_id } = req.body;

    const result = await pool.query(
      `INSERT INTO materiais (nome, quantidade, projeto_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [nome, quantidade || 0, projeto_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar material");
  }
});

app.get("/materiais", async (req, res) => {
  const result = await pool.query(`
    SELECT 
      m.*,
      p.nome AS projeto
    FROM materiais m
    LEFT JOIN projetos p ON m.projeto_id = p.id
    ORDER BY m.id DESC
  `);

  res.json(result.rows);
});

// =========================
// 🚀 START SERVER (CORRETO PRA RAILWAY)
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta", PORT);
});
