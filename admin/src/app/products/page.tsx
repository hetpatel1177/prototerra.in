'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Package, AlertTriangle, Loader2, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    images: string[];
    inStock: boolean;
    stockQty?: number;
    tags?: string[];
    sku?: string;
}

const LOW_STOCK_THRESHOLD = 5;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('all');     // all | low | out

    async function fetchProducts() {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
            const data = await res.json();
            if (data.success) setProducts(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Permanently delete this product?')) return;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, { method: 'DELETE' });
        setProducts(prev => prev.filter(p => p._id !== id));
    }

    useEffect(() => { fetchProducts(); }, []);

    // Derived stats
    const totalItems = products.length;
    // Out of stock = explicitly marked as not in stock OR quantity is exactly 0
    const isProductOutOfStock = (p: Product) => !p.inStock || p.stockQty === 0;
    // Low stock = in stock, qty > 0, but qty <= threshold
    const isProductLowStock = (p: Product) => !isProductOutOfStock(p) && (p.stockQty ?? 99) <= LOW_STOCK_THRESHOLD;
    const lowStockCount = products.filter(isProductLowStock).length;
    const outOfStockCount = products.filter(isProductOutOfStock).length;

    // Filtered list
    const filtered = useMemo(() => {
        return products.filter(p => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.sku ?? '').toLowerCase().includes(q) ||
                (p.tags ?? []).some(t => t.toLowerCase().includes(q));

            const matchStock =
                stockFilter === 'all' ? true :
                    stockFilter === 'low' ? isProductLowStock(p) :
                        isProductOutOfStock(p);

            return matchSearch && matchStock;
        });
    }, [products, search, stockFilter]);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Inventory</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your store's catalog, stock levels, and visibility.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Live stats */}
                    <div
                        className="flex items-center gap-4 px-4 py-2 rounded-sm"
                        style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">Total Items</p>
                            {loading
                                ? <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1 text-[#9A9A9A]" />
                                : <p className="text-xl font-bold text-[#F5F5F5]">{totalItems}</p>
                            }
                        </div>
                        <div className="w-px h-8" style={{ background: '#1f1f1f' }} />
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">Low Stock</p>
                            {loading
                                ? <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1 text-[#9A9A9A]" />
                                : <p className={`text-xl font-bold ${lowStockCount > 0 ? 'text-orange-400' : 'text-[#F5F5F5]'}`}>
                                    {lowStockCount}
                                </p>
                            }
                        </div>
                        <div className="w-px h-8" style={{ background: '#1f1f1f' }} />
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">Out of Stock</p>
                            {loading
                                ? <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1 text-[#9A9A9A]" />
                                : <p className={`text-xl font-bold ${outOfStockCount > 0 ? 'text-red-400' : 'text-[#F5F5F5]'}`}>
                                    {outOfStockCount}
                                </p>
                            }
                        </div>
                    </div>

                    <Button asChild className="bg-amber-600 hover:bg-amber-700">
                        <Link href="/products/new">
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, category, SKU or tag..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex h-10 w-full rounded-sm border border-input bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>



                {/* Stock filter */}
                <select
                    value={stockFilter}
                    onChange={e => setStockFilter(e.target.value)}
                    className="h-10 rounded-sm border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="all">Stock: Any Level</option>
                    <option value="low">Low Stock (≤{LOW_STOCK_THRESHOLD})</option>
                    <option value="out">Out of Stock</option>
                </select>

                {/* Result count */}
                {!loading && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {filtered.length} of {totalItems} products
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="rounded-sm border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading products...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <Package className="h-10 w-10 opacity-30" />
                        <p className="text-sm">
                            {products.length === 0 ? 'No products yet.' : 'No products match your filters.'}
                        </p>
                        {products.length === 0 && (
                            <Button asChild className="bg-amber-600 hover:bg-amber-700 mt-2">
                                <Link href="/products/new">Add your first product</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-14">IMAGE</TableHead>
                                <TableHead>PRODUCT</TableHead>
                                <TableHead>CATEGORY</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>PRICE</TableHead>
                                <TableHead>STOCK QTY</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead className="text-right">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(product => {
                                const isOut = isProductOutOfStock(product);
                                const isLow = !isOut && isProductLowStock(product);
                                return (
                                    <TableRow key={product._id}>
                                        <TableCell>
                                            <div className="h-10 w-10 rounded-sm bg-muted overflow-hidden">
                                                {product.images?.[0]
                                                    ? <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                                                    : <Package className="h-5 w-5 m-auto mt-2.5 text-muted-foreground/40" />
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                {product.tags && product.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                        {product.tags.slice(0, 3).map(t => (
                                                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{product.category}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs font-mono">{product.sku || '—'}</TableCell>
                                        <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {isLow && <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />}
                                                <span className={isLow ? 'text-orange-400 font-medium' : ''}>
                                                    {product.stockQty ?? '—'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={isOut ? 'draft' : isLow ? 'warning' : 'active'}
                                                className="uppercase text-[10px]"
                                            >
                                                {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <Link href={`/products/${product._id}`}>
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(product._id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
