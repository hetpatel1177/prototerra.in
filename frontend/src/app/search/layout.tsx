import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Results | ProtoTerra',
    description: 'Search for artisanal pottery, unique stoneware, and premium ceramics at ProtoTerra.',
    robots: {
        index: false, // Usually search results aren't indexed to avoid duplicate content/thin content penalties
        follow: true
    }
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
