-- Enable Row Level Security (RLS) on custom commerce tables
ALTER TABLE IF EXISTS public.peptech_commerce_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.peptech_commerce_audit ENABLE ROW LEVEL SECURITY;
