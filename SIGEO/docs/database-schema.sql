-- ============================================================
-- SIGEO - Schema do Banco de Dados (AWS RDS - PostgreSQL)
-- Execute este script no seu banco PostgreSQL na AWS
-- ============================================================

-- Enum de roles
CREATE TYPE app_role AS ENUM ('super_admin', 'manager', 'technician');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'validating', 'completed', 'rejected');
CREATE TYPE movement_type AS ENUM ('entrada', 'saida');

-- Tabela de Funcionários
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role app_role DEFAULT 'technician',
    unit VARCHAR(100),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    skills TEXT[], -- Array de skills
    avatar VARCHAR(10),
    status VARCHAR(20) DEFAULT 'Ativo',
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Locais/Unidades
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    areas INT DEFAULT 0,
    geofence_radius INT DEFAULT 100,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ordens de Serviço
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status task_status DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'Média',
    technician_id INT REFERENCES employees(id) ON DELETE SET NULL,
    location_id INT REFERENCES locations(id),
    location_name VARCHAR(100),
    area VARCHAR(100),
    scheduled_at TIME,
    sla VARCHAR(20),
    checklist TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Estoque/Materiais
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit VARCHAR(20),
    stock INT NOT NULL DEFAULT 0,
    min_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Movimentações de Estoque
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES inventory(id) ON DELETE CASCADE,
    type movement_type NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    user_id INT REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ponto (Time Clock)
CREATE TABLE time_clock (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    gps_in BOOLEAN DEFAULT false,
    gps_out BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ok',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Validação de Serviço
CREATE TABLE validations (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    photo_before TEXT,
    photo_after TEXT,
    gps_valid BOOLEAN DEFAULT false,
    checklist TEXT[],
    checklist_done BOOLEAN[],
    materials JSONB,
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Auditoria (Logs Imutáveis - sem DELETE)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES employees(id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    log_type VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tokens Push (FCM/APNs)
CREATE TABLE push_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES employees(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(10) DEFAULT 'web', -- android, ios, web
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, token)
);

-- Índices para performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_technician ON tasks(technician_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_time_clock_employee ON time_clock(employee_id);
CREATE INDEX idx_stock_movements_material ON stock_movements(material_id);
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
