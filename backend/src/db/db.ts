import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");

/**
 * Lê e parseia um arquivo JSON de dados.
 * @param filename Nome do arquivo sem extensão (ex: "users")
 */
export function readData<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

/**
 * Serializa e salva dados em um arquivo JSON.
 * @param filename Nome do arquivo sem extensão (ex: "users")
 * @param data Array de dados a salvar
 */
export function writeData<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
