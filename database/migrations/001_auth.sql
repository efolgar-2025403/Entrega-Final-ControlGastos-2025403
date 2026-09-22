-- ============================================
-- CONTROL-GASTOS
-- Migración 001: Usuarios y autenticación
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

-- Relación entre gastos y usuarios
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS user_id BIGINT;

ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS fk_expenses_user;

ALTER TABLE expenses
ADD CONSTRAINT fk_expenses_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_expenses_user_id
    ON expenses(user_id);