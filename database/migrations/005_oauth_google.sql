-- ============================================
-- CONTROL-GASTOS
-- Migración 005: Autenticación con Google
-- ============================================

-- Identificador único e inmutable que Google
-- asigna a la cuenta (claim "sub" del ID token).
-- NULL para usuarios registrados localmente.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255);

-- URL opcional del avatar de Google (claim "picture").
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_picture VARCHAR(500);

-- Las cuentas creadas mediante Google no tienen
-- contraseña, por lo que password_hash deja de
-- ser obligatorio.
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Garantiza que una cuenta de Google solo pueda
-- vincularse a un único usuario de CONTROL-GASTOS.
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_google_sub_key;

ALTER TABLE users
ADD CONSTRAINT users_google_sub_key
UNIQUE (google_sub);

CREATE INDEX IF NOT EXISTS idx_users_google_sub
ON users(google_sub);