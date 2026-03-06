// ============================================================
// SIGEO v2 - Backend (Node.js + Express)
// Isolado da v1 para garantir integridade. Deploy: EC2/ECS + Aurora.
// Rotas unificadas: /auth/login e /api/auth/login (Mobile e Web).
// Aurora: docs/AURORA-SETUP.md | Deploy: docs/DEPLOY-AWS.md
// ============================================================

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./db/connection');

const app = express();
app.use(express.json());

// CORS: Web v2 e dev local (fundamental para frontend em outro domínio)
const corsOrigins = ['https://sigeo.advances.com.br', 'https://sigeo-v2.advances.com.br', 'http://localhost:5173'];
if (process.env.FRONTEND_URL && !corsOrigins.includes(process.env.FRONTEND_URL)) {
  corsOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rota de health check (DNS -> Nginx -> Docker -> Secrets Manager -> Aurora)
app.get('/status', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT 1 AS result');
    const ok = rows && rows[0] && (rows[0].result === 1 || rows[0].result === 2);
    res.json({
      status: ok ? 'online' : 'degraded',
      version: '2.0.0',
      db_connected: !!ok,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      db_connected: false,
      error: 'Falha ao conectar no Aurora ou Secrets Manager',
      timestamp: new Date().toISOString(),
    });
  }
});

// Middleware de autenticação JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// ======================== PUSH HELPER ========================

let firebaseInitialized = false;
async function sendPushToUser(userId, title, body, data = {}) {
  try {
    const { rows: tokens } = await db.query(
      'SELECT token, platform FROM push_tokens WHERE user_id = $1', [userId]
    );
    if (tokens.length === 0) return;

    const admin = require('firebase-admin');
    if (!firebaseInitialized) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      });
      firebaseInitialized = true;
    }

    await Promise.allSettled(
      tokens.map(t =>
        admin.messaging().send({
          token: t.token,
          notification: { title, body },
          data,
          ...(t.platform === 'android' ? { android: { priority: 'high' } } : {}),
          ...(t.platform === 'ios' ? { apns: { payload: { aps: { sound: 'default', badge: 1 } } } } : {}),
        })
      )
    );
  } catch (err) {
    console.error('[Push] Erro ao enviar:', err);
  }
}

// ======================== AUTH v2 – Rotas unificadas Mobile e Web ========================

const authLogin = async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, 'LOGIN', `Login realizado por ${user.name}`, req.ip]
    );
  } catch (e) { /* audit_logs pode não existir */ }
  res.json({
    token,
    user: { id: String(user.id), email: user.email, name: user.name, role: user.role, unit_id: user.unit_id ?? null },
  });
};

const authMe = async (req, res) => {
  const { rows } = await db.query('SELECT id, name, email, role, unit_id FROM users WHERE id = $1', [req.user.id]);
  const u = rows[0];
  if (!u) return res.status(401).json({ error: 'Usuário não encontrado' });
  res.json({ id: String(u.id), name: u.name, email: u.email, role: u.role, unit_id: u.unit_id ?? null });
};

app.post('/auth/login', authLogin);
app.post('/api/auth/login', authLogin);
app.get('/auth/me', authMiddleware, authMe);
app.get('/api/auth/me', authMiddleware, authMe);

// ======================== TASKS ========================

app.get('/api/tasks', authMiddleware, async (req, res) => {
  const { status, location, priority } = req.query;
  let query = 'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.technician_id = u.id WHERE 1=1';
  const params = [];

  if (status) { params.push(status); query += ` AND t.status = $${params.length}`; }
  if (location) { params.push(location); query += ` AND t.location_name = $${params.length}`; }
  if (priority) { params.push(priority); query += ` AND t.priority = $${params.length}`; }

  query += ' ORDER BY t.created_at DESC';
  const { rows } = await db.query(query, params);
  res.json(rows);
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  const { title, type, location_name, area, technician_id, priority, scheduled_at, sla, description } = req.body;
  const { rows } = await db.query(
    'INSERT INTO tasks (title, type, location_name, area, technician_id, priority, scheduled_at, sla, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [title, type, location_name, area, technician_id, priority, scheduled_at, sla, description]
  );

  await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)',
    [req.user.id, 'CRIAR_TAREFA', `Tarefa "${title}" criada`]);

  res.status(201).json(rows[0]);
});

app.patch('/api/tasks/:id/assign', authMiddleware, async (req, res) => {
  const { technicianId } = req.body;
  const { rows } = await db.query(
    'UPDATE tasks SET technician_id = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [technicianId, 'in_progress', req.params.id]
  );

  const task = rows[0];

  await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)',
    [req.user.id, 'ALOCAÇÃO', `Tarefa ${req.params.id} alocada para técnico ${technicianId}`]);

  // Push automático para o técnico
  await sendPushToUser(technicianId, '📋 Nova tarefa atribuída', `${task.title} — ${task.location_name || 'Sem local'}`, { taskId: String(task.id), type: 'task_assigned' });

  res.json(task);
});

app.post('/api/tasks/:id/approve', authMiddleware, async (req, res) => {
  const { rows } = await db.query(
    'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    ['completed', req.params.id]
  );
  const task = rows[0];

  await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)',
    [req.user.id, 'APROVAÇÃO', `Tarefa ${req.params.id} aprovada`]);

  // Push para o técnico
  if (task.technician_id) {
    await sendPushToUser(task.technician_id, '✅ Tarefa aprovada', `"${task.title}" foi aprovada pelo gestor.`, { taskId: String(task.id), type: 'task_approved' });
  }

  res.json(task);
});

app.post('/api/tasks/:id/reject', authMiddleware, async (req, res) => {
  const { reason } = req.body;
  const { rows } = await db.query(
    'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    ['rejected', req.params.id]
  );
  const task = rows[0];

  await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)',
    [req.user.id, 'REJEIÇÃO', `Tarefa ${req.params.id} rejeitada: ${reason}`]);

  // Push para o técnico
  if (task.technician_id) {
    await sendPushToUser(task.technician_id, '❌ Tarefa rejeitada', `"${task.title}" foi rejeitada: ${reason || 'sem motivo'}`, { taskId: String(task.id), type: 'task_rejected' });
  }

  res.json(task);
});

// ======================== EMPLOYEES ========================

app.get('/api/employees', authMiddleware, async (req, res) => {
  const { rows } = await db.query('SELECT id, name, email, role, unit_id FROM users ORDER BY name');
  res.json(rows);
});

app.post('/api/employees', authMiddleware, async (req, res) => {
  const { name, email, password, role, unit, phone, cpf, skills } = req.body;
  const password_hash = await bcrypt.hash(password || 'Sigeo@2026', 10);
  const unit_id = unit != null ? unit : (typeof unit === 'number' ? unit : null);
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password_hash, role, unit_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, email, password_hash, role || 'technician', unit_id]
  );

  await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)',
    [req.user.id, 'CADASTRO', `Funcionário "${name}" cadastrado`]);

  res.status(201).json(rows[0]);
});

// ======================== INVENTORY ========================

app.get('/api/inventory', authMiddleware, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM inventory ORDER BY name');
  res.json(rows);
});

app.post('/api/inventory/:id/movement', authMiddleware, async (req, res) => {
  const { type, quantity, reason } = req.body;
  const materialId = req.params.id;

  const delta = type === 'entrada' ? quantity : -quantity;
  await db.query('UPDATE inventory SET stock = stock + $1 WHERE id = $2', [delta, materialId]);

  const { rows } = await db.query(
    'INSERT INTO stock_movements (material_id, type, quantity, reason, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [materialId, type, quantity, reason, req.user.id]
  );

  await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)',
    [req.user.id, 'ESTOQUE', `${type} de ${quantity} unidades no material ${materialId}`]);

  res.json(rows[0]);
});

// ======================== AUDIT ========================

app.get('/api/audit/logs', authMiddleware, async (req, res) => {
  const { rows } = await db.query(
    'SELECT a.*, u.name as user_name FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 200'
  );
  res.json(rows);
});

// ======================== PUSH NOTIFICATIONS ========================

// Registra token FCM/APNs do dispositivo
app.post('/api/push/register', authMiddleware, async (req, res) => {
  const { token, platform } = req.body;
  const userId = req.user.id;

  await db.query(
    `INSERT INTO push_tokens (user_id, token, platform, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, token) DO UPDATE SET platform = $3, updated_at = NOW()`,
    [userId, token, platform]
  );

  res.json({ success: true });
});

// Remove token ao fazer logout
app.delete('/api/push/unregister', authMiddleware, async (req, res) => {
  const { token } = req.body;
  await db.query('DELETE FROM push_tokens WHERE user_id = $1 AND token = $2', [req.user.id, token]);
  res.json({ success: true });
});

// Envia push para um usuário específico (uso interno / cron)
app.post('/api/push/send', authMiddleware, async (req, res) => {
  const { targetUserId, title, body, data } = req.body;

  // Busca tokens do usuário alvo
  const { rows: tokens } = await db.query(
    'SELECT token, platform FROM push_tokens WHERE user_id = $1',
    [targetUserId]
  );

  if (tokens.length === 0) {
    return res.status(404).json({ error: 'Nenhum dispositivo registrado' });
  }

  // Envia via Firebase Admin SDK (requer firebase-admin instalado)
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      });
    }

    const results = await Promise.allSettled(
      tokens.map(t =>
        admin.messaging().send({
          token: t.token,
          notification: { title, body },
          data: data || {},
          ...(t.platform === 'android' ? { android: { priority: 'high' } } : {}),
          ...(t.platform === 'ios' ? { apns: { payload: { aps: { sound: 'default' } } } } : {}),
        })
      )
    );

    await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)',
      [req.user.id, 'PUSH_SEND', `Push enviado para ${targetUserId}: "${title}"`]);

    res.json({ sent: results.filter(r => r.status === 'fulfilled').length, failed: results.filter(r => r.status === 'rejected').length });
  } catch (err) {
    console.error('[Push] Erro ao enviar:', err);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

// ======================== START ========================

const PORT = process.env.PORT || 3000;

(async function start() {
  if (db.init) await db.init();
  app.listen(PORT, () => console.log('🚀 SIGEO v2 Backend Online - porta', PORT));
})();
