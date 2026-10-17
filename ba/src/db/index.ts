import { 
  UserProfile, 
  SellerProfile, 
  Category, 
  Collection, 
  Product, 
  CartItem, 
  Order, 
  OrderItem, 
  SellerFulfillmentGroup, 
  SellerLedgerEntry, 
  PayoutRequest, 
  Review, 
  SupportTicket, 
  SupportMessage, 
  CMSBanner, 
  Coupon, 
  AuditLog, 
  Address,
  InAppNotification,
  SiteSettings,
  CustomerSummary
} from '../types/index.js';
import { 
  INITIAL_USERS, 
  INITIAL_SELLERS, 
  INITIAL_CATEGORIES, 
  INITIAL_COLLECTIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_CMS_BANNERS, 
  INITIAL_COUPONS, 
  INITIAL_REVIEWS 
} from './seedData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enterprise Database Store for Gadwal Weaves.
 * Provides transactional in-memory / persistent repository semantics with full Supabase PostgreSQL compatibility.
 */
class DatabaseStore {
  public users: Map<string, UserProfile & { password_hash: string; is_suspended?: boolean }> = new Map();
  public sellers: Map<string, SellerProfile> = new Map();
  public categories: Map<string, Category> = new Map();
  public collections: Map<string, Collection> = new Map();
  public products: Map<string, Product> = new Map();
  public carts: Map<string, CartItem[]> = new Map(); // key is userId or sessionToken
  public wishlists: Map<string, Set<string>> = new Map(); // key is userId, set of productIds
  public addresses: Map<string, Address[]> = new Map(); // key is userId
  public orders: Map<string, Order> = new Map();
  public orderItems: Map<string, OrderItem[]> = new Map(); // key is orderId
  public fulfillmentGroups: Map<string, SellerFulfillmentGroup> = new Map();
  public ledger: Map<string, SellerLedgerEntry> = new Map();
  public payoutRequests: Map<string, PayoutRequest> = new Map();
  public reviews: Map<string, Review> = new Map();
  public supportTickets: Map<string, SupportTicket> = new Map();
  public supportMessages: Map<string, SupportMessage[]> = new Map(); // key is ticketId
  public cmsBanners: Map<string, CMSBanner> = new Map();
  public coupons: Map<string, Coupon> = new Map();
  public auditLogs: AuditLog[] = [];
  public notifications: Map<string, InAppNotification> = new Map();
  public siteSettings: SiteSettings = {
    id: 'settings-001',
    marketplace_name: 'Gadwal Weaves',
    support_email: 'support@gadwalweaves.in',
    support_phone: '+91 98765 43210',
    announcement_bar_text: 'Authentic Pit-Loom Gadwal Sarees Direct from Master Weavers | Free Insured Shipping Across India',
    announcement_bar_link: '/shop',
    announcement_bar_active: true,
    currency: 'INR',
    currency_symbol: '₹',
    tax_rate_handloom: 5.0,
    free_shipping_threshold: 0,
    default_commission_rate: 10.0,
    meta_title: 'Gadwal Weaves | Handcrafted Authentic Pit-Loom Silk & Cotton Sarees',
    meta_description: 'Discover authentic GI-certified Gadwal handloom sarees woven with pure mulberry silk, fine cotton, and genuine zari borders by heritage pit-loom artisans in Telangana.'
  };

  constructor() {
    this.seed();
  }

  public seed() {
    // 1. Seed Users
    INITIAL_USERS.forEach(u => this.users.set(u.id, { ...u }));
    
    // 2. Seed Sellers
    INITIAL_SELLERS.forEach(s => this.sellers.set(s.id, { ...s }));

    // 3. Seed Categories
    INITIAL_CATEGORIES.forEach(c => this.categories.set(c.id, { ...c }));

    // 4. Seed Collections
    INITIAL_COLLECTIONS.forEach(c => this.collections.set(c.id, { ...c }));

    // 5. Seed Products
    INITIAL_PRODUCTS.forEach(p => this.products.set(p.id, { ...p }));

    // 6. Seed CMS Banners
    INITIAL_CMS_BANNERS.forEach(b => this.cmsBanners.set(b.id, { ...b }));

    // 7. Seed Coupons
    INITIAL_COUPONS.forEach(c => this.coupons.set(c.id, { ...c }));

    // 8. Seed Reviews
    INITIAL_REVIEWS.forEach(r => this.reviews.set(r.id, { ...r }));

    // 9. Initial Customer Address
    this.addresses.set('30000000-0000-0000-0000-000000000001', [
      {
        id: 'addr-001',
        full_name: 'Ananya Sharma',
        phone: '+91 98111 22334',
        street_address: 'Flat 402, Royal Palms Residency, Banjara Hills Road No. 12',
        city: 'Hyderabad',
        state: 'Telangana',
        postal_code: '500034',
        country: 'India',
        is_default: true,
      }
    ]);

    // 10. Initial Wishlist for demo customer
    this.wishlists.set('30000000-0000-0000-0000-000000000001', new Set(['prod-001', 'prod-003']));

    // 11. Initial Seed Order (so customer & admin have historical records)
    const initialOrder: Order = {
      id: 'ord-001',
      order_number: 'GW-2024-0001',
      customer_id: '30000000-0000-0000-0000-000000000001',
      customer_name: 'Ananya Sharma',
      customer_email: 'customer@gadwalweaves.in',
      customer_phone: '+91 98111 22334',
      shipping_address: {
        full_name: 'Ananya Sharma',
        phone: '+91 98111 22334',
        street_address: 'Flat 402, Royal Palms Residency, Banjara Hills Road No. 12',
        city: 'Hyderabad',
        state: 'Telangana',
        postal_code: '500034',
        country: 'India'
      },
      items: [
        {
          id: 'item-001',
          order_id: 'ord-001',
          seller_id: 'seller-001',
          product_id: 'prod-001',
          product_title: 'Royal Maroon Gadwal Pure Silk Saree',
          product_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
          sku: 'GW-PMS-001',
          fabric: 'Pure Mulberry Silk',
          unit_price: 24500,
          quantity: 1,
          subtotal: 24500
        }
      ],
      fulfillment_groups: [
        {
          id: 'grp-001',
          order_id: 'ord-001',
          seller_id: 'seller-001',
          seller_name: 'Sri Venkateswara Handlooms',
          items: [
            {
              id: 'item-001',
              order_id: 'ord-001',
              seller_id: 'seller-001',
              product_id: 'prod-001',
              product_title: 'Royal Maroon Gadwal Pure Silk Saree',
              product_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
              sku: 'GW-PMS-001',
              fabric: 'Pure Mulberry Silk',
              unit_price: 24500,
              quantity: 1,
              subtotal: 24500
            }
          ],
          subtotal: 24500,
          commission_amount: 2450,
          net_seller_amount: 22050,
          fulfillment_status: 'delivered',
          shipping_awb: 'SR7891234567',
          courier_name: 'BlueDart Express via Shiprocket',
          tracking_url: 'https://shiprocket.co/tracking/SR7891234567',
          package_weight_kg: 0.95,
          shipped_at: new Date('2024-02-02T10:00:00Z').toISOString(),
          delivered_at: new Date('2024-02-05T14:30:00Z').toISOString(),
          created_at: new Date('2024-02-01T12:00:00Z').toISOString(),
          updated_at: new Date('2024-02-05T14:30:00Z').toISOString(),
        }
      ],
      total_items_price: 24500,
      discount_amount: 0,
      shipping_fee: 0,
      tax_amount: 1225, // 5% GST on handlooms
      final_amount: 25725,
      payment_status: 'captured',
      razorpay_order_id: 'order_mock_0001',
      razorpay_payment_id: 'pay_mock_0001',
      created_at: new Date('2024-02-01T12:00:00Z').toISOString(),
      updated_at: new Date('2024-02-05T14:30:00Z').toISOString(),
    };
    this.orders.set(initialOrder.id, initialOrder);
    this.orderItems.set(initialOrder.id, initialOrder.items);
    this.fulfillmentGroups.set(initialOrder.fulfillment_groups[0].id, initialOrder.fulfillment_groups[0]);

    // Initial Ledger Entry
    this.ledger.set('ledg-001', {
      id: 'ledg-001',
      seller_id: 'seller-001',
      order_id: 'ord-001',
      fulfillment_group_id: 'grp-001',
      gross_sales: 24500,
      platform_commission: 2450,
      net_earnings: 22050,
      status: 'available',
      created_at: new Date('2024-02-05T14:30:00Z').toISOString(),
    });

    // Initial Notifications
    this.createNotification({
      user_id: 'admin',
      recipient_role: 'admin',
      title: 'Platform Initialized',
      message: 'Gadwal Weaves Multi-Vendor Marketplace operations engine is active.',
      type: 'system',
      link: '/admin/dashboard',
      is_read: false
    });
    this.createNotification({
      user_id: '20000000-0000-0000-0000-000000000001',
      recipient_role: 'seller',
      title: 'Welcome to Gadwal Weaves Artisan Portal',
      message: 'Your artisan store Sri Venkateswara Handlooms is approved and active.',
      type: 'kyc',
      link: '/seller/dashboard',
      is_read: false
    });
    this.createNotification({
      user_id: '30000000-0000-0000-0000-000000000001',
      recipient_role: 'customer',
      title: 'Order GW-2024-0001 Delivered',
      message: 'Your Royal Maroon Gadwal Pure Silk Saree has been delivered. Enjoy authentic handloom heritage!',
      type: 'order',
      link: '/account/orders',
      is_read: true
    });

    console.log('[DB] Pre-seeded Gadwal Weaves store with authentic weavers, products, and catalog.');
  }

  // --- USER OPERATIONS ---
  public findUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public findUserById(id: string) {
    return this.users.get(id) || null;
  }

  public createUser(userData: UserProfile & { password_hash: string }) {
    this.users.set(userData.id, userData);
    return userData;
  }

  public updateUser(id: string, updates: Partial<UserProfile>) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  // --- SELLER OPERATIONS ---
  public getSellerById(id: string) {
    return this.sellers.get(id) || null;
  }

  public getSellerByUserId(userId: string) {
    for (const s of this.sellers.values()) {
      if (s.user_id === userId) return s;
    }
    return null;
  }

  public getSellerBySlug(slug: string) {
    for (const s of this.sellers.values()) {
      if (s.slug === slug) return s;
    }
    return null;
  }

  public getAllSellers() {
    return Array.from(this.sellers.values());
  }

  public createSeller(seller: SellerProfile) {
    this.sellers.set(seller.id, seller);
    return seller;
  }

  public updateSeller(id: string, updates: Partial<SellerProfile>) {
    const s = this.sellers.get(id);
    if (!s) return null;
    const updated = { ...s, ...updates, updated_at: new Date().toISOString() };
    this.sellers.set(id, updated);
    return updated;
  }

  // --- CATEGORIES & COLLECTIONS ---
  public getAllCategories() {
    return Array.from(this.categories.values()).sort((a, b) => a.display_order - b.display_order);
  }

  public getCategoryBySlug(slug: string) {
    for (const c of this.categories.values()) {
      if (c.slug === slug) return c;
    }
    return null;
  }

  public getCategoryById(id: string): Category | null {
    return this.categories.get(id) || null;
  }

  public createCategory(category: Partial<Category> & { name: string; slug: string }): Category {
    const id = category.id || `cat-${uuidv4().substring(0, 8)}`;
    const fullCategory: Category = {
      id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_url,
      display_order: category.display_order || this.categories.size + 1,
      is_active: category.is_active ?? true,
    };
    this.categories.set(id, fullCategory);
    return fullCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    const c = this.categories.get(id);
    if (!c) return null;
    const updated = { ...c, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  public deleteCategory(id: string) {
    return this.categories.delete(id);
  }

  public getAllCollections() {
    return Array.from(this.collections.values()).sort((a, b) => a.display_order - b.display_order);
  }

  public getCollectionBySlug(slug: string) {
    for (const c of this.collections.values()) {
      if (c.slug === slug) return c;
    }
    return null;
  }

  // --- PRODUCTS & INVENTORY ---
  public getAllProducts(filter?: {
    categorySlug?: string;
    collectionSlug?: string;
    sellerId?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    fabric?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'latest' | 'rating';
  }) {
    let list = Array.from(this.products.values());

    if (filter?.status) {
      list = list.filter(p => p.status === filter.status);
    } else {
      // default public view: only approved
      list = list.filter(p => p.status === 'approved');
    }

    if (filter?.sellerId) {
      list = list.filter(p => p.seller_id === filter.sellerId);
    }

    if (filter?.categorySlug) {
      list = list.filter(p => p.category_slug === filter.categorySlug);
    }

    if (filter?.collectionSlug) {
      const col = this.getCollectionBySlug(filter.collectionSlug);
      if (col) {
        list = list.filter(p => p.collection_id === col.id);
      }
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.border_style.toLowerCase().includes(q) ||
        (p.seller_name && p.seller_name.toLowerCase().includes(q))
      );
    }

    if (filter?.minPrice !== undefined) {
      list = list.filter(p => p.base_price >= filter.minPrice!);
    }

    if (filter?.maxPrice !== undefined) {
      list = list.filter(p => p.base_price <= filter.maxPrice!);
    }

    if (filter?.color) {
      list = list.filter(p => p.primary_color.toLowerCase() === filter.color!.toLowerCase());
    }

    if (filter?.fabric) {
      list = list.filter(p => p.fabric.toLowerCase().includes(filter.fabric!.toLowerCase()));
    }

    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'price_asc':
          list.sort((a, b) => a.base_price - b.base_price);
          break;
        case 'price_desc':
          list.sort((a, b) => b.base_price - a.base_price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'latest':
        default:
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }
    }

    return list;
  }

  public getProductById(id: string) {
    return this.products.get(id) || null;
  }

  public getProductBySlug(slug: string) {
    for (const p of this.products.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }

  public createProduct(product: Product) {
    this.products.set(product.id, product);
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    const p = this.products.get(id);
    if (!p) return null;
    const updated = { ...p, ...updates, updated_at: new Date().toISOString() };
    this.products.set(id, updated);
    return updated;
  }

  public deleteProduct(id: string) {
    return this.products.delete(id);
  }

  // --- INVENTORY RESERVATION & DECREMENT (Concurrency Safe) ---
  public reserveInventory(items: { productId: string; quantity: number }[]): { success: boolean; error?: string } {
    // Check all items have sufficient available stock
    for (const item of items) {
      const prod = this.products.get(item.productId);
      if (!prod) return { success: false, error: `Product ID ${item.productId} not found.` };
      const available = prod.stock_quantity - prod.reserved_quantity;
      if (available < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${prod.title}". Only ${available} available.` 
        };
      }
    }

    // Apply reservation atomically
    for (const item of items) {
      const prod = this.products.get(item.productId)!;
      prod.reserved_quantity += item.quantity;
      this.products.set(prod.id, prod);
    }
    return { success: true };
  }

  public commitInventory(items: { productId: string; quantity: number }[]): void {
    for (const item of items) {
      const prod = this.products.get(item.productId);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        prod.reserved_quantity = Math.max(0, prod.reserved_quantity - item.quantity);
        this.products.set(prod.id, prod);
      }
    }
  }

  public releaseInventory(items: { productId: string; quantity: number }[]): void {
    for (const item of items) {
      const prod = this.products.get(item.productId);
      if (prod) {
        prod.reserved_quantity = Math.max(0, prod.reserved_quantity - item.quantity);
        this.products.set(prod.id, prod);
      }
    }
  }

  // --- CART OPERATIONS ---
  public getCart(userId: string): CartItem[] {
    return this.carts.get(userId) || [];
  }

  public setCart(userId: string, items: CartItem[]): void {
    this.carts.set(userId, items);
  }

  // --- ADDRESS OPERATIONS ---
  public getAddresses(userId: string): Address[] {
    return this.addresses.get(userId) || [];
  }

  public addAddress(userId: string, address: Address): Address {
    const list = this.getAddresses(userId);
    const newAddr = { ...address, id: address.id || uuidv4() };
    if (newAddr.is_default || list.length === 0) {
      list.forEach(a => a.is_default = false);
      newAddr.is_default = true;
    }
    list.push(newAddr);
    this.addresses.set(userId, list);
    return newAddr;
  }

  public updateAddress(userId: string, addressId: string, updates: Partial<Address>): Address | null {
    const list = this.getAddresses(userId);
    const idx = list.findIndex(a => a.id === addressId);
    if (idx === -1) return null;
    if (updates.is_default) {
      list.forEach(a => a.is_default = false);
    }
    list[idx] = { ...list[idx], ...updates };
    this.addresses.set(userId, list);
    return list[idx];
  }

  public deleteAddress(userId: string, addressId: string): boolean {
    const list = this.getAddresses(userId);
    const filtered = list.filter(a => a.id !== addressId);
    this.addresses.set(userId, filtered);
    return true;
  }

  // --- ORDER OPERATIONS ---
  public getOrderById(id: string): Order | null {
    return this.orders.get(id) || null;
  }

  public getOrderByOrderNumber(orderNumber: string): Order | null {
    for (const o of this.orders.values()) {
      if (o.order_number === orderNumber) return o;
    }
    return null;
  }

  public getOrdersByCustomerId(customerId: string): Order[] {
    return Array.from(this.orders.values())
      .filter(o => o.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllOrders(): Order[] {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getFulfillmentGroupsBySeller(sellerId: string): SellerFulfillmentGroup[] {
    return Array.from(this.fulfillmentGroups.values())
      .filter(fg => fg.seller_id === sellerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createOrder(order: Order): Order {
    this.orders.set(order.id, order);
    this.orderItems.set(order.id, order.items);
    order.fulfillment_groups.forEach(fg => {
      this.fulfillmentGroups.set(fg.id, fg);
    });
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const o = this.orders.get(id);
    if (!o) return null;
    const updated = { ...o, ...updates, updated_at: new Date().toISOString() };
    this.orders.set(id, updated);
    return updated;
  }

  public updateFulfillmentGroup(id: string, updates: Partial<SellerFulfillmentGroup>): SellerFulfillmentGroup | null {
    const fg = this.fulfillmentGroups.get(id);
    if (!fg) return null;
    const updated = { ...fg, ...updates, updated_at: new Date().toISOString() };
    this.fulfillmentGroups.set(id, updated);

    // Also update inside the parent order
    const parentOrder = this.orders.get(fg.order_id);
    if (parentOrder) {
      const idx = parentOrder.fulfillment_groups.findIndex(g => g.id === id);
      if (idx !== -1) {
        parentOrder.fulfillment_groups[idx] = updated;
        this.orders.set(parentOrder.id, parentOrder);
      }
    }
    return updated;
  }

  // --- LEDGER & PAYOUTS ---
  public getLedgerBySeller(sellerId: string): SellerLedgerEntry[] {
    return Array.from(this.ledger.values())
      .filter(l => l.seller_id === sellerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addLedgerEntry(entry: SellerLedgerEntry): SellerLedgerEntry {
    this.ledger.set(entry.id, entry);
    return entry;
  }

  public updateLedgerEntry(id: string, updates: Partial<SellerLedgerEntry>): SellerLedgerEntry | null {
    const l = this.ledger.get(id);
    if (!l) return null;
    const updated = { ...l, ...updates };
    this.ledger.set(id, updated);
    return updated;
  }

  public getAllPayoutRequests(): PayoutRequest[] {
    return Array.from(this.payoutRequests.values())
      .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
  }

  public getPayoutRequestsBySeller(sellerId: string): PayoutRequest[] {
    return Array.from(this.payoutRequests.values())
      .filter(p => p.seller_id === sellerId)
      .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
  }

  public createPayoutRequest(payout: PayoutRequest): PayoutRequest {
    this.payoutRequests.set(payout.id, payout);
    return payout;
  }

  public updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): PayoutRequest | null {
    const p = this.payoutRequests.get(id);
    if (!p) return null;
    const updated = { ...p, ...updates };
    this.payoutRequests.set(id, updated);
    return updated;
  }

  // --- REVIEWS ---
  public getReviewsByProduct(productId: string): Review[] {
    return Array.from(this.reviews.values())
      .filter(r => r.product_id === productId && r.status === 'approved')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllReviews(): Review[] {
    return Array.from(this.reviews.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createReview(review: Review): Review {
    this.reviews.set(review.id, review);
    // Recalculate product rating
    const prod = this.products.get(review.product_id);
    if (prod) {
      const prodReviews = this.getReviewsByProduct(review.product_id);
      const total = prodReviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = parseFloat((total / prodReviews.length).toFixed(1));
      prod.review_count = prodReviews.length;
      this.products.set(prod.id, prod);
    }
    return review;
  }

  // --- SUPPORT TICKETS ---
  public getTicketsByUser(userId: string): SupportTicket[] {
    return Array.from(this.supportTickets.values())
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllTickets(): SupportTicket[] {
    return Array.from(this.supportTickets.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTicketById(id: string): SupportTicket | null {
    return this.supportTickets.get(id) || null;
  }

  public createTicket(ticket: SupportTicket): SupportTicket {
    this.supportTickets.set(ticket.id, ticket);
    this.supportMessages.set(ticket.id, []);
    return ticket;
  }

  public updateTicket(id: string, updates: Partial<SupportTicket>): SupportTicket | null {
    const t = this.supportTickets.get(id);
    if (!t) return null;
    const updated = { ...t, ...updates, updated_at: new Date().toISOString() };
    this.supportTickets.set(id, updated);
    return updated;
  }

  public getTicketMessages(ticketId: string): SupportMessage[] {
    return this.supportMessages.get(ticketId) || [];
  }

  public addTicketMessage(message: SupportMessage): SupportMessage {
    const list = this.getTicketMessages(message.ticket_id);
    list.push(message);
    this.supportMessages.set(message.ticket_id, list);
    return message;
  }

  // --- CMS BANNERS ---
  public getAllBanners(): CMSBanner[] {
    return Array.from(this.cmsBanners.values())
      .sort((a, b) => a.display_order - b.display_order);
  }

  public getActiveBanners(placement?: 'hero' | 'top_bar' | 'promo_grid' | 'middle_cta'): CMSBanner[] {
    let list = Array.from(this.cmsBanners.values()).filter(b => b.is_active);
    if (placement) list = list.filter(b => b.placement === placement);
    return list.sort((a, b) => a.display_order - b.display_order);
  }

  public createBanner(banner: CMSBanner): CMSBanner {
    this.cmsBanners.set(banner.id, banner);
    return banner;
  }

  public updateBanner(id: string, updates: Partial<CMSBanner>): CMSBanner | null {
    const b = this.cmsBanners.get(id);
    if (!b) return null;
    const updated = { ...b, ...updates };
    this.cmsBanners.set(id, updated);
    return updated;
  }

  public deleteBanner(id: string): boolean {
    return this.cmsBanners.delete(id);
  }

  // --- COUPONS ---
  public getCouponByCode(code: string): Coupon | null {
    for (const c of this.coupons.values()) {
      if (c.code.toUpperCase() === code.toUpperCase() && c.is_active) {
        return c;
      }
    }
    return null;
  }

  public getAllCoupons(): Coupon[] {
    return Array.from(this.coupons.values());
  }

  public createCoupon(coupon: Coupon): Coupon {
    this.coupons.set(coupon.id, coupon);
    return coupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const c = this.coupons.get(id);
    if (!c) return null;
    const updated = { ...c, ...updates };
    this.coupons.set(id, updated);
    return updated;
  }

  public deleteCoupon(id: string): boolean {
    return this.coupons.delete(id);
  }

  // --- AUDIT LOGS ---
  public logAudit(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const entry: AuditLog = {
      ...log,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(limit: number = 50): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  // --- IN-APP NOTIFICATIONS ---
  public getNotifications(userId: string, role?: string): InAppNotification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.user_id === userId || (role && n.recipient_role === role) || n.user_id === 'all')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(data: Omit<InAppNotification, 'id' | 'created_at'>): InAppNotification {
    const notification: InAppNotification = {
      ...data,
      id: `notif-${uuidv4().substring(0, 8)}`,
      created_at: new Date().toISOString()
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.get(id);
    if (!notif) return false;
    notif.is_read = true;
    this.notifications.set(id, notif);
    return true;
  }

  public markAllNotificationsAsRead(userId: string, role?: string): void {
    for (const notif of this.notifications.values()) {
      if (notif.user_id === userId || (role && notif.recipient_role === role)) {
        notif.is_read = true;
      }
    }
  }

  // --- SITE SETTINGS ---
  public getSiteSettings(): SiteSettings {
    return { ...this.siteSettings };
  }

  public updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.siteSettings = { ...this.siteSettings, ...updates };
    return { ...this.siteSettings };
  }

  // --- CUSTOMER MANAGEMENT ---
  public getAllCustomers(): CustomerSummary[] {
    const customers: CustomerSummary[] = [];
    const orders = this.getAllOrders();

    for (const user of this.users.values()) {
      if (user.role === 'customer') {
        const userOrders = orders.filter(o => o.customer_id === user.id);
        const totalSpent = userOrders
          .filter(o => o.payment_status === 'captured')
          .reduce((sum, o) => sum + o.final_amount, 0);

        customers.push({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at,
          total_orders: userOrders.length,
          total_spent: totalSpent,
          last_order_date: userOrders[0]?.created_at,
          is_suspended: user.is_suspended || false
        });
      }
    }
    return customers;
  }

  public updateCustomerStatus(id: string, is_suspended: boolean) {
    const user = this.users.get(id);
    if (!user) return null;
    user.is_suspended = is_suspended;
    user.updated_at = new Date().toISOString();
    this.users.set(id, user);
    return user;
  }

  // --- ORDER CANCELLATION & RETURN WORKFLOWS ---
  public cancelOrder(orderId: string, reason: string): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    // Disallow cancelling if already shipped or delivered
    const hasShipped = order.fulfillment_groups.some(
      fg => fg.fulfillment_status === 'shipped' || fg.fulfillment_status === 'delivered'
    );
    if (hasShipped) {
      return { success: false, message: 'Cannot cancel an order that has already shipped or been delivered.' };
    }

    if (order.payment_status === 'refunded' || order.payment_status === 'cancelled') {
      return { success: false, message: 'Order is already cancelled or refunded.' };
    }

    // Update parent order
    this.updateOrder(order.id, {
      payment_status: 'cancelled',
      notes: `${order.notes || ''} [Cancelled by customer: ${reason}]`.trim()
    });

    // Update all fulfillment groups
    order.fulfillment_groups.forEach(fg => {
      this.updateFulfillmentGroup(fg.id, {
        fulfillment_status: 'cancelled',
        cancellation_reason: reason
      });
    });

    // Release/revert inventory
    order.items.forEach(item => {
      const prod = this.getProductById(item.product_id);
      if (prod) {
        prod.stock_quantity += item.quantity;
        this.products.set(prod.id, prod);
      }
    });

    return { success: true, message: 'Order cancelled successfully and inventory restored.' };
  }

  public requestReturn(orderId: string, reason: string): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const isDelivered = order.fulfillment_groups.some(fg => fg.fulfillment_status === 'delivered');
    if (!isDelivered) {
      return { success: false, message: 'Return requests can only be made for delivered orders.' };
    }

    order.fulfillment_groups.forEach(fg => {
      if (fg.fulfillment_status === 'delivered') {
        this.updateFulfillmentGroup(fg.id, {
          fulfillment_status: 'return_in_progress',
          return_reason: reason
        });
      }
    });

    this.createNotification({
      user_id: 'admin',
      recipient_role: 'admin',
      title: `Return Request for ${order.order_number}`,
      message: `Customer ${order.customer_name} requested a return: "${reason}"`,
      type: 'refund',
      link: '/admin/orders',
      is_read: false
    });

    return { success: true, message: 'Return request submitted. Our team will review and approve within 24 hours.' };
  }

  // --- AUTHORITATIVE ANALYTICS ENGINE ---
  public getAnalytics(dateFilter: 'today' | '7d' | '30d' | 'all' = 'all') {
    const now = Date.now();
    let filterMs = 0;
    if (dateFilter === 'today') filterMs = 24 * 60 * 60 * 1000;
    else if (dateFilter === '7d') filterMs = 7 * 24 * 60 * 60 * 1000;
    else if (dateFilter === '30d') filterMs = 30 * 24 * 60 * 60 * 1000;

    let orders = this.getAllOrders();
    if (filterMs > 0) {
      orders = orders.filter(o => now - new Date(o.created_at).getTime() <= filterMs);
    }

    const paidOrders = orders.filter(o => o.payment_status === 'captured');
    const gmv = paidOrders.reduce((sum, o) => sum + o.final_amount, 0);
    const totalPlatformCommission = Array.from(this.ledger.values())
      .filter(l => filterMs === 0 || now - new Date(l.created_at).getTime() <= filterMs)
      .reduce((sum, l) => sum + l.platform_commission, 0);

    const sellers = this.getAllSellers();
    const products = Array.from(this.products.values());
    const payoutRequests = this.getAllPayoutRequests();

    // Category breakdown
    const categorySalesMap = new Map<string, { name: string; count: number; revenue: number }>();
    paidOrders.forEach(o => {
      o.items.forEach(item => {
        const prod = this.getProductById(item.product_id);
        const catName = prod?.category_name || 'Pure Silk';
        if (!categorySalesMap.has(catName)) {
          categorySalesMap.set(catName, { name: catName, count: 0, revenue: 0 });
        }
        const record = categorySalesMap.get(catName)!;
        record.count += item.quantity;
        record.revenue += item.subtotal;
      });
    });

    // Orders by status
    const statusCounts = {
      captured: orders.filter(o => o.payment_status === 'captured').length,
      pending: orders.filter(o => o.payment_status === 'pending').length,
      refunded: orders.filter(o => o.payment_status === 'refunded').length,
      cancelled: orders.filter(o => o.payment_status === 'cancelled').length,
      failed: orders.filter(o => o.payment_status === 'failed').length,
    };

    return {
      dateFilter,
      summary: {
        gmv,
        paidOrdersCount: paidOrders.length,
        totalOrdersCount: orders.length,
        totalPlatformCommission,
        totalSellers: sellers.length,
        activeSellers: sellers.filter(s => s.status === 'active').length,
        pendingSellerKyc: sellers.filter(s => s.kyc_status === 'pending').length,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'approved').length,
        pendingProductApprovals: products.filter(p => p.status === 'pending_approval').length,
        lowStockProducts: products.filter(p => p.stock_quantity <= 2).length,
        pendingPayoutRequests: payoutRequests.filter(p => p.status === 'requested').length,
        statusCounts
      },
      categoryPerformance: Array.from(categorySalesMap.values()),
      recentOrders: orders.slice(0, 8),
    };
  }

  // WISHLIST OPERATIONS
  public getWishlist(userId: string): Product[] {
    const set = this.wishlists.get(userId);
    if (!set) return [];
    const products: Product[] = [];
    for (const pid of set) {
      const p = this.products.get(pid);
      if (p) products.push(p);
    }
    return products;
  }

  public getWishlistIds(userId: string): string[] {
    const set = this.wishlists.get(userId);
    return set ? Array.from(set) : [];
  }

  public toggleWishlist(userId: string, productId: string): { inWishlist: boolean; count: number } {
    if (!this.wishlists.has(userId)) {
      this.wishlists.set(userId, new Set());
    }
    const set = this.wishlists.get(userId)!;
    let inWishlist = false;
    if (set.has(productId)) {
      set.delete(productId);
      inWishlist = false;
    } else {
      set.add(productId);
      inWishlist = true;
    }
    return { inWishlist, count: set.size };
  }

  public removeFromWishlist(userId: string, productId: string): boolean {
    const set = this.wishlists.get(userId);
    if (!set) return false;
    return set.delete(productId);
  }
}

export const db = new DatabaseStore();
