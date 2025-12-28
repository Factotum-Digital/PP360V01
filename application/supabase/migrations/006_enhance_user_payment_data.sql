-- Migration: 006_enhance_user_payment_data.sql
-- Descripción: Expande la tabla user_payment_data para soportar el perfil completo de usuario
-- Nota: Estas columnas ya existen en producción/Supabase, este archivo sincroniza el entorno local.

-- 1. Campos de Identidad
ALTER TABLE user_payment_data 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+58';

-- 2. Campos de Contacto Avanzado
ALTER TABLE user_payment_data 
ADD COLUMN IF NOT EXISTS whatsapp_primary VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_secondary VARCHAR(50);

-- 3. Campos de Cuenta Bancaria (Detalles)
ALTER TABLE user_payment_data 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'CORRIENTE', -- CORRIENTE / AHORRO
ADD COLUMN IF NOT EXISTS enable_transfer BOOLEAN DEFAULT true;

-- 4. Campos Específicos de Pago Móvil (Separados de banco principal)
ALTER TABLE user_payment_data 
ADD COLUMN IF NOT EXISTS pago_movil_bank VARCHAR(100),
ADD COLUMN IF NOT EXISTS pago_movil_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS pago_movil_cedula VARCHAR(50);

-- 5. Campos de PayPal
ALTER TABLE user_payment_data 
ADD COLUMN IF NOT EXISTS paypal_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_status VARCHAR(20) DEFAULT 'unverified', -- unverified / pending / verified
ADD COLUMN IF NOT EXISTS paypal_verified BOOLEAN DEFAULT false;

-- 6. Metricas de Perfil
ALTER TABLE user_payment_data 
ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- Comentarios explicativos
COMMENT ON COLUMN user_payment_data.full_name IS 'Nombre completo verificado del usuario';
COMMENT ON COLUMN user_payment_data.country_code IS 'Código de país para WhatsApp (+58, +1, etc)';
COMMENT ON COLUMN user_payment_data.pago_movil_bank IS 'Banco específico para Pago Móvil (puede ser distinto al de transferencia)';
COMMENT ON COLUMN user_payment_data.paypal_status IS 'Estado de verificación de la cuenta PayPal';
COMMENT ON COLUMN user_payment_data.profile_completion IS 'Porcentaje de completitud del perfil (0-100)';
