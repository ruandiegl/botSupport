import { useEffect, useState, useRef } from 'react';
import karaokeStagePath from '../../attached_assets/client_images/celebre-sala-cheia.jpeg';

export function KaraokeSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-gradient-to-b from-background via-card/30 to-background overflow-hidden"
      id="karaoke"
    >
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-secondary font-sans font-semibold mb-4">
            Noites de Celebração
          </p>
          <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-foreground">Karaokê</span>
            <br />
            <span className="text-secondary">Gospel</span>
          </h2>
          <p className="text-lg text-foreground/70">
            Toda sexta e sábado à noite, o CELEBRE se transforma. Venha cantar seus louvores 
            favoritos enquanto saboreia as melhores pizzas da cidade.
          </p>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={karaokeStagePath}
                alt="Noite de karaokê no CELEBRE"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Features */}
          <div
            className={`space-y-8 transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Sistema Profissional</h3>
                  <p className="text-foreground/70">
                    Equipamento de som de alta qualidade, microfones profissionais e telão para acompanhar as letras.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Repertório Completo</h3>
                  <p className="text-foreground/70">
                    Centenas de músicas gospel e louvores para todos os gostos. Peça sua música favorita!
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Ambiente Acolhedor</h3>
                  <p className="text-foreground/70">
                    Perfeito para grupos de igreja, celebrações e confraternizações em família.
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-card/50 border border-secondary/30 rounded-xl p-6">
              <h4 className="font-sans font-bold text-secondary tracking-wider uppercase text-sm mb-4">
                Programação
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Sexta-feira</span>
                  <span className="text-foreground/70">19h às 23h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Sábado</span>
                  <span className="text-foreground/70">19h às 00h</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-sans font-bold text-sm tracking-wide hover:scale-105 transition-transform duration-300"
              data-testid="karaoke-cta"
            >
              Garantir Minha Vaga
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
