const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 conexão automática com Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// TESTE
app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

// CRIAR TABELA (executa 1 vez automático)
app.get('/init', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS materiais (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        quantidade INT
      );
    `);
    res.send('Tabela criada');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// SALVAR
app.post('/materiais', async (req, res) => {
  const { nome, quantidade } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO materiais (nome, quantidade) VALUES ($1, $2) RETURNING *',
      [nome, quantidade]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// LISTAR
app.get('/materiais', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materiais');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor rodando'));
