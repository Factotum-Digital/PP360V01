-- Migration: 005_user_payment_data.sql
-- Descripción: Tabla para guardar datos de pago del usuario (banco, cédula, teléfono)

CREATE TABLE IF NOT EXISTS user_payment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos bancarios
  bank_name VARCHAR(100),
  id_number VARCHAR(50),
  
  -- Pago Móvil
  phone_pago_movil VARCHAR(20),
  
  -- Transferencia Bancaria
  account_number VARCHAR(50),
  account_holder VARCHAR(200),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un usuario solo puede tener un registro de datos de pago
  UNIQUE(user_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_user_payment_data_user_id ON user_payment_data(user_id);

-- RLS Policies
ALTER TABLE user_payment_data ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver y modificar sus propios datos
CREATE POLICY "Users can view own payment data" ON user_payment_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment data" ON user_payment_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment data" ON user_payment_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_payment_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_payment_data_timestamp
  BEFORE UPDATE ON user_payment_data
  FOR EACH ROW
  EXECUTE FUNCTION update_user_payment_data_updated_at();

-- Comentarios
COMMENT ON TABLE user_payment_data IS 'Datos de pago guardados del usuario para pre-llenar formularios';
COMMENT ON COLUMN user_payment_data.bank_name IS 'Banco donde recibe pagos (Banesco, Mercantil, etc.)';
COMMENT ON COLUMN user_payment_data.id_number IS 'Cédula o RIF del usuario';
COMMENT ON COLUMN user_payment_data.phone_pago_movil IS 'Teléfono asociado a Pago Móvil';
COMMENT ON COLUMN user_payment_data.account_number IS 'Número de cuenta bancaria para transferencias';
COMMENT ON COLUMN user_payment_data.account_holder IS 'Nombre del titular de la cuenta bancaria';
