const http = require("http");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

const server = http.createServer(async (req, res) => {
  // ROTA PRINCIPAL
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("API rodando 🚀");
  }

  // ROTA PRODUTOS
  if (req.url === "/produtos") {
    try {
      const result = await client.query("SELECT * FROM produtos");

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result.rows));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ erro: error.message }));
    }
  }

  // ROTA NÃO ENCONTRADA
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Rota não encontrada");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
