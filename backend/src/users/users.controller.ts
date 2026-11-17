import type { Request, Response } from "express";
import { UserModel } from "../db/models.js";

// GET /api/users/profile
export async function getProfile(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const user = await UserModel.findById(userId).select("-password");

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
}
