-- ============================================================
-- SIGEO - Inicialização Aurora (MySQL compatível)
-- Execute no console do Aurora após criar o cluster.
-- Gera o Admin Mestre e a primeira unidade.
-- ============================================================

-- 1. Tabela de unidades (polos operacionais)
CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de usuários (compatível com login unificado Web + Mobile)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'technician') NOT NULL DEFAULT 'technician',
  unit_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

-- 3. Admin Mestre da Advances Solutions (troque o HASH por BCrypt real)
-- Gerar hash: node -e "console.log(require('bcryptjs').hashSync('SuaSenhaSegura123', 10))"
INSERT INTO users (name, email, password_hash, role, unit_id)
VALUES (
  'Alessandro Admin',
  'admin@advances.com.br',
  '$2b$10$HASH_DA_SENHA_AQUI',  -- Substituir por hash BCrypt da senha escolhida
  'admin',
  NULL
);

-- 4. Primeira unidade operacional
INSERT INTO units (name, location)
VALUES ('Sede Central SP', 'Av. Paulista, 1000');

-- Opcional (executar só se precisar): índices para performance
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_unit ON users(unit_id);
