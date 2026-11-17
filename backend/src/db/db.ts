import mongoose from "mongoose";

const MONGODB_URI =
  process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/flux";

/**
 * Conecta ao MongoDB. Deve ser chamado antes de iniciar o servidor HTTP.
 */
export async function connectDB(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log(`🍃 MongoDB conectado: ${mongoose.connection.host}`);
}

export default mongoose;
