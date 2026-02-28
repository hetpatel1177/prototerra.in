'use client';
import dynamic from 'next/dynamic';
import HeroDepth from '@/components/hero/HeroDepth';

// Dynamically import heavy sections
const FeaturedCollections = dynamic(() => import('@/components/sections/FeaturedCollections'), {
  loading: () => <div className="h-96 bg-pt-bg animate-pulse" />,
  ssr: false
});

const StorySnippet = dynamic(() => import('@/components/sections/StorySnippet'), {
  ssr: false
});

const LatestProductsSlider = dynamic(() => import('@/components/sections/LatestProductsSlider'), {
  loading: () => <div className="h-screen bg-pt-bg animate-pulse" />,
  ssr: false
});

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-pt-bg">
      <HeroDepth />
      <FeaturedCollections />
      <LatestProductsSlider />
      <StorySnippet />
    </main>
  );
}
