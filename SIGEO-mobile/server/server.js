/**
 * SIGEO Mobile - API Mock para desenvolvimento
 * Roda na porta 3000 e escuta em 0.0.0.0 para o celular acessar pelo IP do PC.
 * Não usa banco: login aceita qualquer email/senha e retorna dados fixos.
 */
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Perfis para teste: técnico, gestor, admin
const MOCK_USERS = {
  technician: {
    id: "USR-003",
    nome: "João Santos",
    iniciais: "JS",
    cargo: "Técnico de Manutenção",
    email: "tecnico@sigeo.com.br",
    role: "technician",
  },
  manager: {
    id: "USR-001",
    nome: "Maria Gestora",
    iniciais: "MG",
    cargo: "Gestora Operacional",
    email: "gestor@sigeo.com.br",
    role: "manager",
  },
  super_admin: {
    id: "USR-000",
    nome: "Admin Sistema",
    iniciais: "AD",
    cargo: "Administrador",
    email: "admin@sigeo.com.br",
    role: "super_admin",
  },
};

// Email -> perfil (para login); aceita variações para teste
function emailToRole(email) {
  const e = (email || "").trim().toLowerCase();
  const map = {
    "tecnico@sigeo.com.br": "technician",
    "gestor@sigeo.com.br": "manager",
    "admin@sigeo.com.br": "super_admin",
  };
  if (map[e]) return map[e];
  if (e.includes("gestor") || e.includes("manager")) return "manager";
  if (e.includes("admin")) return "super_admin";
  return "technician";
}

const MOCK_TAREFAS = [
  { id: "OS-001", titulo: "Limpeza geral", status: "Concluída", local: "Unidade Centro", horario: "08:00", prioridade: "Normal", cor_status: "#4CAF50" },
  { id: "OS-002", titulo: "Manutenção ar-condicionado", status: "Em Execução", local: "Unidade Centro", horario: "09:30", prioridade: "Alta", cor_status: "#2196F3" },
  { id: "OS-007", titulo: "Limpeza pós-evento", status: "Em Execução", local: "Unidade Sul", horario: "15:00", prioridade: "Alta", cor_status: "#2196F3" },
];

function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const role = token.startsWith("mock-jwt-") ? token.split("-")[2] : null;
  return role && MOCK_USERS[role] ? MOCK_USERS[role] : MOCK_USERS.technician;
}

// POST /auth/login — aceita qualquer email/senha; perfil por email
app.post("/auth/login", (req, res) => {
  const { email } = req.body || {};
  const role = emailToRole(email);
  const user = MOCK_USERS[role];
  const token = "mock-jwt-" + role + "-" + Date.now();
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.nome, role: user.role, avatar: user.iniciais },
  });
});

// GET /auth/me
app.get("/auth/me", (req, res) => {
  const user = getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Token não fornecido" });
  res.json({ id: user.id, email: user.email, name: user.nome, role: user.role, avatar: user.iniciais });
});

// GET /dashboard
app.get("/dashboard", (req, res) => {
  const user = getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Token não fornecido" });
  const usuario = { id: user.id, nome: user.nome, iniciais: user.iniciais, cargo: user.cargo };
  res.json({
    usuario,
    estatisticas_dia: { total_tarefas: 3, concluidas: 1, percentual_progresso: 33.3 },
    tarefas: MOCK_TAREFAS,
  });
});

// POST /timeclock/checkin
app.post("/timeclock/checkin", (req, res) => {
  res.status(200).json({ ok: true });
});

// PATCH /tasks/:id/status
app.patch("/tasks/:id/status", (req, res) => {
  res.json({ id: req.params.id, status: req.body?.novo_status || "in_progress" });
});

// POST /tasks/:id/finish
app.post("/tasks/:id/finish", (req, res) => {
  res.json({ id: req.params.id, status: "validating" });
});

// GET /tasks/:id — detalhe de tarefa (ex.: ao abrir a partir de push)
app.get("/tasks/:id", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Token não fornecido" });
  const id = (req.params.id || "").trim();
  const tarefa = MOCK_TAREFAS.find((t) => t.id === id);
  if (!tarefa) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json(tarefa);
});

// GET /tasks/by-qr?code=OS-001
app.get("/tasks/by-qr", (req, res) => {
  const code = (req.query.code || "").trim().toUpperCase();
  const tarefa = MOCK_TAREFAS.find((t) => t.id === code);
  if (!tarefa) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json({ tarefa });
});

// POST /users/me/push-token (opcional)
app.post("/users/me/push-token", (req, res) => {
  res.status(200).json({ ok: true });
});

// POST /upload — evidências (foto antes/depois) para S3 (mock devolve URL fake)
app.post("/upload", (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Token não fornecido" });
  next();
}, upload.single("photo"), (req, res) => {
  const taskId = (req.body && req.body.taskId) || "OS-000";
  const type = (req.body && req.body.type) || "before";
  const s3Url = `https://sigeo-evidencias-advances.s3.amazonaws.com/mock/${taskId}/${Date.now()}-${type}.jpg`;
  res.json({ s3Url });
});

// POST /tasks — criação de O.S. pelo gestor (mobile)
app.post("/tasks", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Token não fornecido" });
  const body = req.body || {};
  const id = "OS-" + String(Math.floor(1000 + Math.random() * 9000));
  res.status(201).json({
    id,
    title: body.title || "Nova O.S.",
    description: body.description,
    priority: body.priority || "medium",
    location: body.location,
    address: body.address,
    status: "pending",
  });
});

app.get("/", (req, res) => {
  res.json({ name: "SIGEO Mock API", status: "ok", endpoints: ["POST /auth/login", "GET /dashboard", "POST /timeclock/checkin"] });
});

app.listen(PORT, HOST, () => {
  console.log(`SIGEO Mock API: http://${HOST}:${PORT}`);
  console.log("No celular use: http://SEU_IP_PC:" + PORT);
});
