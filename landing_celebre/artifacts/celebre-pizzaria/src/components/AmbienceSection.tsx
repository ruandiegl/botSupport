import { useEffect, useState, useRef } from 'react';
import eventRoomPath from '../../attached_assets/client_images/celebre-sala-evento.jpeg';
import fullRoomPath from '../../attached_assets/client_images/celebre-sala-cheia.jpeg';

export function AmbienceSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-card/30"
      id="ambiente"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-primary font-sans font-semibold mb-4">
            Nosso Espaço
          </p>
          <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
            Onde cada detalhe importa
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div
            className={`relative h-96 rounded-2xl overflow-hidden transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <img
              src={eventRoomPath}
              alt="Ambiente CELEBRE preparado para evento"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-serif text-3xl font-bold text-foreground">Ambiente Acolhedor</h3>
            </div>
          </div>

          <div
            className={`relative h-96 rounded-2xl overflow-hidden transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <img
              src={fullRoomPath}
              alt="Salão CELEBRE com famílias e grupos reunidos"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-serif text-3xl font-bold text-foreground">Celebrações em Grupo</h3>
            </div>
          </div>
        </div>

        <div
          className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground">Para Grupos e Famílias</h3>
            <p className="text-foreground/70">Espaço amplo e confortável para até 120 pessoas</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground">Ambiente Temático</h3>
            <p className="text-foreground/70">Detalhes pensados para noites de comunhão e celebração</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground">Atendimento Personalizado</h3>
            <p className="text-foreground/70">Acolhimento próximo para reservas, grupos e eventos especiais</p>
          </div>
        </div>
      </div>
    </section>
  );
}
