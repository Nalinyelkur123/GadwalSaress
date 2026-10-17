-- ====================================================================
-- GADWAL WEAVES — MULTI-VENDOR MARKETPLACE PRODUCTION DATABASE SCHEMA
-- PostgreSQL / Supabase Migration
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'seller', 'admin')) DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SELLERS (Artisans and Weavers)
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    story TEXT,
    location TEXT DEFAULT 'Gadwal, Telangana',
    experience_years INTEGER DEFAULT 10,
    artisan_count INTEGER DEFAULT 1,
    logo_url TEXT,
    cover_url TEXT,
    gstin TEXT,
    pan TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_beneficiary TEXT,
    pickup_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    kyc_status TEXT NOT NULL CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'additional_info_required')) DEFAULT 'pending',
    kyc_documents JSONB DEFAULT '{}'::jsonb,
    commission_rate NUMERIC(5,2) DEFAULT 10.00,
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'pending')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES & COLLECTIONS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    banner_url TEXT,
    tag TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS & INVENTORY
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
    original_price NUMERIC(12,2) NOT NULL CHECK (original_price >= base_price),
    discount_percent INTEGER DEFAULT 0,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    fabric TEXT NOT NULL,
    zari_type TEXT NOT NULL,
    border_style TEXT NOT NULL,
    saree_length_meters NUMERIC(4,2) DEFAULT 6.30,
    blouse_included BOOLEAN DEFAULT TRUE,
    blouse_length_meters NUMERIC(4,2) DEFAULT 0.80,
    color TEXT NOT NULL,
    primary_color TEXT NOT NULL,
    pallu_design TEXT,
    weaving_technique TEXT DEFAULT 'Traditional 3-shuttle interlocking pit loom',
    care_instructions TEXT DEFAULT 'Dry Clean Only. Store wrapped in soft muslin cloth.',
    gi_certified BOOLEAN DEFAULT TRUE,
    handloom_mark_certified BOOLEAN DEFAULT TRUE,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')) DEFAULT 'draft',
    admin_rejection_reason TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    apartment TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS & FULFILLMENT GROUPS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    shipping_address_snapshot JSONB NOT NULL,
    total_items_price NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    coupon_code TEXT,
    shipping_fee NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    final_amount NUMERIC(12,2) NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'cancelled', 'partially_refunded', 'refunded')) DEFAULT 'pending',
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.sellers(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_title TEXT NOT NULL,
    product_image TEXT,
    sku TEXT NOT NULL,
    fabric TEXT,
    unit_price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seller_fulfillment_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.sellers(id),
    subtotal NUMERIC(12,2) NOT NULL,
    commission_amount NUMERIC(12,2) NOT NULL,
    net_seller_amount NUMERIC(12,2) NOT NULL,
    fulfillment_status TEXT NOT NULL CHECK (fulfillment_status IN ('pending', 'processing', 'packed', 'ready_for_shipment', 'shipped', 'out_for_delivery', 'delivered', 'exception', 'cancelled', 'return_in_progress', 'returned')) DEFAULT 'pending',
    shipping_awb TEXT,
    courier_name TEXT,
    tracking_url TEXT,
    package_weight_kg NUMERIC(6,3),
    package_dimensions JSONB,
    pickup_scheduled_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    return_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SELLER LEDGER & PAYOUTS
CREATE TABLE IF NOT EXISTS public.seller_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id),
    fulfillment_group_id UUID NOT NULL REFERENCES public.seller_fulfillment_groups(id),
    gross_sales NUMERIC(12,2) NOT NULL,
    platform_commission NUMERIC(12,2) NOT NULL,
    net_earnings NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending_eligibility', 'available', 'requested', 'under_review', 'approved', 'processing', 'paid', 'failed', 'rejected')) DEFAULT 'pending_eligibility',
    payout_request_id UUID,
    settlement_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    bank_account_number TEXT NOT NULL,
    bank_ifsc TEXT NOT NULL,
    bank_beneficiary TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('requested', 'under_review', 'approved', 'paid', 'rejected')) DEFAULT 'requested',
    admin_notes TEXT,
    transaction_ref TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 8. REVIEWS & SUPPORT
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT TRUE,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'flagged')) DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('order', 'delivery', 'return', 'product', 'payout', 'general')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CMS & PROMOTIONS
CREATE TABLE IF NOT EXISTS public.cms_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement TEXT NOT NULL CHECK (placement IN ('hero', 'top_bar', 'promo_grid', 'middle_cta')),
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_order_value NUMERIC(12,2) DEFAULT 0,
    max_discount_amount NUMERIC(12,2),
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. IN-APP NOTIFICATIONS & SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    recipient_role TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'settings-001',
    marketplace_name TEXT NOT NULL DEFAULT 'Gadwal Weaves',
    support_email TEXT NOT NULL DEFAULT 'support@gadwalweaves.in',
    support_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
    announcement_bar_text TEXT NOT NULL,
    announcement_bar_link TEXT DEFAULT '/shop',
    announcement_bar_active BOOLEAN DEFAULT TRUE,
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    tax_rate_handloom NUMERIC(4,2) DEFAULT 5.00,
    free_shipping_threshold NUMERIC(12,2) DEFAULT 0,
    default_commission_rate NUMERIC(5,2) DEFAULT 10.00,
    meta_title TEXT,
    meta_description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_order ON public.seller_fulfillment_groups(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_seller ON public.seller_fulfillment_groups(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_ledger_seller ON public.seller_ledger(seller_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_fulfillment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
