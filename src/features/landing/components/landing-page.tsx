import { useRef } from 'react';
import { useLandingAnimations } from '../hooks/use-landing-animations';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Clients } from './Clients';
import { Stats } from './Stats';
import { HowItWorks } from './HowItWorks';
import { ChamberMap } from './ChamberMap';
import { Features } from './Features';
import { InTheField } from './InTheField';
import { CtaBand } from './CtaBand';
import { Footer } from './Footer';

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useLandingAnimations(rootRef);

  return (
    <div ref={rootRef} className="bg-background text-foreground min-h-screen font-sans">
      <Navbar />
      <Hero />
      <Clients />
      <Stats />
      <HowItWorks />
      <ChamberMap />
      <Features />
      <InTheField />
      <CtaBand />
      <Footer />
    </div>
  );
}
