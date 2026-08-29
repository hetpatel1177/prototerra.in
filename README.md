# ProtoTerra | Full-Stack Creative E-Commerce Platform

ProtoTerra is a high-end, cinematic e-commerce platform designed for a premium brand experience. It combines cutting-edge frontend techniques with a robust, scalable backend architecture to provide a seamless journey from discovery to delivery.

## 🚀 Key Achievements

### 🎬 Cinematic Frontend Experience
*   **High-Performance Canvas Animations**: Engineered a "HeroDepth" component using HTML5 Canvas to render an optimized image sequence of **160 high-definition frames**.
*   **Asset Optimization**: Reduced asset payload by **94.7% per frame** by converting raw PNGs (~877KB) to optimized WebP formats (~46KB), drastically improving Time to Interactive (TTI).
*   **Scroll-Driven Orchestration**: Implemented a **300vh scroll-depth** experience using **Framer Motion** and **Lenis Smooth Scroll**, synchronizing **4 distinct narrative phases** with zero-latency scroll mapping.

### 🛠️ Robust Backend & Scalability
*   **Load Tested Reliability**: Validated system stability for up to **1,000 concurrent users** using **k6 load testing scripts**, ensuring consistent response times under peak traffic.
*   **Financial Orchestration**: Integrated **Razorpay** with secure **HMAC-SHA256** signature verification, managing complex order states for both COD and Digital payments.
*   **Advanced Analytics Engine**: Built MongoDB Aggregation Pipelines to process **30-day rolling revenue windows**, sales category distributions, and real-time inventory tracking for **top 5 trending products**.

### 📊 Administrative Control Center
*   **Business Intelligence Dashboard**: Developed a separate Admin portal featuring real-time data visualization with **Recharts**, allowing for instant insights into sales trends and order statistics.
*   **Content & Media Management**: Integrated **Cloudinary** for cloud-based image storage and transformation, coupled with **Multer** for efficient multipart form data handling during product uploads.

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15+, React 19, Framer Motion, Lenis Scroll, Tailwind CSS 4 |
| **Backend** | Node.js, Express.js (TypeScript), Mongoose |
| **Database** | MongoDB Atlas (NoSQL) |
| **Auth** | NextAuth.js |
| **Integrations** | Razorpay (Payments), Cloudinary (Media), Nodemailer (Email) |
| **Security** | Helmet.js, Bcrypt, Express-Validator |

## 🏗️ Technical Implementation Highlights

*   **Dynamic Image Sequences**: Optimized LCP by implementing frame stepping (rendering 1 frame every 2 indices) for the 160-frame sequence to balance visual fluidity with memory overhead.
*   **Transactional Integrity**: Implemented a "Verify-then-Charge" pattern for inventory, ensuring 100% stock accuracy across high-volume Razorpay transactions.
*   **Data Aggregation**: Optimized dashboard queries by moving heavy computation (daily revenue summing) to the database level using $group and $match pipelines.

---
*Created by [Your Name] as a showcase of Full-Stack Creative Engineering.*
