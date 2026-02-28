import dynamic from 'next/dynamic';
import HeroDepth from '@/components/hero/HeroDepth';

// Dynamically import heavy sections for better TTI/Speed Index
const FeaturedCollections = dynamic(() => import('@/components/sections/FeaturedCollections'), {
  loading: () => <div className="h-96 bg-pt-bg animate-pulse" />,
  ssr: true // Enable SSR for SEO while keeping separate chunk
});

const StorySnippet = dynamic(() => import('@/components/sections/StorySnippet'), {
  ssr: true
});

const LatestProductsSlider = dynamic(() => import('@/components/sections/LatestProductsSlider'), {
  loading: () => <div className="h-screen bg-pt-bg animate-pulse" />,
  ssr: true
});

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-pt-bg">
      {/* 
        HeroDepth is a client component but its initial frame 
        will be SSRed because Home is a Server Component.
      */}
      <HeroDepth />
      <FeaturedCollections />
      <LatestProductsSlider />
      <StorySnippet />
    </main>
  );
}
