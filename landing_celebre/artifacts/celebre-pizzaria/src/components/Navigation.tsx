import { useState, useEffect } from 'react';
import logoPath from '../../attached_assets/client_images/celebre-logo.jpeg';
import pizzaPath from '../../attached_assets/client_images/pizza-top-hover.webp';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3' : 'py-6'
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('cardapio')}
            className="text-xs tracking-widest uppercase text-foreground/80 hover:text-primary transition-colors duration-300"
            data-testid="nav-cardapio"
          >
            Cardápio
          </button>
          <button
            onClick={() => scrollToSection('rodizio')}
            className="text-xs tracking-widest uppercase text-foreground/80 hover:text-primary transition-colors duration-300"
            data-testid="nav-rodizio"
          >
            Rodízio
          </button>
          <button
            onClick={() => scrollToSection('karaoke')}
            className="text-xs tracking-widest uppercase text-foreground/80 hover:text-primary transition-colors duration-300"
            data-testid="nav-karaoke"
          >
            Karaokê
          </button>
        </div>

        {/* Center logo */}
        <button
          type="button"
          onClick={scrollToTop}
          className="group justify-self-center rounded-full [perspective:900px]"
          data-testid="nav-logo"
          aria-label="Voltar ao topo"
        >
          <span className="relative block h-14 w-14 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.25)] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)] lg:h-16 lg:w-16">
            <span className="absolute inset-0 overflow-hidden rounded-full [backface-visibility:hidden]">
              <img
                src={logoPath}
                alt=""
                className="h-full w-full scale-[1.18] rounded-full object-cover"
              />
            </span>
            <span className="absolute inset-0 overflow-hidden rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <img
                src={pizzaPath}
                alt=""
                className="h-full w-full scale-[1.08] rounded-full object-cover"
              />
            </span>
          </span>
          <span className="sr-only">CELEBRE Pizzaria</span>
        </button>

        {/* Right CTA */}
        <div className="hidden lg:block justify-self-end">
          <button
            onClick={() => scrollToSection('reserva')}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-sans font-semibold text-sm tracking-wide hover:scale-105 transition-transform duration-300"
            data-testid="nav-reserva"
          >
            Faça uma Reserva
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => scrollToSection('cardapio')}
          className="lg:hidden justify-self-end text-primary"
          data-testid="nav-mobile-menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
