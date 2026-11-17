import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db/db.js";

const PORT = process.env["PORT"] ?? 3333;

async function main(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
}

main().catch((err) => {
  console.error("❌ Erro ao iniciar o servidor:", err);
  process.exit(1);
});
