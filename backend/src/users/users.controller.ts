import type { Request, Response } from "express";
import { UsuarioModel } from "../db/models.js";

// GET /api/users/profile
export async function getProfile(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const user = await UsuarioModel.findById(userId).select("-senha");

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  res.json({
    id: user._id.toString(),
    name: user.nome,
    email: user.email,
    createdAt: user.createdAt,
  });
}
