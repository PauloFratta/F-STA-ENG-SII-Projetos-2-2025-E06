import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configurações básicas
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conexão com banco (usando variáveis de ambiente)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: true } // necessário no Clever Cloud
});

// ==================== ROTAS ====================

// Exemplo: registro de usuário
app.post("/registrar", async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
    }

    const [rows] = await pool.query(
      "INSERT INTO usuarios (usuario, senha) VALUES (?, ?)",
      [usuario, senha]
    );

    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// Exemplo: login
app.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?",
      [usuario, senha]
    );

    if (rows.length > 0) {
      res.json({ message: "Login bem-sucedido!" });
    } else {
      res.status(401).json({ message: "Usuário ou senha incorretos." });
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Porta Render (Render define PORT automaticamente)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));