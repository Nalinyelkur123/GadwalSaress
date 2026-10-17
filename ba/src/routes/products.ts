import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/products
// Dynamic multi-criteria search, category filter, price range, color, fabric, sorting
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      category, 
      collection, 
      seller, 
      search, 
      minPrice, 
      maxPrice, 
      color, 
      fabric, 
      sortBy,
      page = '1',
      limit = '24'
    } = req.query;

    const products = db.getAllProducts({
      categorySlug: category as string,
      collectionSlug: collection as string,
      sellerId: seller as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      color: color as string,
      fabric: fabric as string,
      sortBy: sortBy as any,
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 24;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    res.json({
      products: paginated,
      total: products.length,
      page: pageNum,
      totalPages: Math.ceil(products.length / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = db.getProductBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const seller = db.getSellerById(product.seller_id);
    const reviews = db.getReviewsByProduct(product.id);
    const relatedProducts = db.getAllProducts({ categorySlug: product.category_slug })
      .filter(p => p.id !== product.id)
      .slice(0, 4);

    res.json({
      product,
      seller,
      reviews,
      relatedProducts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required to post reviews.' });
      return;
    }

    const { rating, comment, title } = req.body;
    const product = db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
      return;
    }

    if (!comment || comment.trim().length < 5) {
      res.status(400).json({ error: 'Review comment must be at least 5 characters.' });
      return;
    }

    const newReview = db.createReview({
      id: `rev-${uuidv4().substring(0, 8)}`,
      product_id: product.id,
      customer_id: req.user.id,
      customer_name: req.user.full_name,
      rating: parseInt(rating, 10),
      title: title?.trim(),
      comment: comment.trim(),
      verified_purchase: true,
      status: 'approved',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'Thank you! Your verified review has been submitted.',
      review: newReview,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
