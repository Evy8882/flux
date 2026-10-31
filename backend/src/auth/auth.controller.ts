import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../db/db.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "./auth.middleware.js";
import type { User } from "../types.js";

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

  const users = readData<User>("users");
  const exists = users.find((u) => u.email === email);

  if (exists) {
    res.status(409).json({ error: "E-mail já cadastrado." });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeData("users", users);

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
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

  const users = readData<User>("users");
  const user = users.find((u) => u.email === email);

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
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
