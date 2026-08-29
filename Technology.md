# ProtoTerra: Technology Stack Reference

This document lists every technology, library, and tool used to build the ProtoTerra platform, categorized by their role in the architecture.

---

## 🎨 Frontend (Customer Facing)
*   **Next.js 15+ (v16.1.6)**: The core framework for Server-Side Rendering (SSR) and optimized routing.
*   **React 19**: The latest React library for high-performance UI rendering.
*   **Framer Motion 12**: Used for complex, scroll-driven animations and gesture interactions.
*   **Lenis Scroll**: A high-performance smooth scroll library for a cinematic feel.
*   **Tailwind CSS 4**: Modern CSS utility framework used for all styling.
*   **NextAuth.js (v5 Beta)**: Secure authentication management (Google Sign-In, etc.).
*   **Lucide React**: For sleek, consistent SVG icons.
*   **clsx & tailwind-merge**: Utilities for managing dynamic CSS classes.
*   **Date-fns**: Lightweight library for date formatting.

---

## 🛠️ Administrative Portal (Merchant Facing)
*   **Next.js 15+ (v16.1.6)**: Separate instance for the management dashboard.
*   **Recharts**: Data visualization library for sales trends and revenue analytics.
*   **Radix UI**: Primitive components (Select, Slot) for accessible and consistent UI.
*   **NextAuth.js (v4.24)**: Traditional session management for admin access.
*   **Sonner**: Premium toast notification system.
*   **Bcryptjs**: For secure password hashing and verification in the admin panel.

---

## ⚙️ Backend (The Engine)
*   **Node.js**: The cross-platform JavaScript runtime.
*   **Express.js (v5.2.1)**: Robust web framework for building the centralized API.
*   **TypeScript (v5.9)**: Strictly typed programming language for backend stability.
*   **Nodemailer**: For sending transactional emails (order confirmations, newsletters).
*   **Razorpay SDK**: Financial orchestration and payment gateway integration.
*   **Cloudinary SDK**: Cloud storage and transformation for product media.
*   **Multer / Multer-Storage-Cloudinary**: Middleware for handling multipart/form-data (image uploads).
*   **Helmet.js**: Security middleware for setting HTTP response headers.
*   **Cors**: Middleware for cross-origin resource sharing.
*   **Express-Validator**: For thorough input sanitization and verification.
*   **Dotenv**: Management of sensitive environment variables.
*   **Nodemon**: Development utility for automatic server restarts.

---

## 📂 Database & Storage
*   **MongoDB Atlas**: Distributed NoSQL cloud database for flexible product schemas.
*   **Mongoose (v8 & v9)**: Powerful ODM (Object Document Mapper) for MongoDB.
*   **MongoDB Adapter (Auth)**: For persistent user session storage in NextAuth.
*   **Cloudinary**: Dedicated cloud bucket for optimized delivery of 160-frame animations and product photos.

---

## 🧪 Testing & DevOps
*   **k6 (Grafana)**: Go-based tool for load testing high-concurrency (1,000 users).
*   **npm**: Dependency and package management.
*   **ESLint**: Static code analysis for identifying patterns and potential errors.
*   **TS-Node**: Utility to run TypeScript files directly in a Node environment.

---

## 📝 Miscellaneous Logic
*   **Nanoid**: For generating short, non-sequential, URL-friendly unique IDs (Orders, Products).
*   **HMAC-SHA256**: Secure hashing algorithm used for Razorpay signature verification.
