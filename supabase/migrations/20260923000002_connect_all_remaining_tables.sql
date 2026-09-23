-- PEPTECH Schema Migration: Connect remaining domain, currency, fulfillment, and user tables
-- Ensures foreign key integrity across Currency, Fulfillment Providers, Payment Providers, Refund Reasons, and Admin configurations

-- 1. Connect Currency table to Cart, Order, Price, and Region
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cart_currency') THEN
    ALTER TABLE public.cart
      ADD CONSTRAINT fk_cart_currency
      FOREIGN KEY (currency_code) REFERENCES public.currency(code) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_currency') THEN
    ALTER TABLE public."order"
      ADD CONSTRAINT fk_order_currency
      FOREIGN KEY (currency_code) REFERENCES public.currency(code) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_price_currency') THEN
    ALTER TABLE public.price
      ADD CONSTRAINT fk_price_currency
      FOREIGN KEY (currency_code) REFERENCES public.currency(code) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_region_currency') THEN
    ALTER TABLE public.region
      ADD CONSTRAINT fk_region_currency
      FOREIGN KEY (currency_code) REFERENCES public.currency(code) ON DELETE RESTRICT;
  END IF;
END $$;

-- 2. Connect Location Fulfillment Provider & Fulfillment Set
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_lfp_stock_location') THEN
    ALTER TABLE public.location_fulfillment_provider
      ADD CONSTRAINT fk_lfp_stock_location
      FOREIGN KEY (stock_location_id) REFERENCES public.stock_location(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_lfp_fulfillment_provider') THEN
    ALTER TABLE public.location_fulfillment_provider
      ADD CONSTRAINT fk_lfp_fulfillment_provider
      FOREIGN KEY (fulfillment_provider_id) REFERENCES public.fulfillment_provider(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_lfs_stock_location') THEN
    ALTER TABLE public.location_fulfillment_set
      ADD CONSTRAINT fk_lfs_stock_location
      FOREIGN KEY (stock_location_id) REFERENCES public.stock_location(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_lfs_fulfillment_set') THEN
    ALTER TABLE public.location_fulfillment_set
      ADD CONSTRAINT fk_lfs_fulfillment_set
      FOREIGN KEY (fulfillment_set_id) REFERENCES public.fulfillment_set(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Connect Region Payment Provider
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rpp_region') THEN
    ALTER TABLE public.region_payment_provider
      ADD CONSTRAINT fk_rpp_region
      FOREIGN KEY (region_id) REFERENCES public.region(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rpp_payment_provider') THEN
    ALTER TABLE public.region_payment_provider
      ADD CONSTRAINT fk_rpp_payment_provider
      FOREIGN KEY (payment_provider_id) REFERENCES public.payment_provider(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Connect Refund to Refund Reason
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_refund_refund_reason') THEN
    ALTER TABLE public.refund
      ADD CONSTRAINT fk_refund_refund_reason
      FOREIGN KEY (refund_reason_id) REFERENCES public.refund_reason(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Connect User & Admin Configurations (Layout, Views, RBAC)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_lc_user') THEN
    ALTER TABLE public.layout_configuration
      ADD CONSTRAINT fk_lc_user
      FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vc_user') THEN
    ALTER TABLE public.view_configuration
      ADD CONSTRAINT fk_vc_user
      FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_urr_user') THEN
    ALTER TABLE public.user_rbac_role
      ADD CONSTRAINT fk_urr_user
      FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_irr_invite') THEN
    ALTER TABLE public.invite_rbac_role
      ADD CONSTRAINT fk_irr_invite
      FOREIGN KEY (invite_id) REFERENCES public.invite(id) ON DELETE CASCADE;
  END IF;
END $$;
