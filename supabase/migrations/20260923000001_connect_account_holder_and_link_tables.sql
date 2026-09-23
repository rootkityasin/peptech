-- PEPTECH Schema Migration: Connect account_holder and module link tables
-- Ensures PostgreSQL foreign key relationships for Supabase ERD visualization and database-level relational integrity

-- 1. Connect account_holder table directly to customer
ALTER TABLE public.account_holder 
  ADD COLUMN IF NOT EXISTS customer_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_account_holder_customer'
  ) THEN
    ALTER TABLE public.account_holder
      ADD CONSTRAINT fk_account_holder_customer
      FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IDX_account_holder_customer_id" ON public.account_holder(customer_id);

-- 2. Connect customer_account_holder link table to customer and account_holder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cah_customer'
  ) THEN
    ALTER TABLE public.customer_account_holder
      ADD CONSTRAINT fk_cah_customer
      FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cah_account_holder'
  ) THEN
    ALTER TABLE public.customer_account_holder
      ADD CONSTRAINT fk_cah_account_holder
      FOREIGN KEY (account_holder_id) REFERENCES public.account_holder(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Bi-directional sync trigger between account_holder and customer_account_holder
CREATE OR REPLACE FUNCTION public.sync_customer_account_holder()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.account_holder
    SET customer_id = NEW.customer_id
    WHERE id = NEW.account_holder_id AND (customer_id IS NULL OR customer_id != NEW.customer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_customer_account_holder ON public.customer_account_holder;
CREATE TRIGGER trg_sync_customer_account_holder
AFTER INSERT OR UPDATE ON public.customer_account_holder
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_account_holder();

-- 4. Connect publishable_api_key_sales_channel link table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_paksc_api_key') THEN
    ALTER TABLE public.publishable_api_key_sales_channel
      ADD CONSTRAINT fk_paksc_api_key
      FOREIGN KEY (publishable_key_id) REFERENCES public.api_key(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_paksc_sales_channel') THEN
    ALTER TABLE public.publishable_api_key_sales_channel
      ADD CONSTRAINT fk_paksc_sales_channel
      FOREIGN KEY (sales_channel_id) REFERENCES public.sales_channel(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Connect Cart & Order Payment Collections
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cpc_cart') THEN
    ALTER TABLE public.cart_payment_collection
      ADD CONSTRAINT fk_cpc_cart
      FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cpc_payment_collection') THEN
    ALTER TABLE public.cart_payment_collection
      ADD CONSTRAINT fk_cpc_payment_collection
      FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_opc_order') THEN
    ALTER TABLE public.order_payment_collection
      ADD CONSTRAINT fk_opc_order
      FOREIGN KEY (order_id) REFERENCES public.order(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_opc_payment_collection') THEN
    ALTER TABLE public.order_payment_collection
      ADD CONSTRAINT fk_opc_payment_collection
      FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Connect Order Cart link table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_oc_order') THEN
    ALTER TABLE public.order_cart
      ADD CONSTRAINT fk_oc_order
      FOREIGN KEY (order_id) REFERENCES public.order(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_oc_cart') THEN
    ALTER TABLE public.order_cart
      ADD CONSTRAINT fk_oc_cart
      FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Connect Sales Channel Stock Location & Shipping Options
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scsl_sales_channel') THEN
    ALTER TABLE public.sales_channel_stock_location
      ADD CONSTRAINT fk_scsl_sales_channel
      FOREIGN KEY (sales_channel_id) REFERENCES public.sales_channel(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scsl_stock_location') THEN
    ALTER TABLE public.sales_channel_stock_location
      ADD CONSTRAINT fk_scsl_stock_location
      FOREIGN KEY (stock_location_id) REFERENCES public.stock_location(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sops_shipping_option') THEN
    ALTER TABLE public.shipping_option_price_set
      ADD CONSTRAINT fk_sops_shipping_option
      FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sops_price_set') THEN
    ALTER TABLE public.shipping_option_price_set
      ADD CONSTRAINT fk_sops_price_set
      FOREIGN KEY (price_set_id) REFERENCES public.price_set(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 8. Connect Cart & Order Promotions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cp_cart') THEN
    ALTER TABLE public.cart_promotion
      ADD CONSTRAINT fk_cp_cart
      FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cp_promotion') THEN
    ALTER TABLE public.cart_promotion
      ADD CONSTRAINT fk_cp_promotion
      FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_op_order') THEN
    ALTER TABLE public.order_promotion
      ADD CONSTRAINT fk_op_order
      FOREIGN KEY (order_id) REFERENCES public.order(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_op_promotion') THEN
    ALTER TABLE public.order_promotion
      ADD CONSTRAINT fk_op_promotion
      FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 9. Clean up orphaned seed records and connect Product link tables
DELETE FROM public.product_sales_channel WHERE product_id NOT IN (SELECT id FROM public.product);
DELETE FROM public.product_variant_price_set WHERE variant_id NOT IN (SELECT id FROM public.product_variant);
DELETE FROM public.product_variant_inventory_item WHERE variant_id NOT IN (SELECT id FROM public.product_variant);
DELETE FROM public.product_shipping_profile WHERE product_id NOT IN (SELECT id FROM public.product);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_psc_product') THEN
    ALTER TABLE public.product_sales_channel
      ADD CONSTRAINT fk_psc_product
      FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_psc_sales_channel') THEN
    ALTER TABLE public.product_sales_channel
      ADD CONSTRAINT fk_psc_sales_channel
      FOREIGN KEY (sales_channel_id) REFERENCES public.sales_channel(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pvps_variant') THEN
    ALTER TABLE public.product_variant_price_set
      ADD CONSTRAINT fk_pvps_variant
      FOREIGN KEY (variant_id) REFERENCES public.product_variant(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pvps_price_set') THEN
    ALTER TABLE public.product_variant_price_set
      ADD CONSTRAINT fk_pvps_price_set
      FOREIGN KEY (price_set_id) REFERENCES public.price_set(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pvii_variant') THEN
    ALTER TABLE public.product_variant_inventory_item
      ADD CONSTRAINT fk_pvii_variant
      FOREIGN KEY (variant_id) REFERENCES public.product_variant(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pvii_inventory_item') THEN
    ALTER TABLE public.product_variant_inventory_item
      ADD CONSTRAINT fk_pvii_inventory_item
      FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_psp_product') THEN
    ALTER TABLE public.product_shipping_profile
      ADD CONSTRAINT fk_psp_product
      FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_psp_shipping_profile') THEN
    ALTER TABLE public.product_shipping_profile
      ADD CONSTRAINT fk_psp_shipping_profile
      FOREIGN KEY (shipping_profile_id) REFERENCES public.shipping_profile(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 10. Connect Order Claim, Exchange, Returns & User Preference
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_claim_order') THEN
    ALTER TABLE public.order_claim
      ADD CONSTRAINT fk_order_claim_order
      FOREIGN KEY (order_id) REFERENCES public.order(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_claim_item_claim') THEN
    ALTER TABLE public.order_claim_item
      ADD CONSTRAINT fk_order_claim_item_claim
      FOREIGN KEY (claim_id) REFERENCES public.order_claim(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_claim_item_image_item') THEN
    ALTER TABLE public.order_claim_item_image
      ADD CONSTRAINT fk_order_claim_item_image_item
      FOREIGN KEY (claim_item_id) REFERENCES public.order_claim_item(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_exchange_order') THEN
    ALTER TABLE public.order_exchange
      ADD CONSTRAINT fk_order_exchange_order
      FOREIGN KEY (order_id) REFERENCES public.order(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_exchange_item_exchange') THEN
    ALTER TABLE public.order_exchange_item
      ADD CONSTRAINT fk_order_exchange_item_exchange
      FOREIGN KEY (exchange_id) REFERENCES public.order_exchange(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_fulfillment_order') THEN
    ALTER TABLE public.order_fulfillment
      ADD CONSTRAINT fk_order_fulfillment_order
      FOREIGN KEY (order_id) REFERENCES public.order(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_return_order') THEN
    ALTER TABLE public.return
      ADD CONSTRAINT fk_return_order
      FOREIGN KEY (order_id) REFERENCES public.order(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_return_fulfillment_return') THEN
    ALTER TABLE public.return_fulfillment
      ADD CONSTRAINT fk_return_fulfillment_return
      FOREIGN KEY (return_id) REFERENCES public.return(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_return_item_return') THEN
    ALTER TABLE public.return_item
      ADD CONSTRAINT fk_return_item_return
      FOREIGN KEY (return_id) REFERENCES public.return(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_preference_user') THEN
    ALTER TABLE public.user_preference
      ADD CONSTRAINT fk_user_preference_user
      FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE;
  END IF;
END $$;
