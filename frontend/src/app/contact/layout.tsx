import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | ProtoTerra - Support & Custom Commissions',
    description: 'Get in touch with the ProtoTerra team for order support, custom pottery commissions, or general inquiries about our artisanal collections.',
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
