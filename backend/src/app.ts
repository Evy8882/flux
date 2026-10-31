import express from "express";
import cors from "cors";

import authRoutes from "./auth/auth.routes.js";
import usersRoutes from "./users/users.routes.js";
import categoriesRoutes from "./categories/categories.routes.js";
import transactionsRoutes from "./transactions/transactions.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";

const app = express();

// ── Middlewares globais ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

export default app;
