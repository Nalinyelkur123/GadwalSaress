import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { RazorpayService } from '../services/razorpay.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes in /api/admin require the 'admin' role!
router.use(authenticate);
router.use(requireRole(['admin']));

// GET /api/admin/dashboard
// Authoritative marketplace analytics derived from actual DB records
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = db.getAllOrders();
    const sellers = db.getAllSellers();
    const products = db.getAllProducts({ status: '' }); // get all
    const payoutRequests = db.getAllPayoutRequests();

    const paidOrders = orders.filter(o => o.payment_status === 'captured');
    const gmv = paidOrders.reduce((sum, o) => sum + o.final_amount, 0);
    const totalPlatformCommission = Array.from(db.ledger.values()).reduce((sum, l) => sum + l.platform_commission, 0);

    const pendingSellerKyc = sellers.filter(s => s.kyc_status === 'pending').length;
    const pendingProductApprovals = products.filter(p => p.status === 'pending_approval').length;
    const pendingPayoutRequests = payoutRequests.filter(p => p.status === 'requested').length;
    const pendingShipments = Array.from(db.fulfillmentGroups.values()).filter(g => g.fulfillment_status === 'processing').length;

    res.json({
      metrics: {
        gmv,
        paidOrdersCount: paidOrders.length,
        totalOrdersCount: orders.length,
        totalPlatformCommission,
        totalSellers: sellers.length,
        approvedSellers: sellers.filter(s => s.status === 'active' && s.is_verified).length,
        pendingSellerKyc,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'approved').length,
        pendingProductApprovals,
        pendingPayoutRequests,
        pendingShipments,
      },
      recentOrders: orders.slice(0, 6),
      recentAuditLogs: db.getAuditLogs(10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/sellers
router.get('/sellers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sellers = db.getAllSellers();
    res.json(sellers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/sellers/:id/kyc
// Approve / reject seller KYC & set commission rate
router.put('/sellers/:id/kyc', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { kyc_status, commission_rate, status, is_verified } = req.body;
    const seller = db.getSellerById(req.params.id);
    if (!seller) {
      res.status(404).json({ error: 'Seller not found.' });
      return;
    }

    const updated = db.updateSeller(seller.id, {
      kyc_status: kyc_status || seller.kyc_status,
      commission_rate: commission_rate !== undefined ? parseFloat(commission_rate) : seller.commission_rate,
      status: status || seller.status,
      is_verified: is_verified !== undefined ? is_verified : (kyc_status === 'approved'),
    });

    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_SELLER_KYC_UPDATED',
      target_type: 'SELLER',
      target_id: seller.id,
      metadata: { kyc_status, commission_rate, status }
    });

    res.json({ message: 'Seller KYC status updated.', seller: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/products
router.get('/products', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const products = Array.from(db.products.values());
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/products/:id/moderation
// Moderate product (approve / reject with feedback reason)
router.put('/products/:id/moderation', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, admin_rejection_reason, is_featured, is_bestseller } = req.body;
    const product = db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const updated = db.updateProduct(product.id, {
      status: status || product.status,
      admin_rejection_reason: admin_rejection_reason || undefined,
      is_featured: is_featured !== undefined ? is_featured : product.is_featured,
      is_bestseller: is_bestseller !== undefined ? is_bestseller : product.is_bestseller,
    });

    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_PRODUCT_MODERATED',
      target_type: 'PRODUCT',
      target_id: product.id,
      metadata: { status, admin_rejection_reason }
    });

    res.json({ message: 'Product moderation updated.', product: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = db.getAllOrders();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/orders/:id/refund
// Controlled refund workflow integrating Razorpay refund and inventory rollback
router.post('/orders/:id/refund', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.payment_status === 'refunded') {
      res.status(400).json({ error: 'Order is already marked as refunded.' });
      return;
    }

    const { amount, reason = 'Customer requested refund' } = req.body;
    const refundAmount = amount ? parseFloat(amount) : order.final_amount;

    // Process provider refund via Razorpay
    let rzpRefund = null;
    if (order.razorpay_payment_id) {
      rzpRefund = await RazorpayService.refundPayment(order.razorpay_payment_id, refundAmount);
    }

    db.updateOrder(order.id, {
      payment_status: 'refunded',
      notes: `${order.notes || ''} [Refunded ₹${refundAmount}: ${reason}]`.trim(),
    });

    // Update fulfillment groups to cancelled
    order.fulfillment_groups.forEach(fg => {
      db.updateFulfillmentGroup(fg.id, { fulfillment_status: 'cancelled' });
    });

    // Revert inventory
    const itemsToRevert = order.items.map(i => ({ productId: i.product_id, quantity: i.quantity }));
    for (const item of itemsToRevert) {
      const prod = db.getProductById(item.productId);
      if (prod) {
        prod.stock_quantity += item.quantity;
        db.products.set(prod.id, prod);
      }
    }

    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_ORDER_REFUNDED',
      target_type: 'ORDER',
      target_id: order.id,
      metadata: { refundAmount, reason, rzpRefund }
    });

    res.json({
      message: `Successfully processed refund of ₹${refundAmount.toLocaleString('en-IN')}.`,
      refund: rzpRefund,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/orders/:id/status
// Transition order payment or fulfillment status with strict validation & audit trail
router.put('/orders/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const { payment_status, fulfillment_status, notes } = req.body;

    const updates: Partial<typeof order> = {};
    if (payment_status) {
      const validPayments = ['pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'];
      if (!validPayments.includes(payment_status)) {
        res.status(400).json({ error: `Invalid payment status. Must be one of: ${validPayments.join(', ')}` });
        return;
      }
      updates.payment_status = payment_status;
    }

    if (notes) {
      updates.notes = `${order.notes || ''} [${notes}]`.trim();
    }

    const updatedOrder = db.updateOrder(order.id, updates);

    if (fulfillment_status) {
      const validFulfillment = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'return_requested'];
      if (!validFulfillment.includes(fulfillment_status)) {
        res.status(400).json({ error: `Invalid fulfillment status. Must be one of: ${validFulfillment.join(', ')}` });
        return;
      }
      order.fulfillment_groups.forEach(fg => {
        db.updateFulfillmentGroup(fg.id, { fulfillment_status: fulfillment_status as any });
      });
    }

    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_ORDER_STATUS_UPDATED',
      target_type: 'ORDER',
      target_id: order.id,
      metadata: { payment_status, fulfillment_status, notes }
    });

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/finance/payouts
router.get('/finance/payouts', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payouts = db.getAllPayoutRequests();
    res.json(payouts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/finance/payouts/:id/status
// Approve / Mark Paid / Reject seller payout request
router.put('/finance/payouts/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, transaction_ref, admin_notes } = req.body;
    const payout = db.payoutRequests.get(req.params.id);
    if (!payout) {
      res.status(404).json({ error: 'Payout request not found.' });
      return;
    }

    const updated = db.updatePayoutRequest(payout.id, {
      status,
      transaction_ref: transaction_ref || payout.transaction_ref,
      admin_notes: admin_notes || payout.admin_notes,
      processed_at: status === 'paid' ? new Date().toISOString() : undefined,
    });

    // If paid, update ledger entries to 'paid'
    if (status === 'paid') {
      const sellerLedger = db.getLedgerBySeller(payout.seller_id);
      sellerLedger
        .filter(l => l.payout_request_id === payout.id)
        .forEach(l => {
          db.updateLedgerEntry(l.id, {
            status: 'paid',
            settlement_date: new Date().toISOString()
          });
        });
    } else if (status === 'rejected') {
      // Return ledger entries back to available
      const sellerLedger = db.getLedgerBySeller(payout.seller_id);
      sellerLedger
        .filter(l => l.payout_request_id === payout.id)
        .forEach(l => {
          db.updateLedgerEntry(l.id, {
            status: 'available',
            payout_request_id: undefined
          });
        });
    }

    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_PAYOUT_STATUS_CHANGED',
      target_type: 'PAYOUT_REQUEST',
      target_id: payout.id,
      metadata: { status, transaction_ref }
    });

    res.json({ message: 'Payout status updated.', payout: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CMS & PROMOTIONS MANAGEMENT ---
// GET /api/admin/cms/banners
router.get('/cms/banners', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json(db.getAllBanners());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/cms/banners
router.post('/cms/banners', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { placement, title, subtitle, cta_text, cta_link, image_url, display_order, is_active } = req.body;
    const banner = db.createBanner({
      id: `ban-${uuidv4().substring(0, 8)}`,
      placement,
      title,
      subtitle,
      cta_text,
      cta_link,
      image_url,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date().toISOString(),
    });
    res.status(201).json(banner);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/cms/coupons
router.get('/cms/coupons', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json(db.getAllCoupons());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/cms/coupons
router.post('/cms/coupons', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, description, discount_type, discount_value, min_order_value, max_discount_amount, valid_until } = req.body;
    const coupon = db.createCoupon({
      id: `coup-${uuidv4().substring(0, 8)}`,
      code: code.toUpperCase().trim(),
      description,
      discount_type,
      discount_value: parseFloat(discount_value),
      min_order_value: min_order_value ? parseFloat(min_order_value) : 0,
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : undefined,
      valid_from: new Date().toISOString(),
      valid_until: valid_until || new Date('2028-12-31').toISOString(),
      used_count: 0,
      is_active: true,
    });
    res.status(201).json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/cms/banners/:id
router.put('/cms/banners/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updated = db.updateBanner(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Banner not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/cms/banners/:id
router.delete('/cms/banners/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ok = db.deleteBanner(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/cms/coupons/:id
router.put('/cms/coupons/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updated = db.updateCoupon(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/cms/coupons/:id
router.delete('/cms/coupons/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ok = db.deleteCoupon(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = db.getAuditLogs(100);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const range = (req.query.range as any) || 'all';
    const analytics = db.getAnalytics(range);
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORY & COLLECTION CRUD ---
// GET /api/admin/categories
router.get('/categories', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json(db.getAllCategories());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/categories
router.post('/categories', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image_url, display_order, is_active } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = db.createCategory({
      id: `cat-${uuidv4().substring(0, 8)}`,
      name,
      slug: categorySlug,
      description,
      image_url,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true,
    });
    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_CATEGORY_CREATED',
      target_type: 'CATEGORY',
      target_id: newCat.id,
      metadata: { name: newCat.name }
    });
    res.status(201).json(newCat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if products exist in category
    const productsInCat = db.getAllProducts({ categorySlug: '' }).filter(p => p.category_id === req.params.id);
    if (productsInCat.length > 0) {
      res.status(400).json({ 
        error: `Cannot delete category. It currently contains ${productsInCat.length} product(s). Please reassign them first or deactivate the category.` 
      });
      return;
    }
    db.deleteCategory(req.params.id);
    res.json({ message: 'Category removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN DIRECT PRODUCT MANAGEMENT ---
// POST /api/admin/products
router.post('/products', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      seller_id,
      title,
      description,
      category_id,
      base_price,
      original_price,
      sku,
      stock_quantity,
      fabric,
      zari_type,
      border_style,
      color,
      care_instructions,
      images,
      is_featured,
      is_bestseller,
      status = 'approved'
    } = req.body;

    if (!title || !base_price || !fabric || !color) {
      res.status(400).json({ error: 'Title, price, fabric, and color are mandatory.' });
      return;
    }

    const seller = db.getSellerById(seller_id) || db.getAllSellers()[0];
    const category = db.getAllCategories().find(c => c.id === category_id);
    const prodSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProd = db.createProduct({
      id: `prod-${uuidv4().substring(0, 8)}`,
      seller_id: seller?.id || 'seller-001',
      seller_name: seller?.business_name || 'Sri Venkateswara Handlooms',
      seller_slug: seller?.slug || 'sri-venkateswara-handlooms',
      title,
      slug: `${prodSlug}-${Math.floor(100 + Math.random() * 900)}`,
      description: description || 'Master weaver authentic pit-loom Gadwal saree.',
      category_id: category?.id || 'cat-001',
      category_name: category?.name || 'Pure Silk Sarees',
      category_slug: category?.slug || 'pure-silk-sarees',
      base_price: parseFloat(base_price),
      original_price: original_price ? parseFloat(original_price) : parseFloat(base_price),
      discount_percent: original_price ? Math.round(((original_price - base_price) / original_price) * 100) : 0,
      sku: sku || `GW-${Math.floor(1000 + Math.random() * 9000)}`,
      stock_quantity: parseInt(stock_quantity, 10) || 1,
      reserved_quantity: 0,
      fabric,
      zari_type: zari_type || 'Tested Zari',
      border_style: border_style || 'Kuttu Border',
      saree_length_meters: 6.30,
      blouse_included: true,
      color,
      primary_color: color,
      weaving_technique: 'Traditional 3-shuttle interlocking pit loom',
      care_instructions: care_instructions || 'Dry clean only.',
      gi_certified: true,
      handloom_mark_certified: true,
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'],
      status: status,
      rating: 5.0,
      review_count: 0,
      is_featured: !!is_featured,
      is_bestseller: !!is_bestseller,
      is_new_arrival: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_PRODUCT_CREATED',
      target_type: 'PRODUCT',
      target_id: newProd.id,
      metadata: { title: newProd.title }
    });

    res.status(201).json({ message: 'Product created successfully by Admin.', product: newProd });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const prod = db.getProductById(req.params.id);
    if (!prod) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    db.updateProduct(prod.id, { status: 'archived' });
    res.json({ message: 'Product archived successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMER MANAGEMENT ---
// GET /api/admin/customers
router.get('/customers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customers = db.getAllCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/customers/:id/status
router.put('/customers/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { is_suspended } = req.body;
    const updated = db.updateCustomerStatus(req.params.id, !!is_suspended);
    if (!updated) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }
    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_CUSTOMER_STATUS_CHANGED',
      target_type: 'USER',
      target_id: req.params.id,
      metadata: { is_suspended }
    });
    res.json({ message: 'Customer account status updated.', customer: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SHIPMENTS MANAGEMENT ---
// GET /api/admin/shipments
router.get('/shipments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groups = Array.from(db.fulfillmentGroups.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SITE SETTINGS ---
// GET /api/admin/settings
router.get('/settings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json(db.getSiteSettings());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updated = db.updateSiteSettings(req.body);
    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'admin',
      action: 'ADMIN_SETTINGS_UPDATED',
      target_type: 'SETTINGS',
      target_id: 'settings-001',
      metadata: req.body
    });
    res.json({ message: 'Marketplace settings updated successfully.', settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
// GET /api/admin/notifications
router.get('/notifications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const notifs = db.getNotifications('admin', 'admin');
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/notifications/:id/read
router.put('/notifications/:id/read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    db.markNotificationAsRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
