-- PEPTECH Schema Migration: Enable Row Level Security (RLS) on public.subscription
-- Protects recurring subscription and payment metadata from direct unauthenticated PostgREST exposure
ALTER TABLE IF EXISTS public.subscription ENABLE ROW LEVEL SECURITY;

-- Explicitly grant full management permissions to service_role (Medusa backend)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'subscription' 
      AND policyname = 'service_role_all_subscription'
  ) THEN
    CREATE POLICY "service_role_all_subscription" 
      ON public.subscription 
      FOR ALL 
      TO service_role 
      USING (true) 
      WITH CHECK (true);
  END IF;
END $$;

