import type { Request, Response } from "express";
import { readData } from "../db/db.js";
import type { User } from "../types.js";

// GET /api/users/profile
export function getProfile(req: Request, res: Response): void {
  const { userId } = req.user!;

  const users = readData<User>("users");
  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  // Retorna o perfil sem expor o hash da senha
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
}
