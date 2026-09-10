ALTER TABLE categories
ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'expense';

ALTER TABLE categories
ADD CONSTRAINT categories_type_check
CHECK (type IN ('expense', 'income'));

ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_user_id_name_key;

ALTER TABLE categories
ADD CONSTRAINT categories_user_name_type_unique
UNIQUE (user_id, name, type);