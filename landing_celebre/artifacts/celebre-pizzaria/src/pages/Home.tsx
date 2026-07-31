import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FloatingPizzaSection } from '@/components/FloatingPizzaSection';
import { CardapioSection } from '@/components/CardapioSection';
import { RodizioSection } from '@/components/RodizioSection';
import { KaraokeSection } from '@/components/KaraokeSection';
import { AmbienceSection } from '@/components/AmbienceSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ReservationSection } from '@/components/ReservationSection';
import { Footer } from '@/components/Footer';
import { MobileFloatingCTA } from '@/components/MobileFloatingCTA';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background grain-overlay">
      <Navigation />
      <HeroSection />
      <FloatingPizzaSection />
      <CardapioSection />
      <RodizioSection />
      <KaraokeSection />
      <AmbienceSection />
      <TestimonialsSection />
      <ReservationSection />
      <Footer />
      <MobileFloatingCTA />
    </div>
  );
}
