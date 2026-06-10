const http = require("http");

console.log("INICIANDO SERVIDOR...");

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {

  // ROTA PRINCIPAL
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("API rodando 🚀");
  }

  // ROTA DE PRODUTOS (TESTE)
  if (req.url === "/produtos") {
    res.writeHead(200, { "Content-Type": "application/json" });

    const produtos = [
      { id: 1, nome: "Cimento", quantidade: 50 },
      { id: 2, nome: "Areia", quantidade: 30 },
      { id: 3, nome: "Brita", quantidade: 20 }
    ];

    return res.end(JSON.stringify(produtos));
  }

  // ROTA NÃO ENCONTRADA
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Rota não encontrada");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta " + PORT);
});
