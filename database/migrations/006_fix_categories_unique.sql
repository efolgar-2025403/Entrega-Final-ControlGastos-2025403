BEGIN;

-- La migración 004 intentó eliminar la restriccion
-- antigua que prohibía el mismo nombre para una
-- categoria de gasto y otra de ingreso del mismo
-- usuario, pero su nombre era incorrecto.
--
-- La restricción real (creada en la 003) es
-- `categories_user_name_key`; la nueva
-- `categories_user_name_type_unique` ya cubre
-- el escenario, así que la antigua debe caerse.

ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_user_name_key;

COMMIT;