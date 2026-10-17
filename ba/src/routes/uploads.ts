import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { R2Service } from '../services/r2.js';

const router = Router();

// POST /api/uploads/presigned-url
router.post('/presigned-url', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileType, fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      res.status(400).json({ error: 'fileName and contentType are required.' });
      return;
    }

    const sellerId = req.user?.id || 'public';
    const presigned = await R2Service.getPresignedUploadUrl({
      sellerId,
      fileType: fileType || 'product_image',
      fileName,
      contentType,
    });

    res.json(presigned);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/uploads/direct (Development fallback)
router.post('/direct', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Return high quality handloom placeholder url
    res.json({
      publicUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
      message: 'Upload simulated successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
