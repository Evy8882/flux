import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../db/models.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "./auth.middleware.js";

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email e password são obrigatórios." });
    return;
  }

  const exists = await UserModel.findOne({ email });
  if (exists) {
    res.status(409).json({ error: "E-mail já cadastrado." });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { userId: newUser._id.toString(), email: newUser.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
    },
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "email e password são obrigatórios." });
    return;
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(401).json({ error: "Credenciais inválidas." });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({ error: "Credenciais inválidas." });
    return;
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
}
