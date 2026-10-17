import { Router, Request, Response } from 'express';
import { ShiprocketService } from '../services/shiprocket.js';
import { db } from '../db/index.js';

const router = Router();

// GET /api/shipping/check-pincode?pincode=500034
router.get('/check-pincode', async (req: Request, res: Response): Promise<void> => {
  try {
    const pincode = req.query.pincode as string;
    if (!pincode || pincode.length !== 6) {
      res.status(400).json({ error: 'Please enter a valid 6-digit Indian postal code.' });
      return;
    }

    const check = await ShiprocketService.checkServiceability(pincode);
    res.json(check);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shipping/track/:awb
router.get('/track/:awb', async (req: Request, res: Response): Promise<void> => {
  try {
    const awb = req.params.awb;
    // Find fulfillment group matching this AWB
    let matchedGroup = null;
    for (const g of db.fulfillmentGroups.values()) {
      if (g.shipping_awb === awb) {
        matchedGroup = g;
        break;
      }
    }

    res.json({
      awb,
      courier: matchedGroup?.courier_name || 'BlueDart Express',
      status: matchedGroup?.fulfillment_status || 'in_transit',
      events: [
        { status: 'Order Placed & Confirmed', location: 'Gadwal Weaves Platform', timestamp: matchedGroup?.created_at || new Date().toISOString() },
        { status: 'Handloom Packed & Handed to Courier', location: 'Gadwal Handloom Center, Telangana', timestamp: matchedGroup?.shipped_at || new Date().toISOString() },
        { status: 'In Transit via Air Express', location: 'Hyderabad Hub', timestamp: new Date().toISOString() },
      ],
      estimated_delivery: 'Within 2-3 business days',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
