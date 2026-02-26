'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

const PERIODS = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'Last Year', days: 365 },
];

interface DataPoint {
    date: string;   // 'YYYY-MM-DD'
    total: number;
}

function formatLabel(date: string, days: number): string {
    const d = new Date(date + 'T00:00:00');
    if (days <= 7) return d.toLocaleDateString('en-US', { weekday: 'short' });           // Mon, Tue…
    if (days <= 30) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Jan 5
    if (days <= 90) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Jan 5
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });           // Jan '25
}

// For 30+ day ranges, thin the X-axis ticks so they don't crowd
function shouldShowTick(index: number, total: number, days: number): boolean {
    if (days <= 7) return true;
    if (days <= 30) return index % 5 === 0 || index === total - 1;
    if (days <= 90) return index % 10 === 0 || index === total - 1;
    return index % 30 === 0 || index === total - 1;
}

export function RevenueChart() {
    const [days, setDays] = useState(30);
    const [rawData, setRawData] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/revenue?days=${days}`)
            .then(r => r.json())
            .then(d => { if (d.success) setRawData(d.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [days]);

    // Format dates for display and thin ticks for longer ranges
    const chartData = rawData.map((p, i) => ({
        date: p.date,
        name: shouldShowTick(i, rawData.length, days) ? formatLabel(p.date, days) : '',
        fullDate: formatLabel(p.date, days),
        total: p.total,
    }));

    const totalRevenue = rawData.reduce((s, p) => s + p.total, 0);
    const currentPeriod = PERIODS.find(p => p.days === days)!;

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                        {currentPeriod.label} · Total:{' '}
                        <span className="text-amber-500 font-semibold">
                            {formatPrice(totalRevenue)}
                        </span>
                    </CardDescription>
                </div>

                {/* Period selector */}
                <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
                    {PERIODS.map(p => (
                        <button
                            key={p.days}
                            onClick={() => setDays(p.days)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${days === p.days
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="pl-2">
                {loading ? (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading revenue data...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                tickFormatter={(val) => chartData.find(d => d.date === val)?.name ?? ''}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => v === 0 ? '₹0' : `₹${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
                                width={48}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))',
                                    fontSize: '12px',
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ''}
                                formatter={(value) => [formatPrice(Number(value)), 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#d97706"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#d97706' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
