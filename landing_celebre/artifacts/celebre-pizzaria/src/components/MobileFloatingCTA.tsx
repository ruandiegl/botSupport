import { useEffect, useState } from 'react';

export function MobileFloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling past hero section
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`lg:hidden fixed bottom-6 left-6 right-6 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-background/95 backdrop-blur-lg border border-border/50 rounded-full p-2 shadow-2xl flex gap-2">
        <button
          onClick={() => scrollToSection('cardapio')}
          className="flex-1 px-4 py-3 rounded-full bg-foreground text-background font-sans font-semibold text-sm"
          data-testid="mobile-cta-cardapio"
        >
          Ver Cardápio
        </button>
        <button
          onClick={() => scrollToSection('reserva')}
          className="flex-1 px-4 py-3 rounded-full bg-primary text-primary-foreground font-sans font-semibold text-sm"
          data-testid="mobile-cta-reserva"
        >
          Reservar
        </button>
      </div>
    </div>
  );
}
