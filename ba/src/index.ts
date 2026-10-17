import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import storefrontRoutes from './routes/storefront.js';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import checkoutRoutes from './routes/checkout.js';
import customerRoutes from './routes/customer.js';
import sellerRoutes from './routes/seller.js';
import adminRoutes from './routes/admin.js';
import shippingRoutes from './routes/shipping.js';
import uploadRoutes from './routes/uploads.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Gadwal Weaves Multi-Vendor API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/uploads', uploadRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🥻 GADWAL WEAVES ENTERPRISE BACKEND SERVER RUNNING`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🛡️  RBAC: Customer, Seller, and Admin CRM operational`);
  console.log(`=======================================================`);
});
