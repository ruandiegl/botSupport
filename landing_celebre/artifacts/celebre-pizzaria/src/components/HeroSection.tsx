import { useEffect, useState } from 'react';
import heroRoomPath from '../../attached_assets/client_images/celebre-sala-cheia.jpeg';
import logoPath from '../../attached_assets/client_images/celebre-logo.jpeg';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-28 pb-20 sm:pt-32 lg:pt-24">
      <div className="absolute inset-0">
        <img
          src={heroRoomPath}
          alt=""
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/80 to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-primary font-sans font-semibold mb-6">
            Onde fé e sabor se encontram
          </p>
          <span className="mx-auto mb-8 block h-36 w-36 overflow-hidden rounded-full shadow-[0_0_70px_rgba(212,175,55,0.25)] sm:h-44 sm:w-44 lg:h-52 lg:w-52">
            <img
              src={logoPath}
              alt="Logo Celebre Pizzaria Gospel Bar Abbas"
              className="h-full w-full scale-[1.18] rounded-full object-cover"
            />
          </span>
          <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-[0.95] text-foreground">
            Celebre cada
            <br />
            <span className="gold-gradient-text">momento</span>
          </h1>
          <p className="text-lg lg:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Pizza artesanal, rodízio completo e noites de karaokê gospel.
            <br />
            Um lugar feito para famílias, grupos de igreja e celebração.
          </p>

          <div className="relative z-20 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection('cardapio')}
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-sans font-bold text-sm tracking-wide hover:scale-105 transition-transform duration-300"
              data-testid="hero-cta-cardapio"
            >
              Ver Cardápio Completo
            </button>
            <button
              onClick={() => scrollToSection('reserva')}
              className="px-8 py-4 rounded-full border-2 border-foreground/20 text-foreground font-sans font-semibold text-sm tracking-wide hover:border-primary hover:text-primary transition-all duration-300"
              data-testid="hero-cta-reserva"
            >
              Reservar Mesa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
