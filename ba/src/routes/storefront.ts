import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/storefront/home
// Returns unified payload for high-performance homepage rendering
router.get('/home', async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = db.getActiveBanners();
    const categories = db.getAllCategories();
    const collections = db.getAllCollections();
    const featuredProducts = db.getAllProducts({ sortBy: 'rating' }).slice(0, 8);
    const bestSellers = db.getAllProducts().filter(p => p.is_bestseller).slice(0, 4);
    const newArrivals = db.getAllProducts().filter(p => p.is_new_arrival).slice(0, 4);
    const verifiedSellers = db.getAllSellers().filter(s => s.is_verified && s.status === 'active');
    const recentReviews = db.getAllReviews().slice(0, 6);

    res.json({
      banners,
      categories,
      collections,
      featuredProducts,
      bestSellers,
      newArrivals,
      weavers: verifiedSellers,
      testimonials: recentReviews,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storefront/categories
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = db.getAllCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storefront/collections
router.get('/collections', async (req: Request, res: Response): Promise<void> => {
  try {
    const collections = db.getAllCollections();
    res.json(collections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storefront/weavers
router.get('/weavers', async (req: Request, res: Response): Promise<void> => {
  try {
    const weavers = db.getAllSellers().filter(s => s.status === 'active');
    res.json(weavers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storefront/weavers/:slug
router.get('/weavers/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const weaver = db.getSellerBySlug(req.params.slug as string);
    if (!weaver) {
      res.status(404).json({ error: 'Weaver not found.' });
      return;
    }
    const products = db.getAllProducts({ sellerId: weaver.id });
    res.json({ weaver, products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
