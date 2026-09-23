-- PEPTECH Schema Migration: Create and Connect Subscription Table
-- Directly connects 28-day Cartridge & Vial subscriptions with customer and account_holder

CREATE TABLE IF NOT EXISTS public.subscription (
  id text NOT NULL PRIMARY KEY,
  customer_id text NOT NULL,
  account_holder_id text,
  product_id text,
  variant_id text,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  frequency_days integer NOT NULL DEFAULT 28,
  unit_price numeric NOT NULL,
  discount_percentage numeric NOT NULL DEFAULT 10,
  quantity integer NOT NULL DEFAULT 1,
  next_billing_at timestamp with time zone NOT NULL,
  next_dispatch_at timestamp with time zone NOT NULL,
  card_last4 text,
  shipping_address jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Foreign Key Constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscription_customer') THEN
    ALTER TABLE public.subscription
      ADD CONSTRAINT fk_subscription_customer
      FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscription_account_holder') THEN
    ALTER TABLE public.subscription
      ADD CONSTRAINT fk_subscription_account_holder
      FOREIGN KEY (account_holder_id) REFERENCES public.account_holder(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscription_product') THEN
    ALTER TABLE public.subscription
      ADD CONSTRAINT fk_subscription_product
      FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscription_variant') THEN
    ALTER TABLE public.subscription
      ADD CONSTRAINT fk_subscription_variant
      FOREIGN KEY (variant_id) REFERENCES public.product_variant(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_customer_id ON public.subscription(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_account_holder_id ON public.subscription(account_holder_id);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON public.subscription(status);
CREATE INDEX IF NOT EXISTS idx_subscription_next_billing_at ON public.subscription(next_billing_at);
