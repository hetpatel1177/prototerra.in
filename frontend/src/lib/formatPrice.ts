/**
 * Format a number as Indian Rupees.
 * e.g. formatPrice(1299.5) → "₹1,299.50"
 */
export function formatPrice(amount: number | undefined | null): string {
    if (amount == null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
