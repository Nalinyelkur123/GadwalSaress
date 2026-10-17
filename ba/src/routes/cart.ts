import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { optionalAuthenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { CartItem } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to get or create cart key (user ID or session header)
function getCartKey(req: AuthenticatedRequest): string {
  if (req.user?.id) return req.user.id;
  const guestSession = req.headers['x-guest-session-id'] as string;
  return guestSession || 'guest-default-session';
}

// GET /api/cart
router.get('/', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const key = getCartKey(req);
    const cart = db.getCart(key);

    // Refresh prices and stock availability against authoritative DB
    const refreshedCart: CartItem[] = [];
    for (const item of cart) {
      const prod = db.getProductById(item.product_id);
      if (prod && prod.status === 'approved' && prod.stock_quantity > 0) {
        const qty = Math.min(item.quantity, prod.stock_quantity);
        refreshedCart.push({
          ...item,
          product: prod,
          unit_price: prod.base_price,
          quantity: qty,
          subtotal: prod.base_price * qty,
        });
      }
    }
    db.setCart(key, refreshedCart);

    const subtotal = refreshedCart.reduce((sum, i) => sum + i.subtotal, 0);

    res.json({
      items: refreshedCart,
      itemCount: refreshedCart.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/add
router.post('/add', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ error: 'productId is required.' });
      return;
    }

    const product = db.getProductById(productId);
    if (!product || product.status !== 'approved') {
      res.status(404).json({ error: 'Product is unavailable.' });
      return;
    }

    const key = getCartKey(req);
    const cart = db.getCart(key);

    const existingIdx = cart.findIndex(i => i.product_id === productId);
    const requestedQty = parseInt(quantity, 10) || 1;

    if (existingIdx !== -1) {
      const newQty = cart[existingIdx].quantity + requestedQty;
      if (newQty > product.stock_quantity) {
        res.status(400).json({ 
          error: `Cannot add more. Only ${product.stock_quantity} available in stock.` 
        });
        return;
      }
      cart[existingIdx].quantity = newQty;
      cart[existingIdx].subtotal = newQty * product.base_price;
    } else {
      if (requestedQty > product.stock_quantity) {
        res.status(400).json({ 
          error: `Only ${product.stock_quantity} available in stock.` 
        });
        return;
      }
      cart.push({
        id: `cart-${uuidv4().substring(0, 8)}`,
        product_id: product.id,
        product,
        quantity: requestedQty,
        unit_price: product.base_price,
        subtotal: requestedQty * product.base_price,
      });
    }

    db.setCart(key, cart);
    const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);

    res.json({
      message: 'Added to cart successfully.',
      items: cart,
      itemCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/update
router.put('/update', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId, quantity } = req.body;
    const key = getCartKey(req);
    const cart = db.getCart(key);

    const item = cart.find(i => i.id === itemId);
    if (!item) {
      res.status(404).json({ error: 'Cart item not found.' });
      return;
    }

    const prod = db.getProductById(item.product_id);
    const newQty = parseInt(quantity, 10);

    if (newQty <= 0) {
      const updated = cart.filter(i => i.id !== itemId);
      db.setCart(key, updated);
      const subtotal = updated.reduce((sum, i) => sum + i.subtotal, 0);
      res.json({ items: updated, subtotal });
      return;
    }

    if (prod && newQty > prod.stock_quantity) {
      res.status(400).json({ error: `Cannot exceed available stock of ${prod.stock_quantity}.` });
      return;
    }

    item.quantity = newQty;
    item.subtotal = newQty * (prod?.base_price || item.unit_price);
    db.setCart(key, cart);

    const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
    res.json({ items: cart, subtotal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/remove/:id
router.delete('/remove/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const key = getCartKey(req);
    const cart = db.getCart(key);
    const updated = cart.filter(i => i.id !== req.params.id);
    db.setCart(key, updated);

    const subtotal = updated.reduce((sum, i) => sum + i.subtotal, 0);
    res.json({ message: 'Item removed.', items: updated, subtotal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/apply-coupon
router.post('/apply-coupon', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Coupon code is required.' });
      return;
    }

    const coupon = db.getCouponByCode(code);
    if (!coupon) {
      res.status(404).json({ error: 'Invalid or expired coupon code.' });
      return;
    }

    if (subtotal < coupon.min_order_value) {
      res.status(400).json({ 
        error: `Coupon "${coupon.code}" requires minimum order value of ₹${coupon.min_order_value.toLocaleString('en-IN')}.` 
      });
      return;
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      valid: true,
      coupon_code: coupon.code,
      discount_amount: discount,
      message: `Coupon "${coupon.code}" applied! You save ₹${discount.toLocaleString('en-IN')}.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
