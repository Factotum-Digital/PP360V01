-- 007_consolidated_security_pack.sql
-- Consolidated Migration: Replaces previous 007, 008, 009
-- Purpose: Complete Data Integrity & Security Layer (Idempotent)

-- SECTION 0: DATA NORMALIZATION (Fix bad formats before constraints)
DO $$
BEGIN
    -- Fix ID Numbers: Uppercase
    UPDATE user_payment_data 
    SET id_number = UPPER(id_number) 
    WHERE id_number IS NOT NULL AND id_number != UPPER(id_number);

    -- Fix ID Numbers: Add Hyphen if missing (e.g. V12345678 -> V-12345678)
    UPDATE user_payment_data
    SET id_number = LEFT(id_number, 1) || '-' || RIGHT(id_number, LENGTH(id_number)-1)
    WHERE id_number ~ '^[VEJP][0-9]+$';
    
    -- Fix Emails: Lowercase
    UPDATE user_payment_data
    SET email = LOWER(email)
    WHERE email IS NOT NULL AND email != LOWER(email);
    
    -- Fix Emails: Trim
    UPDATE user_payment_data
    SET email = TRIM(email)
    WHERE email IS NOT NULL AND email != TRIM(email);

END $$;

-- SECTION 1: CLEANUP DUPLICATES (Development Safety)
DO $$
BEGIN
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

-- SECTION 2: TABLE CONSTRAINTS (Unique & Check)
DO $$
BEGIN
    -- unique_id_number
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_id_number') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT unique_id_number UNIQUE (id_number);
    END IF;
    
    -- unique_email
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_email') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT unique_email UNIQUE (email);
    END IF;

    -- unique_whatsapp
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_whatsapp') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT unique_whatsapp UNIQUE (whatsapp_primary);
    END IF;

    -- unique_pago_movil
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_pago_movil') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT unique_pago_movil UNIQUE (pago_movil_phone);
    END IF;

    -- unique_account_number
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_account_number') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT unique_account_number UNIQUE (account_number);
    END IF;

    -- CHECK CONSTRAINTS
    -- check_email_format
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_email_format') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
    END IF;

    -- check_id_number_format
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_id_number_format') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT check_id_number_format CHECK (id_number ~ '^[VEJP]-[A-Z0-9-]+$');
    END IF;

    -- check_account_number_format
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_account_number_format') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT check_account_number_format CHECK (account_number ~ '^\d{20}$');
    END IF;

    -- check_whatsapp_format
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_whatsapp_format') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT check_whatsapp_format CHECK (whatsapp_primary ~ '^\d{10,15}$');
    END IF;
    
     -- check_pago_movil_format
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_pago_movil_format') THEN
        ALTER TABLE user_payment_data ADD CONSTRAINT check_pago_movil_format CHECK (pago_movil_phone IS NULL OR pago_movil_phone ~ '^\d{10,15}$');
    END IF;

END $$;

-- SECTION 3: INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON user_payment_data(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_id_number ON user_payment_data(id_number);
CREATE INDEX IF NOT EXISTS idx_payment_email ON user_payment_data(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON exchange_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON exchange_orders(status);

-- SECTION 4: RLS POLICIES (Security)

-- 4.1 user_payment_data
ALTER TABLE user_payment_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only view their own data" ON user_payment_data;
DROP POLICY IF EXISTS "Users can only modify their own data" ON user_payment_data;
DROP POLICY IF EXISTS "Users can only insert their own data" ON user_payment_data;
DROP POLICY IF EXISTS "Users can only update their own data" ON user_payment_data;

CREATE POLICY "Users can only view their own data" ON user_payment_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own data" ON user_payment_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own data" ON user_payment_data FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4.2 exchange_orders
ALTER TABLE exchange_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access" ON exchange_orders;
DROP POLICY IF EXISTS "Allow insert access" ON exchange_orders;
DROP POLICY IF EXISTS "Public can view orders" ON exchange_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON exchange_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON exchange_orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON exchange_orders;

CREATE POLICY "Users can view own orders" ON exchange_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON exchange_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Keeping update policy for now (e.g. for archiving), restricted to owner
CREATE POLICY "Users can update own orders" ON exchange_orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
