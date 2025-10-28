import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",   // altere conforme sua hospedagem
  user: "root",        // seu usuário MySQL
  password: "Automata", // sua senha MySQL
  database: "CyberMaker"
});

// Registrar usuário
app.post("/api/registrar", async (req, res) => {
  const { nome, email, senha, foto } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    db.query(
      "INSERT INTO usuarios (nome, email, senha, foto) VALUES (?, ?, ?, ?)",
      [nome, email, senhaHash, foto || null],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Email já cadastrado!" });
          }
          return res.status(500).json({ error: err });
        }
        res.json({ success: true });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Login
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(401).json({ error: "Usuário não encontrado" });

    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) return res.status(401).json({ error: "Senha incorreta" });

    res.json({ success: true, usuario });
  });
});

app.listen(3000, () => console.log(" Servidor rodando na porta 3000"));

// ================== IDEIAS ==================

// Criar nova ideia
app.post("/api/ideias", (req, res) => {
  const { usuario_id, titulo, categoria, descricao, img } = req.body;

  db.query(
    "INSERT INTO ideias (usuario_id, titulo, categoria, descricao, img) VALUES (?, ?, ?, ?, ?)",
    [usuario_id, titulo, categoria, descricao, img || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, id: result.insertId });
    }
  );
  db.query("UPDATE usuarios SET pontos = pontos + 10 WHERE id = ?", [usuario_id]);
});

// Listar todas ideias
app.get("/api/ideias", (req, res) => {
  db.query(
    "SELECT i.*, u.nome AS autor, u.foto AS foto_autor FROM ideias i JOIN usuarios u ON i.usuario_id = u.id ORDER BY i.criado_em DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// Buscar ideias de um usuário específico
app.get("/api/ideias/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;
  db.query(
    "SELECT * FROM ideias WHERE usuario_id = ? ORDER BY criado_em DESC",
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// ========== RANKING ==========
app.get("/api/ranking", (req, res) => {
  const sql = "SELECT id, nome, foto, pontos, online FROM usuarios ORDER BY pontos DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao buscar ranking:", err);
      return res.status(500).json({ success: false, error: "Erro ao carregar ranking" });
    }
    res.json(results);
  });
});
// Quando o usuário faz login → fica online
app.post("/api/usuarios/online", (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ success: false, error: "ID ausente" });

  db.query("UPDATE usuarios SET online = TRUE WHERE id = ?", [usuario_id], (err) => {
    if (err) {
      console.error("Erro ao marcar online:", err);
      return res.status(500).json({ success: false, error: "Erro ao atualizar status" });
    }
    res.json({ success: true });
  });
});

// Quando o usuário sai → fica offline
app.post("/api/usuarios/offline", (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ success: false, error: "ID ausente" });

  db.query("UPDATE usuarios SET online = FALSE WHERE id = ?", [usuario_id], (err) => {
    if (err) {
      console.error("Erro ao marcar offline:", err);
      return res.status(500).json({ success: false, error: "Erro ao atualizar status" });
    }
    res.json({ success: true });
  });
});
