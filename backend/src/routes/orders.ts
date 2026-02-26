import express from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { nanoid } from 'nanoid';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

import { sendEmail } from '../lib/email';

// Helper to generate email HTML
const generateOrderEmailHtml = (order: any) => {
    const itemsHtml = order.items.map((item: any) => `
        <div style="display: flex; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold;">${item.productId.name || 'Product'}</p>
                <p style="margin: 0; font-size: 12px; color: #555;">Qty: ${item.quantity}</p>
            </div>
            <div style="font-weight: bold;">₹${item.price}</div>
        </div>
    `).join('');

    const frontendUrl = process.env.FRONTEND_URL || 'https://prototerra.in';

    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #C47A2C; text-align: center;">Thank you for your order!</h2>
            <p>Hi ${order.customer.firstName},</p>
            <p>We have received your order <strong>#${order.orderNumber}</strong> and are getting it ready.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Summary</h3>
                ${itemsHtml}
                <div style="text-align: right; margin-top: 10px;">
                    <p style="margin: 5px 0;"><strong>Total: ₹${order.total}</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #777;">Payment Mode: ${order.paymentMode}</p>
                </div>
            </div>

            <p style="margin-bottom: 5px;"><strong>Shipping Address:</strong></p>
            <p style="margin: 0; color: #555;">
                ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.zip}
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${frontendUrl}/account" style="background-color: #C47A2C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order History</a>
            </div>

            <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
                If you have any questions, reply to this email.
            </p>
        </div>
    `;
};

// GET /api/orders/stats — dashboard summary
router.get('/stats', async (_req, res) => {
    try {
        const [totalOrders, totalSalesAgg, recentOrders] = await Promise.all([
            Order.countDocuments({ status: { $nin: ['pending', 'failed', 'cancelled'] } }),
            Order.aggregate([{ $match: { status: { $nin: ['pending', 'failed', 'cancelled'] } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
            Order.find({ status: { $nin: ['pending', 'failed', 'cancelled'] } }).sort({ createdAt: -1 }).limit(5).populate('items.productId', 'name images'),
        ]);
        const totalSales = totalSalesAgg[0]?.total ?? 0;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        res.json({ success: true, data: { totalOrders, totalSales, avgOrderValue, recentOrders } });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET /api/orders/new?since=ISO — orders placed after a given timestamp
router.get('/new', async (req, res) => {
    try {
        const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
        const orders = await Order.find({ createdAt: { $gt: since }, status: { $nin: ['pending', 'failed', 'cancelled'] } })
            .sort({ createdAt: -1 })
            .select('orderNumber customer total createdAt status')
            .limit(20);
        res.json({ success: true, count: orders.length, data: orders });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET /api/orders/analytics — comprehensive charts data
router.get('/analytics', async (_req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // 1. Daily Revenue & Orders (Last 30 days)
        const dailyData = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $nin: ['pending', 'failed', 'cancelled'] } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                    },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        ]);

        // Fill gaps
        const chartData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const found = dailyData.find(x =>
                `${x._id.year}-${String(x._id.month).padStart(2, '0')}-${String(x._id.day).padStart(2, '0')}` === key
            );
            chartData.push({ date: key, revenue: found?.revenue || 0, orders: found?.orders || 0 });
        }

        // 2. Sales by Category
        // Note: This requires unwinding items and looking up products.
        // For standard MongoDB without $lookup complexity, we'll fetch all orders and aggregate in JS for simplicity/reliability
        // unless dataset is huge. Given the scale, JS aggregation is fine and safer.
        const allOrders = await Order.find({ status: { $nin: ['pending', 'failed', 'cancelled'] } }).populate('items.productId');
        const categoryMap = new Map<string, number>();
        const productMap = new Map<string, { _id: string; name: string; price: number; images: string[]; revenue: number; quantity: number }>();

        for (const order of allOrders) {
            for (const item of order.items) {
                if (!item.productId) continue;
                const p = item.productId as any;
                const revenue = item.price * item.quantity;

                // Category
                categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + revenue);

                // Product
                const pid = p._id.toString();
                if (!productMap.has(pid)) {
                    productMap.set(pid, { _id: pid, name: p.name, price: p.price, images: p.images || [], revenue: 0, quantity: 0 });
                }
                const pm = productMap.get(pid)!;
                pm.revenue += revenue;
                pm.quantity += item.quantity;
            }
        }

        const salesByCategory = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({ success: true, data: { chartData, salesByCategory, topProducts } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET /api/orders/revenue?days=30 — daily revenue aggregation
router.get('/revenue', async (req, res) => {
    try {
        const days = Math.min(Math.max(parseInt(req.query.days as string) || 30, 7), 365);
        const since = new Date();
        since.setDate(since.getDate() - days);
        since.setHours(0, 0, 0, 0);

        const result = await Order.aggregate([
            { $match: { createdAt: { $gte: since }, status: { $nin: ['pending', 'failed', 'cancelled'] } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                    },
                    total: { $sum: '$total' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        ]);

        // Build a full date range so days with no orders still appear as 0
        const map = new Map<string, number>();
        for (const r of result) {
            const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`;
            map.set(key, r.total);
        }

        const data: { date: string; total: number }[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            data.push({ date: key, total: map.get(key) ?? 0 });
        }

        res.json({ success: true, data });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET /api/orders — all orders or filter by email
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        let query: any = {};

        if (email) {
            query['customer.email'] = email;
        }

        const orders = await Order.find(query).sort({ createdAt: -1 }).populate('items.productId', 'name images');
        res.json({ success: true, data: orders });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST /api/orders
// POST /api/orders
// POST /api/orders
router.post('/', async (req, res) => {
    try {
        const { customer, items, total, shippingMethod, paymentMode } = req.body;

        if (paymentMode === 'COD') {
            const order = new Order({
                orderNumber: `ORD-${nanoid(8).toUpperCase()}`,
                customer,
                items,
                total,
                shippingMethod,
                status: 'confirmed', // COD orders are confirmed immediately
                paymentMode: 'COD',
                paymentStatus: 'pending'
            });
            await order.save();

            // Decrease stock for COD
            for (const item of items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stockQty: -item.quantity } });
            }

            // POPULATE PRODUCT DETAILS FOR EMAIL
            await order.populate('items.productId');

            // Send Confirmation Email
            await sendEmail(
                customer.email,
                `Order Confirmed: ${order.orderNumber}`,
                generateOrderEmailHtml(order)
            );

            return res.status(201).json({ success: true, data: order });
        }

        // Initialize Razorpay for online payments
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_yourKeyId',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_yourKeySecret',
        });

        const options = {
            amount: Math.round(total * 100), // amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: nanoid(8),
        };

        const razorpayOrder = await instance.orders.create(options);

        if (!razorpayOrder) return res.status(500).send('Expected Razorpay Order ID but none returned.');

        const order = new Order({
            orderNumber: `ORD-${nanoid(8).toUpperCase()}`,
            customer,
            items,
            total,
            shippingMethod,
            status: 'pending',
            paymentMode: 'RAZORPAY',
            razorpayOrderId: razorpayOrder.id,
        });

        await order.save();

        // Return order + razorpay details
        res.status(201).json({
            success: true,
            data: {
                ...order.toObject(),
                razorpayKeyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// POST /api/orders/verify-payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_yourKeySecret';

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: 'paid', // This is ORDER status, which maybe should be 'confirmed' or 'paid' based on your flow. I'll keep it as is or change to confirmed?
                    // Previous logic set order status to 'paid'. That might be confusing with 'confirmed'.
                    // Usually: Order Status = Confirmed, Payment Status = Paid.
                    // But your existing logic used 'paid' for order status.
                    // I will ADD paymentStatus: 'paid' here.
                    paymentStatus: 'paid',
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature
                },
                { returnDocument: 'after' }
            ).populate('items.productId');

            // Decrease stock for Online Payment
            if (order) {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stockQty: -item.quantity } });
                }

                // Send Confirmation Email
                await sendEmail(
                    order.customer.email,
                    `Order Confirmed: ${order.orderNumber}`,
                    generateOrderEmailHtml(order)
                );
            }

            res.json({ success: true, message: 'Payment verified', orderId: order?._id });
        } else {
            res.status(400).json({ success: false, error: 'Invalid signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const order = isObjectId
            ? await Order.findById(id).populate('items.productId')
            : await Order.findOne({ orderNumber: id }).populate('items.productId');
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, data: order });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, data: order });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// PATCH /api/orders/:id/payment-status
router.patch('/:id/payment-status', async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { returnDocument: 'after' });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, data: order });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;
