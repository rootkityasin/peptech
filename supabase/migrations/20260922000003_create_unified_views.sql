-- 1. Combined Product & Pricing Catalog View
CREATE OR REPLACE VIEW public.view_products_catalog AS
SELECT 
    p.id as product_id,
    p.title as product_name,
    p.handle,
    p.status,
    pv.title as variant_title,
    pv.sku,
    ROUND((pr.amount / 100.0), 2) as price_gbp,
    c.name as category_name
FROM public.product p
LEFT JOIN public.product_variant pv ON pv.product_id = p.id
LEFT JOIN public.product_variant_price_set pvps ON pvps.variant_id = pv.id
LEFT JOIN public.price pr ON pr.price_set_id = pvps.price_set_id AND pr.currency_code = 'gbp'
LEFT JOIN public.product_category_product pcp ON pcp.product_id = p.id
LEFT JOIN public.product_category c ON c.id = pcp.product_category_id;

-- 2. Orders Summary View
CREATE OR REPLACE VIEW public.view_orders_summary AS
SELECT 
    o.id as order_id,
    o.display_id as order_number,
    o.status,
    o.currency_code,
    c.email as customer_email,
    o.created_at
FROM public.order o
LEFT JOIN public.customer c ON c.id = o.customer_id;

-- 3. Customers Directory View
CREATE OR REPLACE VIEW public.view_customers_directory AS
SELECT 
    c.id as customer_id,
    c.email,
    c.first_name,
    c.last_name,
    c.phone,
    c.created_at
FROM public.customer c;
