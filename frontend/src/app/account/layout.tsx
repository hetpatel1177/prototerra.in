import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Account | ProtoTerra',
    robots: {
        index: false,
        follow: false
    }
};

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
