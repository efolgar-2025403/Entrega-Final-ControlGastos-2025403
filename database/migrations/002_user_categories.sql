-- ============================================
-- CONTROL-GASTOS
-- Migración 002: Categorías por usuario
-- ============================================

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS user_id BIGINT;

ALTER TABLE categories
DROP CONSTRAINT IF EXISTS fk_categories_user;

ALTER TABLE categories
ADD CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_categories_user_id
    ON categories(user_id);