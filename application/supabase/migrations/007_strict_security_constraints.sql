-- Migración: Restricciones de Seguridad y Unicidad Global
-- Fecha: 2025-12-30
-- Propósito: Prevenir duplicados y validar formatos

-- PASO 1: Limpiar datos duplicados existentes (solo desarrollo)
-- En producción, revisar manualmente antes de ejecutar
DO $$
BEGIN
  -- Eliminar duplicados manteniendo el registro más antiguo
  DELETE FROM user_payment_data a
  USING user_payment_data b
  WHERE a.id > b.id
  AND (
    a.id_number = b.id_number OR
    a.email = b.email OR
    a.whatsapp_primary = b.whatsapp_primary OR
    a.pago_movil_phone = b.pago_movil_phone OR
    a.account_number = b.account_number
  );
END $$;

-- PASO 2: Aplicar restricciones UNIQUE (Unicidad Global)
-- NOTA: paypal_email NO tiene UNIQUE porque los usuarios pueden cambiarlo
ALTER TABLE user_payment_data
ADD CONSTRAINT unique_id_number UNIQUE (id_number),
ADD CONSTRAINT unique_email UNIQUE (email),
ADD CONSTRAINT unique_whatsapp UNIQUE (whatsapp_primary),
ADD CONSTRAINT unique_pago_movil UNIQUE (pago_movil_phone),
ADD CONSTRAINT unique_account_number UNIQUE (account_number);

-- PASO 3: Aplicar restricciones CHECK (Validación de Formato)
ALTER TABLE user_payment_data
ADD CONSTRAINT check_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
ADD CONSTRAINT check_paypal_format
  CHECK (paypal_email IS NULL OR paypal_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
ADD CONSTRAINT check_id_number_length
  CHECK (LENGTH(TRIM(id_number)) >= 6 AND LENGTH(TRIM(id_number)) <= 20),
ADD CONSTRAINT check_id_number_format
  CHECK (id_number ~ '^[VEJP]-[A-Z0-9-]+$'),
ADD CONSTRAINT check_account_number_format
  CHECK (account_number ~ '^\d{20}$'),
ADD CONSTRAINT check_whatsapp_format
  CHECK (whatsapp_primary ~ '^\d{10,15}$'),
ADD CONSTRAINT check_pago_movil_format
  CHECK (pago_movil_phone IS NULL OR pago_movil_phone ~ '^\d{10,15}$');

-- PASO 4: Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON user_payment_data(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_id_number ON user_payment_data(id_number);
CREATE INDEX IF NOT EXISTS idx_payment_email ON user_payment_data(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON exchange_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON exchange_orders(status);

-- PASO 5: Reforzar políticas RLS (Row Level Security)
DROP POLICY IF EXISTS "Users can only view their own data" ON user_payment_data;
DROP POLICY IF EXISTS "Users can only modify their own data" ON user_payment_data;
DROP POLICY IF EXISTS "Users can only insert their own data" ON user_payment_data;
DROP POLICY IF EXISTS "Users can only update their own data" ON user_payment_data;

CREATE POLICY "Users can only view their own data"
ON user_payment_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own data"
ON user_payment_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own data"
ON user_payment_data
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PASO 6: Comentarios para documentación
COMMENT ON CONSTRAINT unique_id_number ON user_payment_data
IS 'Previene suplantación de identidad: cada cédula/pasaporte es único globalmente';
COMMENT ON CONSTRAINT check_email_format ON user_payment_data
IS 'Valida formato RFC 5322 básico para emails';
COMMENT ON CONSTRAINT check_id_number_format ON user_payment_data
IS 'Formato requerido: V-12345678, E-12345678, J-12345678, P-12345678';
