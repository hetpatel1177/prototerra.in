import { MapPin, User, Mail } from 'lucide-react';

interface Order {
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        address: string;
        city: string;
        state: string;
        zip: string;
    };
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">{label}</span>
            <span className="text-sm text-[#F5F5F5]">{value || '—'}</span>
        </div>
    );
}

export function CustomerInfoCard({ order }: { order: Order }) {
    const { customer } = order;
    const initials = `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const hasAddress = customer.address || customer.city || customer.state;

    return (
        <div className="space-y-3">

            {/* Customer identity */}
            <div
                className="rounded-sm p-4 space-y-4"
                style={{ background: '#161616', border: '1px solid #2a2a2a' }}
            >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C47A2C]">Customer</p>
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-sm flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'rgba(196,122,44,0.12)', color: '#C47A2C' }}
                    >
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-[#F5F5F5] truncate">{fullName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3 text-[#9A9A9A]" />
                            <p className="text-xs text-[#9A9A9A] truncate">{customer.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping address */}
            <div
                className="rounded-sm p-4 space-y-3"
                style={{ background: '#161616', border: '1px solid #2a2a2a' }}
            >
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#C47A2C]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C47A2C]">Shipping Address</p>
                </div>
                {hasAddress ? (
                    <div className="space-y-1 text-sm text-[#F5F5F5]">
                        <p className="font-medium">{fullName}</p>
                        {customer.address && <p className="text-[#9A9A9A]">{customer.address}</p>}
                        {(customer.city || customer.state || customer.zip) && (
                            <p className="text-[#9A9A9A]">
                                {[customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-[#9A9A9A] italic">No address on file</p>
                )}
            </div>

            {/* Billing */}
            <div
                className="rounded-sm p-4"
                style={{ background: '#161616', border: '1px solid #2a2a2a' }}
            >
                <div className="flex items-center gap-1.5 mb-2">
                    <User className="h-3.5 w-3.5 text-[#C47A2C]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C47A2C]">Billing Address</p>
                </div>
                <p className="text-sm text-[#9A9A9A] italic">Same as shipping address</p>
            </div>
        </div>
    );
}
