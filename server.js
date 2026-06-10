const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🔧 CRIAR TODAS AS TABELAS
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
        quantidade INTEGER,
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
  const { nome } = req.body;
  const result = await pool.query(
    "INSERT INTO cidades (nome) VALUES ($1) RETURNING *",
    [nome]
  );
  res.json(result.rows[0]);
});

app.get("/cidades", async (req, res) => {
  const result = await pool.query("SELECT * FROM cidades");
  res.json(result.rows);
});


// =========================
// 👷 EQUIPES
// =========================
app.post("/equipes", async (req, res) => {
  const { nome } = req.body;
  const result = await pool.query(
    "INSERT INTO equipes (nome) VALUES ($1) RETURNING *",
    [nome]
  );
  res.json(result.rows[0]);
});

app.get("/equipes", async (req, res) => {
  const result = await pool.query("SELECT * FROM equipes");
  res.json(result.rows);
});


// =========================
// 📁 PROJETOS
// =========================
app.post("/projetos", async (req, res) => {
  const { nome, data, cidade_id, equipe_id } = req.body;

  const result = await pool.query(
    `INSERT INTO projetos (nome, data, cidade_id, equipe_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [nome, data, cidade_id, equipe_id]
  );

  res.json(result.rows[0]);
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
  `);

  res.json(result.rows);
});


// =========================
// 📦 MATERIAIS (ligado ao projeto)
// =========================
app.post("/materiais", async (req, res) => {
  const { nome, quantidade, projeto_id } = req.body;

  const result = await pool.query(
    `INSERT INTO materiais (nome, quantidade, projeto_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [nome, quantidade, projeto_id]
  );

  res.json(result.rows[0]);
});

app.get("/materiais", async (req, res) => {
  const result = await pool.query(`
    SELECT 
      m.*,
      p.nome AS projeto
    FROM materiais m
    LEFT JOIN projetos p ON m.projeto_id = p.id
  `);

  res.json(result.rows);
});


app.listen(3000, () => {
  console.log("Servidor rodando!");
});
