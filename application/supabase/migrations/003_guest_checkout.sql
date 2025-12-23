-- Migration: Add guest checkout fields to orders table
-- Run this in Supabase SQL Editor

-- Add new columns for guest checkout
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(20) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paypal_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS id_number VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_pago_movil VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4);

-- Make user_id nullable for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Create index for ticket_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_ticket_id ON orders(ticket_id);

-- Create index for guest orders
CREATE INDEX IF NOT EXISTS idx_orders_is_guest ON orders(is_guest);

-- Update RLS policy to allow guest order creation (INSERT without auth)
DROP POLICY IF EXISTS "Allow guest order creation" ON orders;
CREATE POLICY "Allow guest order creation" ON orders
    FOR INSERT
    WITH CHECK (is_guest = true AND user_id IS NULL);

-- Keep existing policies for authenticated users
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT
    USING (auth.uid() = user_id OR is_guest = true);

-- Allow admins to view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update orders
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant insert permission to anon role for guest orders
GRANT INSERT ON orders TO anon;
