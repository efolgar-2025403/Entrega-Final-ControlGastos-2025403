BEGIN;

ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_name_key;

ALTER TABLE categories
ADD CONSTRAINT categories_user_name_key
UNIQUE (user_id, name);

COMMIT;