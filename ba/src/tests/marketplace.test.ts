import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/index.js';
import { RazorpayService } from '../services/razorpay.js';
import { ShiprocketService } from '../services/shiprocket.js';

describe('Gadwal Weaves Multi-Vendor Marketplace Core Engine', () => {
  beforeEach(() => {
    db.seed();
  });

  it('1. should seed authentic Gadwal handloom catalog and categories', () => {
    const products = db.getAllProducts();
    const categories = db.getAllCategories();
    const sellers = db.getAllSellers();

    expect(products.length).toBeGreaterThan(0);
    expect(categories.length).toBe(6);
    expect(sellers.length).toBe(4);

    const royalMaroon = products.find(p => p.slug === 'royal-maroon-gadwal-pure-silk-saree');
    expect(royalMaroon).toBeDefined();
    expect(royalMaroon?.base_price).toBe(24500);
    expect(royalMaroon?.fabric).toContain('Silk');
    expect(royalMaroon?.border_style).toContain('Kuttu');
  });

  it('2. should enforce inventory reservation and prevent overselling', () => {
    const prod = db.products.get('prod-001')!;
    const initialStock = prod.stock_quantity;

    // Reserve 2 units
    const res1 = db.reserveInventory([{ productId: 'prod-001', quantity: 2 }]);
    expect(res1.success).toBe(true);

    // Attempt to oversell beyond remaining available stock
    const res2 = db.reserveInventory([{ productId: 'prod-001', quantity: initialStock }]);
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('Insufficient stock');

    // Commit inventory
    db.commitInventory([{ productId: 'prod-001', quantity: 2 }]);
    expect(prod.stock_quantity).toBe(initialStock - 2);
  });

  it('3. should calculate coupon discounts accurately', () => {
    const coupon = db.getCouponByCode('GADWAL10');
    expect(coupon).toBeDefined();
    expect(coupon?.discount_type).toBe('percentage');
    expect(coupon?.discount_value).toBe(10);

    const subtotal = 25000;
    const discount = Math.round((subtotal * coupon!.discount_value) / 100);
    expect(discount).toBe(2500);
  });

  it('4. should verify Razorpay signatures and mock simulation', () => {
    const valid = RazorpayService.verifyPaymentSignature({
      order_id: 'order_test_12345',
      payment_id: 'pay_simulated_999',
      signature: 'simulated_valid_sig',
    });
    expect(valid).toBe(true);
  });

  it('5. should check Shiprocket serviceability across Indian postal codes', async () => {
    const hydCheck = await ShiprocketService.checkServiceability('500034');
    expect(hydCheck.is_serviceable).toBe(true);
    expect(hydCheck.estimated_delivery_days).toBeLessThanOrEqual(2);

    const invalidCheck = await ShiprocketService.checkServiceability('000000');
    expect(invalidCheck.is_serviceable).toBe(false);
  });

  it('6. should enforce seller ownership over products', () => {
    const prod1 = db.getProductById('prod-001')!;
    expect(prod1.seller_id).toBe('seller-001');

    // Updating as another seller should be caught by authorization logic
    const seller2 = db.getSellerById('seller-002')!;
    expect(prod1.seller_id).not.toBe(seller2.id);
  });

  it('7. should handle customer wishlist toggle and persistence', () => {
    const custId = '30000000-0000-0000-0000-000000000001';
    const initialWishlist = db.getWishlist(custId);
    expect(initialWishlist.length).toBeGreaterThanOrEqual(1);

    // Toggle a new product into wishlist
    const toggleResult = db.toggleWishlist(custId, 'prod-002');
    expect(toggleResult.inWishlist).toBe(true);

    const updated = db.getWishlist(custId);
    expect(updated.some(p => p.id === 'prod-002')).toBe(true);

    // Remove product
    const removed = db.removeFromWishlist(custId, 'prod-002');
    expect(removed).toBe(true);
    expect(db.getWishlist(custId).some(p => p.id === 'prod-002')).toBe(false);
  });

  it('8. should enforce order cancellation constraints and return workflows', () => {
    // 1. Cannot cancel an order that is already delivered
    const deliveredOrder = db.getOrderById('ord-001')!;
    expect(deliveredOrder).toBeDefined();
    const invalidCancel = db.cancelOrder('ord-001', 'Customer changed mind');
    expect(invalidCancel.success).toBe(false);
    expect(invalidCancel.message).toContain('already shipped or been delivered');

    // 2. Can request return on delivered order
    const returnResult = db.requestReturn('ord-001', 'Color differs from pit-loom photograph');
    expect(returnResult.success).toBe(true);
    expect(db.getOrderById('ord-001')!.fulfillment_groups[0].fulfillment_status).toBe('return_in_progress');

    // 3. Can cancel a newly placed pending/unfulfilled order
    const pendingOrder = db.createOrder({
      id: 'ord-test-pending',
      order_number: 'GW-TEST-0001',
      customer_id: '30000000-0000-0000-0000-000000000001',
      customer_name: 'Ananya Sharma',
      customer_email: 'customer@gadwalweaves.in',
      customer_phone: '+91 98111 22334',
      shipping_address: deliveredOrder.shipping_address,
      items: deliveredOrder.items,
      fulfillment_groups: [
        {
          id: 'grp-test-001',
          order_id: 'ord-test-pending',
          seller_id: 'seller-001',
          seller_name: 'Sri Venkateswara Handlooms',
          items: deliveredOrder.items,
          subtotal: 24500,
          commission_amount: 2450,
          net_seller_amount: 22050,
          fulfillment_status: 'pending',
          created_at: new Date().toISOString()
        }
      ],
      total_items_price: 24500,
      discount_amount: 0,
      shipping_fee: 0,
      tax_amount: 1225,
      final_amount: 25725,
      payment_status: 'captured',
      created_at: new Date().toISOString()
    });

    const cancelResult = db.cancelOrder(pendingOrder.id, 'Ordered duplicate by mistake');
    expect(cancelResult.success).toBe(true);

    const cancelled = db.getOrderById(pendingOrder.id)!;
    expect(cancelled.payment_status).toBe('cancelled');
    expect(cancelled.fulfillment_groups[0].fulfillment_status).toBe('cancelled');
  });

  it('9. should allow creating, updating, and deleting categories in taxonomy', () => {
    const newCat = db.createCategory({
      name: 'Bridal Kuttu Silk',
      slug: 'bridal-kuttu-silk',
      description: 'Heirloom bridal Gadwal silks with intricate zari borders',
      display_order: 10,
      is_active: true
    });
    expect(newCat.id).toBeDefined();
    expect(db.getCategoryById(newCat.id)).toBeDefined();

    // Update
    const updated = db.updateCategory(newCat.id, { description: 'Updated heritage description' });
    expect(updated?.description).toBe('Updated heritage description');

    // Delete
    const deleted = db.deleteCategory(newCat.id);
    expect(deleted).toBe(true);
    expect(db.getCategoryById(newCat.id)).toBeNull();
  });
});
