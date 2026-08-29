# Prototerra: Project Deep Dive & Interview Strategy

This document provides a detailed technical breakdown of the **ProtoTerra** e-commerce platform, structured around four core pillars. It is designed to help you answer the "Why", "How", and "Management" questions that typically arise during technical and management-level interviews.

---

## 🏗️ Pillar 1: Full-Stack Scalability & Architecture
> **Focus:** "Developed a scalable full-stack e-commerce platform using Next.js, Node.js, and MongoDB, managing end-to-end workflows from product discovery to order fulfillment."

### 1. Why this Tech Stack vs. Alternatives?
*   **Next.js (Frontend):** Why not a standard React SPA (Vite)?
    *   **The "Why":** SEO is non-negotiable for e-commerce. Next.js provides **Server-Side Rendering (SSR)** and **Static Site Generation (SSG)**, ensuring product pages are crawlable by search engines. It also offers built-in image optimization which was critical for our media-heavy hero section.
*   **Node.js/Express (Backend):** Why not just use Next.js API routes for everything?
    *   **The "Why":** Separation of concerns. By building a standalone Node.js/Express server, I could handle heavy business logic, long-running maintenance scripts (like `repair-tags.ts`), and high-concurrency payment webhooks without putting load on the frontend server.
*   **MongoDB Atlas (Database):** Why not a SQL database like PostgreSQL?
    *   **The "Why":** E-commerce products are often heterogeneous (different categories have different attributes like size, color, material, or technical specs). MongoDB’s **Schema-less (Flexible)** nature allowed me to store these variations without complex join tables, leading to faster development and simpler queries.

### 2. How is it Structured?
*   It is a **Decoupled Architecture**. The system consists of three distinct layers:
    1.  **Client-Facing Frontend:** Next.js optimized for UX and storytelling.
    2.  **Admin BI Portal:** A separate Next.js dashboard for management and analytics.
    3.  **Centralized API:** A TypeScript-driven Node.js server that acts as the single source of truth for the database.

### 3. How did you manage Scalability?
*   I managed scalability through **Database Indexing** (Compound indexes for price/category filters) and by conducting **k6 Load Testing** to simulate 1,000 concurrent users. This helped identify bottlenecks in the product fetch logic, which I optimized using `.select()` to only return necessary fields.

---

## 🎬 Pillar 2: Cinematic Interaction & UX
> **Focus:** "Engineered a 300vh scroll-based interactive UI with synchronized animation phases using Framer Motion and Lenis for seamless user experience."

### 1. Why these Animation Tools?
*   **Lenis Scroll:** Standard browser scrolling can feel "choppy," especially when triggering animations. Lenis provides a **Virtual Scroll** layer that makes movement feel "liquid" and premium without breaking accessible features or keyboard navigation.
*   **Framer Motion:** It is the industry standard for React animations. I specifically used the `useScroll` and `useTransform` hooks, which allow for a declarative way to map scroll progress directly to visual transitions.

### 2. How is it Structured?
*   **Scroll Mapping:** I divided the 300vh scroll into **4 distinct phases**:
    1.  **0-25%:** Hero Frame Sequence Playback.
    2.  **25-50%:** Brand Narrative/Text Reveal.
    3.  **50-75%:** Product Category Entrance.
    4.  **75-100%:** Transition to the dynamic product shop.
*   **Optimization:** Instead of 160 `<img>` tags, I used an **HTML5 Canvas**. I mapped the scroll progress (0 to 1) to a frame index (0 to 159), drawing the corresponding WebP image in a `requestAnimationFrame` loop.

### 3. How did you Manage Performance?
*   I implemented **Frame Stepping** (dropping frames if the scroll speed is too high) and **Image Preloading**. By converting assets to **WebP**, I reduced the total animation payload from ~140MB to under 8MB, a **94% reduction** in bandwidth.

---

## 🛡️ Pillar 3: Backend Security & High Concurrency
> **Focus:** "Built a robust backend supporting concurrent users with secure Razorpay payment integration and implemented Google Sign-In authentication for seamless and secure user access."

### 1. Why these Security Choices?
*   **Razorpay:** Chosen for its robust Webhook system and market-leading documentation. It allowed for a secure "Capture" workflow instead of immediate charging.
*   **Google Sign-In (NextAuth.js):** I prioritized "Frictionless Checkout." Users are 40% more likely to complete a purchase if they can sign in with one click rather than filling out a registration form.

### 2. How is the Payment Flow Structured?
*   I implemented a **HMAC-SHA256 Signature Verification** system. When Razorpay sends a "Success" webhook, my backend doesn't trust it blindly. It reconstructs the signature using a private secret and compares it to the incoming header. This prevents "Man-in-the-Middle" attacks.

### 3. How did you manage Concurrent Users?
*   During a "Flash Sale" scenario, multiple users might hit the payment endpoint simultaneously. I used **Mongoose Sessions** and **Atomic Transactions** (using `$inc` with a conditional `{ stock: { $gt: 0 } }`) to ensure a product is never oversold, even if two payments arrive at the exact same millisecond.

---

## 📦 Pillar 4: Business Logic & Operations
> **Focus:** "Implemented core business logic including inventory management, order tracking, and automated email notifications for operational efficiency."

### 1. Structure of the Inventory System
*   The inventory is managed at the **Schema Level**. Every product has a `stock` field. When an order reaches the 'Paid' status, a middleware automatically decrements the stock and checks if it falls below a "Low Stock" threshold (default: 5), which triggers an alert on the Admin Dashboard.

### 2. How did you handle Notifications?
*   I used **Nodemailer** integrated with the Order Lifecycle. 
    - **Trigger A:** Payment Success -> Sends an HTML receipt.
    - **Trigger B:** Order Status Update (e.g., "Shipped") -> Sends a tracking ID.
    - **Trigger C:** Newsletter Subscription -> Sends a welcome discount.

### 3. Management & Fulfillment Workflow
*   **End-to-End Logic:** User Discovery (Canvas) -> Cart Persistence (Zustand) -> Payment (Razorpay) -> Order Generation (Mongo) -> Admin Fulfillment.
*   I built a custom "Snapshot" feature in the `Order` model. Even if a product price changes later, the order record keeps a snapshot of the price at the time of purchase to ensure financial accuracy during audit or returns.

---

## 🛠️ Key Metrics for Your Interview
*   **Speed:** 94% asset payload reduction through WebP sequence conversion.
*   **Depth:** 300vh scroll depth with 160-frame synchronization.
*   **Reliability:** 100% stock accuracy via atomic MongoDB updates.
*   **Security:** Full HMAC validation and JWT-based session management.
