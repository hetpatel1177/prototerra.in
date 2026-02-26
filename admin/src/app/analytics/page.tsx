'use client';

import { useEffect, useState } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, ShoppingBag, PieChart as PieIcon } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface ChartData { date: string; revenue: number; orders: number }
interface CategoryData { name: string; value: number }
interface ProductData { name: string; revenue: number; quantity: number }

interface AnalyticsData {
    chartData: ChartData[];
    salesByCategory: CategoryData[];
    topProducts: ProductData[];
}

const COLORS = ['#C47A2C', '#F5A623', '#8B572A', '#D0021B', '#4A90E2', '#7ED321'];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/analytics`)
            .then(r => r.json())
            .then(d => { if (d.success) setData(d.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)] text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading analytics...
        </div>
    );

    if (!data) return <div className="p-8 text-center text-muted-foreground">Failed to load data.</div>;

    const totalRevenue = data.chartData.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = data.chartData.reduce((s, d) => s + d.orders, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">Deep dive into your store's performance over the last 30 days.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-[#161616] border-[#1f1f1f]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#9A9A9A] uppercase tracking-wider">
                            30-Day Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-[#C47A2C]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F5F5F5]">{formatPrice(totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#161616] border-[#1f1f1f]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#9A9A9A] uppercase tracking-wider">
                            30-Day Orders
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-[#C47A2C]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F5F5F5]">{totalOrders}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart: Revenue & Orders */}
            <Card className="bg-[#161616] border-[#1f1f1f]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[#C47A2C]" />
                        <span className="text-[#F5F5F5]">Revenue & Order Volume</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C47A2C" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#C47A2C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#2a2a2a" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#555"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(d) => {
                                        const date = new Date(d);
                                        return `${date.getDate()}/${date.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#555"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `₹${v}`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#555"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f1f1f',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        color: '#F5F5F5'
                                    }}
                                    labelStyle={{ color: '#9A9A9A' }}
                                />
                                <Bar yAxisId="right" dataKey="orders" barSize={20} fill="#333" radius={[4, 4, 0, 0]} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#C47A2C"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#C47A2C' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Sales by Category */}
                <Card className="bg-[#161616] border-[#1f1f1f]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-[#C47A2C]" />
                            <span className="text-[#F5F5F5]">Sales by Category</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.salesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.salesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number | undefined) => formatPrice(value || 0)}
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#F5F5F5' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span style={{ color: '#9A9A9A', fontSize: '12px' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="bg-[#161616] border-[#1f1f1f]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#C47A2C]" />
                            <span className="text-[#F5F5F5]">Top 5 Products (Revenue)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={data.topProducts}
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid horizontal={false} stroke="#2a2a2a" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fill: '#9A9A9A', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#F5F5F5' }}
                                        formatter={(value: number | undefined) => formatPrice(value || 0)}
                                    />
                                    <Bar dataKey="revenue" fill="#C47A2C" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
