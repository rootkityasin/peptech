-- Enable Row Level Security (RLS) on all 147 public tables
DO $$ 
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;'; 
  END LOOP; 
END $$;

-- Public read-only policies for product catalog tables
DO $$ 
DECLARE 
  t text; 
  public_tables text[] := ARRAY[
    'product', 
    'product_variant', 
    'product_category', 
    'product_category_product', 
    'product_tags', 
    'price', 
    'price_set', 
    'price_rule', 
    'image', 
    'product_image', 
    'region', 
    'currency'
  ]; 
BEGIN 
  FOREACH t IN ARRAY public_tables LOOP 
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN 
      EXECUTE 'DROP POLICY IF EXISTS "Allow public read access" ON public.' || quote_ident(t) || ';'; 
      EXECUTE 'CREATE POLICY "Allow public read access" ON public.' || quote_ident(t) || ' FOR SELECT USING (true);'; 
    END IF; 
  END LOOP; 
END $$;
