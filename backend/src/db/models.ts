import { Schema, model, Document, Types } from "mongoose";

// ─── Usuario (Coleção: usuarios) ─────────────────────────────────────────────

export interface IUsuario extends Document {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  senha: string; // bcrypt hash
  createdAt: Date;
}

const usuarioSchema = new Schema<IUsuario>(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "usuarios" }
);

export const UsuarioModel = model<IUsuario>("Usuario", usuarioSchema);

// ─── Categoria (Coleção: categorias) ─────────────────────────────────────────

export interface ICategoria extends Document {
  _id: Types.ObjectId;
  usuarioId: Types.ObjectId;
  nome: string;
  cor: string;
  icone: string;
  createdAt: Date;
}

const categoriaSchema = new Schema<ICategoria>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    nome: { type: String, required: true, trim: true },
    cor: { type: String, default: "#6366f1" },
    icone: { type: String, default: "tag" },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "categorias" }
);

export const CategoriaModel = model<ICategoria>("Categoria", categoriaSchema);

// ─── Transacao (Coleção: transacoes) ──────────────────────────────────────────

export type TipoTransacao = "receita" | "despesa";

export interface ITransacao extends Document {
  _id: Types.ObjectId;
  usuarioId: Types.ObjectId;
  categoryId: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  data: Date;
  createdAt: Date;
}

const transacaoSchema = new Schema<ITransacao>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    categoryId: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ["receita", "despesa"], required: true },
    valor: { type: Number, required: true, min: 0 },
    descricao: { type: String, required: true, trim: true },
    data: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "transacoes" }
);

export const TransacaoModel = model<ITransacao>("Transacao", transacaoSchema);

// ─── Meta (Coleção: metas) ────────────────────────────────────────────────────

export interface IMeta extends Document {
  _id: Types.ObjectId;
  usuarioId: Types.ObjectId;
  titulo: string;
  valorAlvo: number;
  valorAtual: number;
  dataLimite: Date;
  createdAt: Date;
}

const metaSchema = new Schema<IMeta>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    titulo: { type: String, required: true, trim: true },
    valorAlvo: { type: Number, required: true, min: 0 },
    valorAtual: { type: Number, default: 0, min: 0 },
    dataLimite: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "metas" }
);

export const MetaModel = model<IMeta>("Meta", metaSchema);

// ─── Orcamento (Coleção: orcamentos) ──────────────────────────────────────────

export interface IOrcamento extends Document {
  _id: Types.ObjectId;
  usuarioId: Types.ObjectId;
  categoriaId: Types.ObjectId;
  limite: number;
  mesAno: string; // Ex: "2026-06"
  createdAt: Date;
}

const orcamentoSchema = new Schema<IOrcamento>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    categoriaId: { type: Schema.Types.ObjectId, ref: "Categoria", required: true },
    limite: { type: Number, required: true, min: 0 },
    mesAno: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "orcamentos" }
);

export const OrcamentoModel = model<IOrcamento>("Orcamento", orcamentoSchema);

// ─── Recorrencia (Coleção: recorrencias) ──────────────────────────────────────

export interface IRecorrencia extends Document {
  _id: Types.ObjectId;
  usuarioId: Types.ObjectId;
  categoriaId: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  frequencia: "mensal" | "anual" | "semanal";
  proximaData: Date;
  createdAt: Date;
}

const recorrenciaSchema = new Schema<IRecorrencia>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    categoriaId: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ["receita", "despesa"], required: true },
    valor: { type: Number, required: true, min: 0 },
    descricao: { type: String, required: true, trim: true },
    frequencia: { type: String, enum: ["mensal", "anual", "semanal"], required: true },
    proximaData: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "recorrencias" }
);

export const RecorrenciaModel = model<IRecorrencia>("Recorrencia", recorrenciaSchema);