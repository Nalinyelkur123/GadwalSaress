export type UserRole = 'customer' | 'seller' | 'admin';

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'additional_info_required';

export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'partially_refunded' | 'refunded';

export type FulfillmentStatus = 
  | 'pending'
  | 'processing'
  | 'packed'
  | 'ready_for_shipment'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'cancelled'
  | 'return_in_progress'
  | 'returned';

export type PayoutStatus = 
  | 'pending_eligibility'
  | 'available'
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_beneficiary?: string;
  pickup_address: Address;
  kyc_status: KycStatus;
  kyc_documents?: {
    pan_document_url?: string;
    gst_document_url?: string;
    handloom_card_url?: string;
    cancelled_cheque_url?: string;
  };
  commission_rate: number; // percentage, e.g. 10.0 for 10%
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
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
  is_active: boolean;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  banner_url?: string;
  tag?: string;
  display_order: number;
  is_active: boolean;
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
  reserved_quantity: number;
  fabric: string; // e.g., 'Pure Mulberry Silk', 'Sico (Silk Cotton)'
  zari_type: string; // e.g., 'Pure Silver Zari Gold Plated', 'Tested Zari'
  border_style: string; // e.g., 'Kuttu Interlock Border', 'Temple Border'
  saree_length_meters: number;
  blouse_included: boolean;
  blouse_length_meters?: number;
  color: string;
  primary_color: string;
  pallu_design?: string;
  weaving_technique: string; // e.g., 'Traditional 3-shuttle interlocking pit loom'
  care_instructions: string;
  gi_certified: boolean;
  handloom_mark_certified: boolean;
  images: string[];
  status: ProductStatus;
  admin_rejection_reason?: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  created_at: string;
  updated_at: string;
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
  fulfillment_status: FulfillmentStatus;
  shipping_awb?: string;
  courier_name?: string;
  tracking_url?: string;
  package_weight_kg?: number;
  package_dimensions?: {
    length_cm: number;
    breadth_cm: number;
    height_cm: number;
  };
  pickup_scheduled_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancellation_reason?: string;
  return_reason?: string;
  created_at: string;
  updated_at?: string;
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
  payment_status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SellerLedgerEntry {
  id: string;
  seller_id: string;
  order_id: string;
  fulfillment_group_id: string;
  gross_sales: number;
  platform_commission: number;
  net_earnings: number;
  status: PayoutStatus;
  payout_request_id?: string;
  settlement_date?: string;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  seller_id: string;
  seller_name: string;
  amount: number;
  bank_account_number: string;
  bank_ifsc: string;
  bank_beneficiary: string;
  status: PayoutStatus;
  admin_notes?: string;
  transaction_ref?: string;
  requested_at: string;
  processed_at?: string;
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
  images?: string[];
  status: 'approved' | 'pending' | 'flagged';
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  order_id?: string;
  subject: string;
  category: 'order' | 'delivery' | 'return' | 'product' | 'payout' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message: string;
  attachments?: string[];
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
  mobile_image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  actor_role: UserRole;
  action: string;
  target_type: string;
  target_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface InAppNotification {
  id: string;
  user_id: string; // or 'admin' or seller user_id or customer user_id
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
  tax_rate_handloom: number; // percentage, e.g. 5
  free_shipping_threshold: number; // e.g. 0
  default_commission_rate: number; // e.g. 10.0
  meta_title: string;
  meta_description: string;
}

export interface CustomerSummary extends UserProfile {
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  is_suspended?: boolean;
}

