import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Banknote } from 'lucide-react';

export function PricingInventory({ initialData }: { initialData?: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-amber-500" />
                    Pricing &amp; Inventory
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="price">Base Price (₹) *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                placeholder="0.00"
                                className="pl-7"
                                defaultValue={initialData?.price}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="sku">SKU Code</label>
                        <Input
                            id="sku"
                            name="sku"
                            placeholder="VSE-001-BRW"
                            defaultValue={initialData?.sku}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="stockQty">Stock Quantity</label>
                        <Input
                            id="stockQty"
                            name="stockQty"
                            type="number"
                            min="0"
                            placeholder="0"
                            defaultValue={initialData?.stockQty}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
