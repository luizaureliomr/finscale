-- Criar extensão para gerar UUIDs (se necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  crm VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL,
  specialty VARCHAR(100),
  photo_url TEXT,
  firebase_uid VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de instituições
CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de unidades (setores) da instituição
CREATE TABLE IF NOT EXISTS institution_units (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de plantão
CREATE TABLE IF NOT EXISTS shift_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de valores de plantão por tipo e instituição
CREATE TABLE IF NOT EXISTS shift_values (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
  shift_type_id INTEGER REFERENCES shift_types(id) ON DELETE CASCADE,
  value DECIMAL(10, 2) NOT NULL,
  additional_night DECIMAL(10, 2) DEFAULT 0,
  additional_weekend DECIMAL(10, 2) DEFAULT 0,
  additional_holiday DECIMAL(10, 2) DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_to DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(institution_id, shift_type_id, valid_from)
);

-- Tabela de plantões
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES institution_units(id) ON DELETE CASCADE,
  shift_type_id INTEGER REFERENCES shift_types(id) ON DELETE SET NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, canceled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de substituições de plantão
CREATE TABLE IF NOT EXISTS shift_substitutions (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
  original_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  substitute_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, canceled
  reference_month VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de detalhes de pagamento (relação com plantões)
CREATE TABLE IF NOT EXISTS payment_details (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  shift_id INTEGER REFERENCES shifts(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configuração tributária do usuário
CREATE TABLE IF NOT EXISTS user_tax_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  cnpj VARCHAR(20),
  tax_regime VARCHAR(50), -- simples, presumido, real
  tax_rates JSON, -- Configuração de impostos armazenada em JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Tabela de obrigações fiscais
CREATE TABLE IF NOT EXISTS tax_obligations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, canceled
  reference_period VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
  tax_type VARCHAR(50) NOT NULL, -- ISS, IRPJ, CSLL, PIS, COFINS, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_institution_id ON shifts(institution_id);
CREATE INDEX IF NOT EXISTS idx_shifts_dates ON shifts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_institution_id ON payments(institution_id); 