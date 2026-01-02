-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'REFERRAL', 'COUPON', 'SEASONAL'
    discount_percent NUMERIC DEFAULT 0,
    owner_id UUID REFERENCES auth.users(id),
    uses_count INTEGER DEFAULT 0,
    max_uses INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy for campaigns (Simplified admin check)
CREATE POLICY "Enable all access for admins and service role" ON public.campaigns
    FOR ALL
    TO service_role, authenticated
    USING (
        auth.jwt() ->> 'email' IN ('wilfredy54@gmail.com')
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('wilfredy54@gmail.com')
    );

-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.exchange_orders(order_id) NOT NULL,
    user_email TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Create policy for disputes (Simplified admin check)
CREATE POLICY "Enable all access for admins and service role disputes" ON public.disputes
    FOR ALL
    TO service_role, authenticated
    USING (
        auth.jwt() ->> 'email' IN ('wilfredy54@gmail.com')
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('wilfredy54@gmail.com')
    );

-- Comment on tables
COMMENT ON TABLE public.campaigns IS 'Promotional campaigns, coupons and referral codes';
COMMENT ON TABLE public.disputes IS 'User disputes regarding exchange orders';
