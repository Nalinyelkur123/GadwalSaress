export type UserRole = 'customer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  description: string;
  story: string;
  location: string;
  experience_years: number;
  artisan_count?: number;
  logo_url?: string;
  cover_url?: string;
  gstin?: string;
  pan?: string;
  pickup_address: Address;
  kyc_status: 'pending' | 'approved' | 'rejected' | 'additional_info_required';
  commission_rate: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  status: 'active' | 'suspended' | 'pending';
}

export interface Address {
  id?: string;
  full_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active?: boolean;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  banner_url?: string;
  tag?: string;
  display_order: number;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  seller_slug?: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  collection_id?: string;
  base_price: number;
  original_price: number;
  discount_percent: number;
  sku: string;
  stock_quantity: number;
  fabric: string;
  zari_type: string;
  border_style: string;
  saree_length_meters: number;
  blouse_included: boolean;
  color: string;
  primary_color: string;
  pallu_design?: string;
  weaving_technique: string;
  care_instructions: string;
  gi_certified: boolean;
  handloom_mark_certified: boolean;
  images: string[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  admin_rejection_reason?: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  seller_id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  sku: string;
  fabric: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface SellerFulfillmentGroup {
  id: string;
  order_id: string;
  seller_id: string;
  seller_name: string;
  items: OrderItem[];
  subtotal: number;
  commission_amount: number;
  net_seller_amount: number;
  fulfillment_status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'unfulfilled';
  shipping_awb?: string;
  courier_name?: string;
  tracking_url?: string;
  package_weight_kg?: number;
  shipped_at?: string;
  delivered_at?: string;
  cancellation_reason?: string;
  return_reason?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  items: OrderItem[];
  fulfillment_groups: SellerFulfillmentGroup[];
  total_items_price: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  tax_amount: number;
  final_amount: number;
  payment_status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  notes?: string;
  cancellation_reason?: string;
  return_reason?: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface CMSBanner {
  id: string;
  placement: 'hero' | 'top_bar' | 'promo_grid' | 'middle_cta';
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  image_url: string;
  is_active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  valid_until?: string;
  used_count?: number;
  is_active: boolean;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  recipient_role?: UserRole;
  title: string;
  message: string;
  type: 'order' | 'product' | 'kyc' | 'payout' | 'shipping' | 'refund' | 'system';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  marketplace_name: string;
  support_email: string;
  support_phone: string;
  announcement_bar_text: string;
  announcement_bar_link?: string;
  announcement_bar_active: boolean;
  currency: string;
  currency_symbol: string;
  tax_rate_handloom: number;
  free_shipping_threshold: number;
  default_commission_rate: number;
  meta_title: string;
  meta_description: string;
}

export interface CustomerSummary extends UserProfile {
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  is_suspended?: boolean;
}

