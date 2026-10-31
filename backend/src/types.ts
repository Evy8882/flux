// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // bcrypt hash
  createdAt: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export type TransactionType = "receita" | "despesa";

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  createdAt: string;
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
}
