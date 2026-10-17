import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from './layouts/CustomerLayout';
import { SellerLayout } from './layouts/SellerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { Home } from './pages/customer/Home';
import { Shop } from './pages/customer/Shop';
import { ProductDetail } from './pages/customer/ProductDetail';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { CustomerAccount } from './pages/customer/CustomerAccount';
import { WeaversList, WeaverDetail } from './pages/customer/WeaversList';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { 
  CraftAndHeritage, 
  AboutUs, 
  ContactUs, 
  TrackOrderPage, 
  ShippingPolicy, 
  ReturnsRefundPolicy, 
  PrivacyPolicy, 
  TermsAndConditions, 
  FAQPage 
} from './pages/customer/StaticPages';

// Seller Pages
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerProducts } from './pages/seller/SellerProducts';
import { SellerOrders } from './pages/seller/SellerOrders';
import { SellerFinance } from './pages/seller/SellerFinance';
import { SellerProfilePage } from './pages/seller/SellerProfile';
import { SellerOnboarding } from './pages/seller/SellerOnboarding';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSellers } from './pages/admin/AdminSellers';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminShipments } from './pages/admin/AdminShipments';
import { AdminFinance } from './pages/admin/AdminFinance';
import { AdminCMS } from './pages/admin/AdminCMS';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. CUSTOMER PUBLIC MARKETPLACE ROUTES */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="account/*" element={<CustomerAccount />} />
        <Route path="weavers" element={<WeaversList />} />
        <Route path="weavers/:slug" element={<WeaverDetail />} />
        <Route path="craft-and-heritage" element={<CraftAndHeritage />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="track-order" element={<TrackOrderPage />} />
        <Route path="shipping-policy" element={<ShippingPolicy />} />
        <Route path="returns-policy" element={<ReturnsRefundPolicy />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsAndConditions />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="seller/register" element={<SellerOnboarding />} />
        <Route path="become-a-weaver" element={<SellerOnboarding />} />
      </Route>

      {/* 2. SELLER PORTAL WORKSPACE */}
      <Route path="/seller" element={<SellerLayout />}>
        <Route index element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="finance" element={<SellerFinance />} />
        <Route path="profile" element={<SellerProfilePage />} />
      </Route>

      {/* 3. ADMIN CRM OPERATIONS */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="sellers" element={<AdminSellers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="shipments" element={<AdminShipments />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="cms" element={<AdminCMS />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
