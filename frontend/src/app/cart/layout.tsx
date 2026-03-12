import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Cart | ProtoTerra',
    robots: {
        index: false,
        follow: false
    }
};

export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
