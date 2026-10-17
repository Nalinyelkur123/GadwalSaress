import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { RazorpayService } from '../services/razorpay.js';
import { Order, OrderItem, SellerFulfillmentGroup, SellerLedgerEntry } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/checkout/summary
// Server-side authoritative price, discount, tax, and multi-seller grouping calculation
router.post('/summary', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items, couponCode, shippingAddress } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Checkout items cannot be empty.' });
      return;
    }

    let totalItemsPrice = 0;
    const verifiedItems: { product: any; quantity: number; subtotal: number }[] = [];
    const sellerGroupsMap = new Map<string, { seller: any; items: any[]; subtotal: number }>();

    for (const item of items) {
      const prod = db.getProductById(item.productId || item.product_id);
      if (!prod || prod.status !== 'approved') {
        res.status(400).json({ error: `Product "${prod?.title || item.productId}" is unavailable.` });
        return;
      }

      const available = prod.stock_quantity - prod.reserved_quantity;
      if (available < item.quantity) {
        res.status(400).json({ 
          error: `Insufficient stock for "${prod.title}". Only ${available} units available.` 
        });
        return;
      }

      const subtotal = prod.base_price * item.quantity;
      totalItemsPrice += subtotal;
      verifiedItems.push({ product: prod, quantity: item.quantity, subtotal });

      // Group by seller
      const seller = db.getSellerById(prod.seller_id);
      if (!sellerGroupsMap.has(prod.seller_id)) {
        sellerGroupsMap.set(prod.seller_id, {
          seller: seller || { id: prod.seller_id, business_name: 'Gadwal Artisan' },
          items: [],
          subtotal: 0
        });
      }
      const group = sellerGroupsMap.get(prod.seller_id)!;
      group.items.push({
        product: prod,
        quantity: item.quantity,
        subtotal
      });
      group.subtotal += subtotal;
    }

    // Coupon discount calculation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && totalItemsPrice >= coupon.min_order_value) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = Math.round((totalItemsPrice * coupon.discount_value) / 100);
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          }
        } else {
          discountAmount = coupon.discount_value;
        }
      }
    }

    const discountedTotal = Math.max(0, totalItemsPrice - discountAmount);
    const taxAmount = Math.round(discountedTotal * 0.05); // 5% GST for Handloom Sarees
    const shippingFee = 0; // Free pan-India insured shipping for Gadwal Handlooms
    const finalAmount = discountedTotal + taxAmount + shippingFee;

    res.json({
      totalItemsPrice,
      discountAmount,
      couponCode: discountAmount > 0 ? couponCode : null,
      taxAmount,
      shippingFee,
      finalAmount,
      sellerGroups: Array.from(sellerGroupsMap.entries()).map(([sellerId, g]) => ({
        sellerId,
        sellerName: g.seller.business_name,
        itemsCount: g.items.length,
        subtotal: g.subtotal
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/checkout/create-order
// Creates order in pending status, reserves inventory, and generates Razorpay order
router.post('/create-order', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const { items, shippingAddress, couponCode, notes } = req.body;
    if (!items || !items.length || !shippingAddress) {
      res.status(400).json({ error: 'Items and shipping address are required.' });
      return;
    }

    // 1. Reserve Inventory Atomically
    const reservationItems = items.map((i: any) => ({
      productId: i.productId || i.product_id,
      quantity: i.quantity,
    }));
    const reservation = db.reserveInventory(reservationItems);
    if (!reservation.success) {
      res.status(400).json({ error: reservation.error });
      return;
    }

    // 2. Authoritative Price & Grouping Calculation
    let totalItemsPrice = 0;
    const orderItems: OrderItem[] = [];
    const sellerMap = new Map<string, { seller: any; items: OrderItem[]; subtotal: number }>();
    const orderId = `ord-${uuidv4().substring(0, 8)}`;

    for (const item of items) {
      const prod = db.getProductById(item.productId || item.product_id)!;
      const subtotal = prod.base_price * item.quantity;
      totalItemsPrice += subtotal;

      const orderItem: OrderItem = {
        id: `item-${uuidv4().substring(0, 8)}`,
        order_id: orderId,
        seller_id: prod.seller_id,
        product_id: prod.id,
        product_title: prod.title,
        product_image: prod.images[0] || '',
        sku: prod.sku,
        fabric: prod.fabric,
        unit_price: prod.base_price,
        quantity: item.quantity,
        subtotal
      };
      orderItems.push(orderItem);

      if (!sellerMap.has(prod.seller_id)) {
        const seller = db.getSellerById(prod.seller_id);
        sellerMap.set(prod.seller_id, {
          seller: seller || { id: prod.seller_id, business_name: 'Gadwal Artisan', commission_rate: 10.0 },
          items: [],
          subtotal: 0
        });
      }
      const sGroup = sellerMap.get(prod.seller_id)!;
      sGroup.items.push(orderItem);
      sGroup.subtotal += subtotal;
    }

    // 3. Discount & Tax
    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && totalItemsPrice >= coupon.min_order_value) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = Math.round((totalItemsPrice * coupon.discount_value) / 100);
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          }
        } else {
          discountAmount = coupon.discount_value;
        }
      }
    }
    const discountedTotal = Math.max(0, totalItemsPrice - discountAmount);
    const taxAmount = Math.round(discountedTotal * 0.05);
    const finalAmount = discountedTotal + taxAmount;

    // 4. Fulfillment Groups
    const fulfillmentGroups: SellerFulfillmentGroup[] = [];
    for (const [sellerId, grp] of sellerMap.entries()) {
      const commissionRate = grp.seller.commission_rate || 10.0;
      const commissionAmount = Math.round((grp.subtotal * commissionRate) / 100);
      const netSellerAmount = grp.subtotal - commissionAmount;

      fulfillmentGroups.push({
        id: `fg-${uuidv4().substring(0, 8)}`,
        order_id: orderId,
        seller_id: sellerId,
        seller_name: grp.seller.business_name,
        items: grp.items,
        subtotal: grp.subtotal,
        commission_amount: commissionAmount,
        net_seller_amount: netSellerAmount,
        fulfillment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 5. Generate Order Number
    const orderNumber = `GW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Create Razorpay Order
    const rzpOrder = await RazorpayService.createOrder({
      amount: finalAmount,
      receipt: orderNumber,
      notes: { order_id: orderId, customer_id: req.user.id }
    });

    // 7. Store Order in DB
    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: req.user.id,
      customer_name: req.user.full_name,
      customer_email: req.user.email,
      customer_phone: shippingAddress.phone,
      shipping_address: shippingAddress,
      items: orderItems,
      fulfillment_groups: fulfillmentGroups,
      total_items_price: totalItemsPrice,
      discount_amount: discountAmount,
      coupon_code: discountAmount > 0 ? couponCode : undefined,
      shipping_fee: 0,
      tax_amount: taxAmount,
      final_amount: finalAmount,
      payment_status: 'pending',
      razorpay_order_id: rzpOrder.id,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.createOrder(order);

    res.status(201).json({
      orderId: order.id,
      orderNumber: order.order_number,
      finalAmount: order.final_amount,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId: RazorpayService.getKeyId(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/checkout/verify-payment
// Idempotently verifies Razorpay signature, commits inventory, creates ledger entries
router.post('/verify-payment', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: 'Payment verification parameters missing.' });
      return;
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    // Idempotency: If already captured, return success immediately
    if (order.payment_status === 'captured') {
      res.json({
        verified: true,
        message: 'Order already confirmed and paid.',
        orderNumber: order.order_number,
      });
      return;
    }

    const isValid = RazorpayService.verifyPaymentSignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      // Release reserved inventory on failure
      const itemsToRelease = order.items.map(i => ({ productId: i.product_id, quantity: i.quantity }));
      db.releaseInventory(itemsToRelease);
      db.updateOrder(order.id, { payment_status: 'failed' });

      res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
      return;
    }

    // 1. Commit reserved inventory permanently
    const itemsToCommit = order.items.map(i => ({ productId: i.product_id, quantity: i.quantity }));
    db.commitInventory(itemsToCommit);

    // 2. Update Order status
    db.updateOrder(order.id, {
      payment_status: 'captured',
      razorpay_payment_id,
    });

    // 3. Update Fulfillment Groups to processing and create ledger entries
    for (const fg of order.fulfillment_groups) {
      db.updateFulfillmentGroup(fg.id, {
        fulfillment_status: 'processing'
      });

      const ledgerEntry: SellerLedgerEntry = {
        id: `ledg-${uuidv4().substring(0, 8)}`,
        seller_id: fg.seller_id,
        order_id: order.id,
        fulfillment_group_id: fg.id,
        gross_sales: fg.subtotal,
        platform_commission: fg.commission_amount,
        net_earnings: fg.net_seller_amount,
        status: 'pending_eligibility',
        created_at: new Date().toISOString()
      };
      db.addLedgerEntry(ledgerEntry);
    }

    // 4. Clear Customer's Cart
    if (req.user) {
      db.setCart(req.user.id, []);
    }

    // 5. Audit Log
    db.logAudit({
      actor_id: req.user?.id || 'customer',
      actor_email: req.user?.email || order.customer_email,
      actor_role: 'customer',
      action: 'PAYMENT_VERIFIED',
      target_type: 'ORDER',
      target_id: order.id,
      metadata: {
        orderNumber: order.order_number,
        amount: order.final_amount,
        razorpay_payment_id
      }
    });

    res.json({
      verified: true,
      message: 'Payment verified and order confirmed successfully!',
      orderNumber: order.order_number,
      orderId: order.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
