import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Story | ProtoTerra - Artisanal Tradition & Modern Design',
    description: 'Learn about the ProtoTerra journey. We bridge the gap between ancient ritual and modern living, crafting vessels that carry the weight of history and the lightness of art.',
};

export default function OurStoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
