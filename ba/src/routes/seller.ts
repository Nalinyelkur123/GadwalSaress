import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { ShiprocketService } from '../services/shiprocket.js';
import { Product, PayoutRequest, SellerProfile } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Middleware: Verify user has seller role and extract their seller profile
function getSellerContext(req: AuthenticatedRequest, res: Response, next: () => void) {
  if (!req.user || req.user.role !== 'seller') {
    res.status(403).json({ error: 'Access restricted to registered sellers.' });
    return;
  }
  const seller = db.getSellerByUserId(req.user.id);
  if (!seller) {
    res.status(404).json({ error: 'No seller profile associated with this account.' });
    return;
  }
  (req as any).seller = seller;
  next();
}

// Middleware: Ensure seller is approved before allowing publishing or financial withdrawals
function requireApprovedSeller(req: AuthenticatedRequest, res: Response, next: () => void) {
  const seller = (req as any).seller as SellerProfile;
  if (seller.status === 'suspended') {
    res.status(403).json({ error: 'Your seller account has been suspended by marketplace operations.' });
    return;
  }
  if (seller.kyc_status !== 'approved') {
    res.status(403).json({ 
      error: `Your weaver application is currently ${seller.kyc_status}. Only approved artisans can perform this action.` 
    });
    return;
  }
  next();
}

// GET /api/seller/dashboard
router.get('/dashboard', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const fulfillmentGroups = db.getFulfillmentGroupsBySeller(seller.id);
    const products = db.getAllProducts({ sellerId: seller.id });
    const ledgerEntries = db.getLedgerBySeller(seller.id);

    const grossSales = ledgerEntries.reduce((sum, l) => sum + l.gross_sales, 0);
    const platformCommission = ledgerEntries.reduce((sum, l) => sum + l.platform_commission, 0);
    const netEarnings = ledgerEntries.reduce((sum, l) => sum + l.net_earnings, 0);
    const availablePayout = ledgerEntries
      .filter(l => l.status === 'available')
      .reduce((sum, l) => sum + l.net_earnings, 0);

    const pendingOrdersCount = fulfillmentGroups.filter(g => g.fulfillment_status === 'processing' || g.fulfillment_status === 'pending').length;
    const shippedOrdersCount = fulfillmentGroups.filter(g => g.fulfillment_status === 'shipped').length;
    const deliveredOrdersCount = fulfillmentGroups.filter(g => g.fulfillment_status === 'delivered').length;

    res.json({
      seller,
      metrics: {
        grossSales,
        platformCommission,
        netEarnings,
        availablePayout,
        pendingOrdersCount,
        shippedOrdersCount,
        deliveredOrdersCount,
        totalProducts: products.length,
        activeListings: products.filter(p => p.status === 'approved').length,
        lowStockCount: products.filter(p => p.stock_quantity <= 2).length,
      },
      recentOrders: fulfillmentGroups.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/seller/products
router.get('/products', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const products = db.getAllProducts({ sellerId: seller.id, status: '' });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/seller/products (Requires approved KYC!)
router.post('/products', authenticate, getSellerContext, requireApprovedSeller, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const {
      title,
      description,
      category_id,
      collection_id,
      base_price,
      original_price,
      sku,
      stock_quantity,
      fabric,
      zari_type,
      border_style,
      color,
      primary_color,
      care_instructions,
      images,
    } = req.body;

    if (!title || !base_price || !fabric || !color) {
      res.status(400).json({ error: 'Title, base price, fabric, and color are mandatory.' });
      return;
    }

    const category = db.getAllCategories().find(c => c.id === category_id);
    const prodSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProduct: Product = {
      id: `prod-${uuidv4().substring(0, 8)}`,
      seller_id: seller.id,
      seller_name: seller.business_name,
      seller_slug: seller.slug,
      title,
      slug: `${prodSlug}-${Math.floor(100 + Math.random() * 900)}`,
      description: description || 'Authentic handcrafted Gadwal saree.',
      category_id: category?.id || 'cat-001',
      category_name: category?.name || 'Pure Silk Sarees',
      category_slug: category?.slug || 'pure-silk-sarees',
      collection_id,
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
      primary_color: primary_color || color,
      weaving_technique: 'Traditional 3-shuttle interlocking pit loom',
      care_instructions: care_instructions || 'Dry clean only.',
      gi_certified: true,
      handloom_mark_certified: true,
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'],
      status: 'pending_approval',
      rating: 5.0,
      review_count: 0,
      is_featured: false,
      is_bestseller: false,
      is_new_arrival: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createProduct(newProduct);

    db.logAudit({
      actor_id: req.user!.id,
      actor_email: req.user!.email,
      actor_role: 'seller',
      action: 'SELLER_PRODUCT_CREATED',
      target_type: 'PRODUCT',
      target_id: newProduct.id,
      metadata: { title: newProduct.title, price: newProduct.base_price }
    });

    res.status(201).json({
      message: 'Product created and submitted for admin review.',
      product: newProduct,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/seller/products/:id
router.put('/products/:id', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const product = db.getProductById(req.params.id as string);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (product.seller_id !== seller.id) {
      res.status(403).json({ error: 'Access denied. You do not own this product.' });
      return;
    }

    const updated = db.updateProduct(product.id, req.body);
    res.json({ message: 'Product updated.', product: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/seller/products/:id
router.delete('/products/:id', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const product = db.getProductById(req.params.id as string);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (product.seller_id !== seller.id) {
      res.status(403).json({ error: 'Access denied. You do not own this product.' });
      return;
    }

    db.deleteProduct(product.id);
    res.json({ message: 'Product listing removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/seller/orders
router.get('/orders', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const groups = db.getFulfillmentGroupsBySeller(seller.id);
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/seller/orders/:id/pack-and-ship
router.post('/orders/:id/pack-and-ship', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const fg = db.fulfillmentGroups.get(req.params.id as string);
    if (!fg) {
      res.status(404).json({ error: 'Fulfillment order not found.' });
      return;
    }

    if (fg.seller_id !== seller.id) {
      res.status(403).json({ error: 'Access denied to this fulfillment group.' });
      return;
    }

    const { weight_kg = 0.95, length_cm = 30, breadth_cm = 25, height_cm = 5 } = req.body;

    const parentOrder = db.getOrderById(fg.order_id);
    const shipment = await ShiprocketService.createShipment({
      order_id: fg.order_id,
      sub_order_id: fg.id,
      pickup_pincode: seller.pickup_address.postal_code || '509125',
      delivery_pincode: parentOrder?.shipping_address.postal_code || '500034',
      customer_name: parentOrder?.customer_name || 'Customer',
      customer_phone: parentOrder?.customer_phone || '9999999999',
      weight_kg: parseFloat(weight_kg),
    });

    const updated = db.updateFulfillmentGroup(fg.id, {
      fulfillment_status: 'shipped',
      shipping_awb: shipment.awb_code,
      courier_name: shipment.courier_name,
      tracking_url: shipment.tracking_url,
      package_weight_kg: weight_kg,
      package_dimensions: { length_cm, breadth_cm, height_cm },
      shipped_at: new Date().toISOString(),
    });

    res.json({
      message: 'Shipment created and AWB generated with courier.',
      fulfillmentGroup: updated,
      shipment,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/seller/finance
router.get('/finance', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const ledger = db.getLedgerBySeller(seller.id);
    const payouts = db.getPayoutRequestsBySeller(seller.id);

    const grossSales = ledger.reduce((sum, l) => sum + l.gross_sales, 0);
    const totalCommission = ledger.reduce((sum, l) => sum + l.platform_commission, 0);
    const netEarnings = ledger.reduce((sum, l) => sum + l.net_earnings, 0);
    const availableBalance = ledger
      .filter(l => l.status === 'available')
      .reduce((sum, l) => sum + l.net_earnings, 0);
    const totalPaid = payouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      ledger,
      payouts,
      summary: {
        grossSales,
        totalCommission,
        netEarnings,
        availableBalance,
        totalPaid,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/seller/finance/request-payout (Requires approved KYC!)
router.post('/finance/request-payout', authenticate, getSellerContext, requireApprovedSeller, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const { amount } = req.body;
    const requestedAmount = parseFloat(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      res.status(400).json({ error: 'Valid payout amount is required.' });
      return;
    }

    const availableEntries = db.getLedgerBySeller(seller.id).filter(l => l.status === 'available');
    const availableTotal = availableEntries.reduce((sum, l) => sum + l.net_earnings, 0);

    if (requestedAmount > availableTotal) {
      res.status(400).json({ 
        error: `Requested amount ₹${requestedAmount.toLocaleString('en-IN')} exceeds available balance of ₹${availableTotal.toLocaleString('en-IN')}.` 
      });
      return;
    }

    const payout: PayoutRequest = {
      id: `po-${uuidv4().substring(0, 8)}`,
      seller_id: seller.id,
      seller_name: seller.business_name,
      amount: requestedAmount,
      bank_account_number: seller.bank_account_number || '912345678901',
      bank_ifsc: seller.bank_ifsc || 'SBIN0001234',
      bank_beneficiary: seller.bank_beneficiary || seller.business_name,
      status: 'requested',
      requested_at: new Date().toISOString(),
    };

    db.createPayoutRequest(payout);

    let remaining = requestedAmount;
    for (const entry of availableEntries) {
      if (remaining <= 0) break;
      db.updateLedgerEntry(entry.id, {
        status: 'requested',
        payout_request_id: payout.id,
      });
      remaining -= entry.net_earnings;
    }

    res.status(201).json({
      message: 'Payout request submitted for admin review.',
      payout,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/seller/profile
router.put('/profile', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const { business_name, description, story, location, experience_years, pickup_address, gstin, pan } = req.body;

    const updated = db.updateSeller(seller.id, {
      business_name: business_name || seller.business_name,
      description: description !== undefined ? description : seller.description,
      story: story !== undefined ? story : seller.story,
      location: location || seller.location,
      experience_years: experience_years ? parseInt(experience_years, 10) : seller.experience_years,
      pickup_address: pickup_address || seller.pickup_address,
      gstin: gstin || seller.gstin,
      pan: pan || seller.pan,
    });

    res.json({ message: 'Seller profile updated.', seller: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/seller/products/:id
router.delete('/products/:id', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const prod = db.getProductById(req.params.id as string);
    if (!prod) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    if (prod.seller_id !== seller.id) {
      res.status(403).json({ error: 'Access denied. You do not own this product.' });
      return;
    }
    db.updateProduct(prod.id, { status: 'archived' });
    res.json({ message: 'Product archived successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/seller/notifications
router.get('/notifications', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const seller = (req as any).seller as SellerProfile;
    const notifs = db.getNotifications(seller.user_id, 'seller');
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/seller/notifications/:id/read
router.put('/notifications/:id/read', authenticate, getSellerContext, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    db.markNotificationAsRead(req.params.id as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
