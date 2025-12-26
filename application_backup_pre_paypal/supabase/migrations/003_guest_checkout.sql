-- Migration: Add guest checkout fields to exchange_orders table
-- Run this in Supabase SQL Editor

-- Add new columns for guest checkout
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(20) UNIQUE;
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS paypal_email VARCHAR(255);
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS id_number VARCHAR(20);
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS phone_pago_movil VARCHAR(20);
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4);
ALTER TABLE exchange_orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Make user_id nullable for guest orders
ALTER TABLE exchange_orders ALTER COLUMN user_id DROP NOT NULL;

-- Create index for ticket_id lookups
CREATE INDEX IF NOT EXISTS idx_exchange_orders_ticket_id ON exchange_orders(ticket_id);

-- Create index for guest orders
CREATE INDEX IF NOT EXISTS idx_exchange_orders_is_guest ON exchange_orders(is_guest);

-- Update RLS policy to allow guest order creation (INSERT without auth)
DROP POLICY IF EXISTS "Allow guest order creation" ON exchange_orders;
CREATE POLICY "Allow guest order creation" ON exchange_orders
    FOR INSERT
    WITH CHECK (is_guest = true AND user_id IS NULL);

-- Allow anyone to view guest orders by ticket_id
DROP POLICY IF EXISTS "Users can view their own orders" ON exchange_orders;
CREATE POLICY "Users can view their own orders" ON exchange_orders
    FOR SELECT
    USING (auth.uid() = user_id OR is_guest = true);

-- Grant insert permission to anon role for guest orders
GRANT INSERT ON exchange_orders TO anon;
GRANT SELECT ON exchange_orders TO anon;
