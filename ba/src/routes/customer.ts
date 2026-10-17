import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/customer/orders
router.get('/orders', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const orders = db.getOrdersByCustomerId(req.user.id);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/orders/:id
// Strict customer ownership check! Customer cannot access another customer's order.
router.get('/orders/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const order = db.getOrderById(req.params.id as string);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    // Ownership authorization
    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. You cannot view this order.' });
      return;
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/addresses
router.get('/addresses', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const addresses = db.getAddresses(req.user.id);
    res.json(addresses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer/addresses
router.post('/addresses', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { full_name, phone, street_address, apartment, city, state, postal_code, country = 'India', is_default } = req.body;
    if (!full_name || !phone || !street_address || !city || !state || !postal_code) {
      res.status(400).json({ error: 'All primary address fields are required.' });
      return;
    }

    const addr = db.addAddress(req.user.id, {
      full_name,
      phone,
      street_address,
      apartment,
      city,
      state,
      postal_code,
      country,
      is_default,
    });

    res.status(201).json(addr);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customer/addresses/:id
router.delete('/addresses/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    db.deleteAddress(req.user.id, req.params.id as string);
    res.json({ message: 'Address removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/tickets
router.get('/tickets', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const tickets = db.getTicketsByUser(req.user.id);
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer/tickets
router.post('/tickets', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { subject, category, message, order_id, priority = 'medium' } = req.body;
    if (!subject || !category || !message) {
      res.status(400).json({ error: 'Subject, category, and message are required.' });
      return;
    }

    const ticketNumber = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const ticket = db.createTicket({
      id: `ticket-${uuidv4().substring(0, 8)}`,
      ticket_number: ticketNumber,
      user_id: req.user.id,
      user_name: req.user.full_name,
      user_email: req.user.email,
      user_role: req.user.role,
      order_id,
      subject,
      category,
      priority,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    db.addTicketMessage({
      id: `msg-${uuidv4().substring(0, 8)}`,
      ticket_id: ticket.id,
      sender_id: req.user.id,
      sender_name: req.user.full_name,
      sender_role: req.user.role,
      message,
      created_at: new Date().toISOString(),
    });

    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer/orders/:id/cancel
router.post('/orders/:id/cancel', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const order = db.getOrderById(req.params.id as string);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const { reason = 'Customer requested cancellation' } = req.body;
    const result = db.cancelOrder(order.id, reason);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    // Notify Admin and Seller
    db.createNotification({
      user_id: 'admin',
      recipient_role: 'admin',
      title: `Order ${order.order_number} Cancelled`,
      message: `Customer ${order.customer_name} cancelled order: "${reason}"`,
      type: 'order',
      link: '/admin/orders',
      is_read: false
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer/orders/:id/return
router.post('/orders/:id/return', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const order = db.getOrderById(req.params.id as string);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      res.status(400).json({ error: 'Please provide a clear reason for the return request (minimum 5 characters).' });
      return;
    }

    const result = db.requestReturn(order.id, reason);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customer/profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { full_name, phone, avatar_url } = req.body;
    const updated = db.updateUser(req.user.id, {
      full_name: full_name?.trim() || req.user.full_name,
      phone: phone?.trim(),
      avatar_url: avatar_url?.trim(),
    });
    if (!updated) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    const { password_hash: _, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/notifications
router.get('/notifications', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const notifs = db.getNotifications(req.user.id, 'customer');
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customer/notifications/:id/read
router.put('/notifications/:id/read', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    db.markNotificationAsRead(req.params.id as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/wishlist
router.get('/wishlist', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const products = db.getWishlist(req.user.id);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/wishlist/ids
router.get('/wishlist/ids', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const ids = db.getWishlistIds(req.user.id);
    res.json(ids);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer/wishlist/toggle
router.post('/wishlist/toggle', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ error: 'productId is required.' });
      return;
    }
    const result = db.toggleWishlist(req.user.id, productId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customer/wishlist/:productId
router.delete('/wishlist/:productId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const removed = db.removeFromWishlist(req.user.id, req.params.productId as string);
    res.json({ success: removed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
