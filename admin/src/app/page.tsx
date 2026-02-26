'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopProduct } from '@/components/dashboard/TopProduct';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Stats {
  totalOrders: number;
  totalSales: number;
  avgOrderValue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/stats`)
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Sales"
          value={stats ? formatPrice(stats.totalSales) : '—'}
          trend="live"
          trendDirection="up"
          subtext="from backend"
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={stats ? String(stats.totalOrders) : '—'}
          trend="live"
          trendDirection="up"
          subtext="completed orders"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Avg. Order Value"
          value={stats ? formatPrice(stats.avgOrderValue) : '—'}
          trend="live"
          trendDirection="up"
          subtext="per transaction"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
        <div className="md:col-span-4">
          <RevenueChart />
        </div>
        <div className="md:col-span-3">
          <TopProduct />
        </div>
      </div>

      <RecentOrders />
    </div>
  );
}
