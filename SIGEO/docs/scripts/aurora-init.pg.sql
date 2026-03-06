-- ============================================================
-- SIGEO - Inicialização Aurora PostgreSQL
-- Execute no console do Aurora (PostgreSQL) após criar o cluster.
-- ============================================================

-- 1. Unidades (polos operacionais)
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Usuários (login unificado Web + Mobile)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician')),
  unit_id INT NULL REFERENCES units(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Log de auditoria (opcional)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Admin Mestre (troque o HASH por BCrypt real)
-- node -e "console.log(require('bcryptjs').hashSync('SuaSenhaSegura123', 10))"
INSERT INTO users (name, email, password_hash, role, unit_id)
VALUES (
  'Alessandro Admin',
  'admin@advances.com.br',
  '$2b$10$HASH_DA_SENHA_AQUI',
  'admin',
  NULL
) ON CONFLICT (email) DO NOTHING;

-- 5. Primeira unidade (executar uma vez)
INSERT INTO units (name, location)
SELECT 'Sede Central SP', 'Av. Paulista, 1000'
WHERE NOT EXISTS (SELECT 1 FROM units LIMIT 1);
