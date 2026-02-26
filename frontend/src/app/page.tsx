'use client';
import HeroDepth from '@/components/hero/HeroDepth';
import FeaturedCollections from '@/components/sections/FeaturedCollections';
import StorySnippet from '@/components/sections/StorySnippet';
import LatestProductsSlider from '@/components/sections/LatestProductsSlider';

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
