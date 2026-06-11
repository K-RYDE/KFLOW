require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// =====================
// CONFIG
// =====================
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// =====================
// PROJETOS
// =====================

// criar projeto
app.post("/projeto", async (req, res) => {
  const { nome, data, cidade } = req.body;

  if (!nome || !data || !cidade) {
    return res.status(400).json({ erro: "Campos obrigatórios" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO projeto (nome, data, cidade) VALUES ($1, $2, $3) RETURNING *",
      [nome, data, cidade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar projeto" });
  }
});

// listar projetos
app.get("/projeto", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projeto ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar projetos" });
  }
});

// =====================
// PRODUTOS
// =====================

// criar produto
app.post("/produtos", async (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "Nome é obrigatório" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO produtos (nome) VALUES ($1) RETURNING *",
      [nome]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar produto" });
  }
});

// listar produtos
app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

// =====================
// RELAÇÃO PROJETO x PRODUTO
// =====================

// vincular produto ao projeto
app.post("/projeto-produtos", async (req, res) => {
  const { projeto_id, produto_id, quantidade } = req.body;

  if (!projeto_id || !produto_id || !quantidade) {
    return res.status(400).json({ erro: "Campos obrigatórios" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projeto_produtos (projeto_id, produto_id, quantidade)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [projeto_id, produto_id, quantidade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao vincular produto ao projeto" });
  }
});

// listar relação com JOIN (PROFISSIONAL 🔥)
app.get("/projeto-produtos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pp.id,
        p.nome AS projeto,
        pr.nome AS produto,
        pp.quantidade
      FROM projeto_produtos pp
      JOIN projeto p ON p.id = pp.projeto_id
      JOIN produtos pr ON pr.id = pp.produto_id
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar relações" });
  }
});

// =====================
// ERRO GLOBAL
// =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

// =====================
// START
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
