# Gadwal Weaves — Multi-Vendor Handloom Marketplace

An enterprise-grade, full-stack multi-vendor marketplace connecting authentic pit-loom weavers from Gadwal, Telangana, India directly with customers worldwide.

---

## 🥻 Live Development Servers

Both Frontend and Backend are currently running live:

- **Customer Website & Storefront:** [http://localhost:3001](http://localhost:3001)
- **Seller Portal Workspace:** [http://localhost:3001/seller](http://localhost:3001/seller)
- **Admin CRM Operations:** [http://localhost:3001/admin](http://localhost:3001/admin)
- **Backend API & Webhooks:** [http://localhost:5001/api](http://localhost:5001/api) (Health check: [http://localhost:5001/api/health](http://localhost:5001/api/health))

---

## 🔑 Pre-Configured Test Credentials & 1-Click Switcher

A quick persona switcher button is located directly in the top announcement bar of the website. You can also use the credentials below:

| Persona | Email | Password | Role & Access |
|---|---|---|---|
| **Super Admin** | `admin@gadwalweaves.in` | `Admin@123` | Full Admin CRM: GMV metrics, Seller KYC approval, catalog moderation, Razorpay refunds, seller payouts |
| **Master Weaver** | `venkateswara@gadwalweaves.in` | `Seller@123` | Seller Portal: Sri Venkateswara Handlooms, listing CRUD, packing parcels, Shiprocket AWB, financial ledger |
| **Customer** | `customer@gadwalweaves.in` | `Customer@123` | Storefront: multi-seller cart, coupons (`GADWAL10`, `FESTIVE15`), Razorpay checkout, live Shiprocket tracking |

---

## 📦 Tech Stack & Architecture

- **Frontend (`fe/`):** React 18, TypeScript, Vite, React Router 6, Tailwind CSS (luxury ivory, deep maroon `#5C101D`, and antique gold `#C5A059` aesthetic), TanStack Query, Lucide Icons.
- **Backend (`ba/`):** Node.js, Express.js, TypeScript, Helmet, Morgan, CORS, JWT authentication.
- **Database (`ba/src/db/`):** Full PostgreSQL / Supabase schema (`schema.sql`) with Row-Level Security (RLS) policies and resilient database store with seed data.
- **Payment Gateway (`ba/src/services/razorpay.ts`):** Razorpay order generation, HMAC SHA256 signature verification, and refund management.
- **Logistics & Shipping (`ba/src/services/shiprocket.ts`):** Shiprocket 6-digit postal code serviceability, rate checks, AWB assignment, and real-time tracking events.
- **Media & Documents (`ba/src/services/r2.ts`):** Cloudflare R2 S3-compatible presigned URL uploads with seller-scoped namespaces.

---

## 🚀 Running Commands

```bash
# Run both servers concurrently
npm run dev:backend   # Express API on port 5001
npm run dev:frontend  # Vite React on port 3001

# Run tests
npm run test:backend  # Vitest test suite
```
