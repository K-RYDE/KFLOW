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
// TESTE API
// =====================
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// =====================
// PROJETOS
// =====================
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
    console.error("ERRO PROJETO:", err);
    res.status(500).json({ erro: err.message });
  }
});

app.get("/projeto", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projeto ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("ERRO LISTAR PROJETO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// UPDATE PROJETO
app.put("/projeto/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, data, cidade } = req.body;

  try {
    const result = await pool.query(
      "UPDATE projeto SET nome=$1, data=$2, cidade=$3 WHERE id=$4 RETURNING *",
      [nome, data, cidade, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERRO UPDATE PROJETO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// DELETE PROJETO
app.delete("/projeto/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM projeto WHERE id=$1", [id]);
    res.json({ mensagem: "Projeto deletado com sucesso" });
  } catch (err) {
    console.error("ERRO DELETE PROJETO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// =====================
// PRODUTOS
// =====================
app.post("/produtos", async (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "Nome obrigatório" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO produtos (nome) VALUES ($1) RETURNING *",
      [nome]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ERRO PRODUTO:", err);
    res.status(500).json({ erro: err.message });
  }
});

app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos");
    res.json(result.rows);
  } catch (err) {
    console.error("ERRO LISTAR PRODUTOS:", err);
    res.status(500).json({ erro: err.message });
  }
});

// UPDATE PRODUTO
app.put("/produtos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  try {
    const result = await pool.query(
      "UPDATE produtos SET nome=$1 WHERE id=$2 RETURNING *",
      [nome, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERRO UPDATE PRODUTO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// DELETE PRODUTO
app.delete("/produtos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM produtos WHERE id=$1", [id]);
    res.json({ mensagem: "Produto deletado com sucesso" });
  } catch (err) {
    console.error("ERRO DELETE PRODUTO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// =====================
// RELAÇÃO
// =====================
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
    console.error("ERRO RELAÇÃO:", err);
    res.status(500).json({ erro: err.message });
  }
});

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
    console.error("ERRO JOIN:", err);
    res.status(500).json({ erro: err.message });
  }
});

// DELETE RELAÇÃO
app.delete("/projeto-produtos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM projeto_produtos WHERE id=$1", [id]);
    res.json({ mensagem: "Relação deletada" });
  } catch (err) {
    console.error("ERRO DELETE RELAÇÃO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// =====================
// START
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
