import { useEffect, useState, useRef } from 'react';
import floatingPizzaPath from '../../attached_assets/client_images/celebre-pizza-real.jpeg';

export function FloatingPizzaSection() {
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
      className="relative py-24 lg:py-32 overflow-hidden"
      id="nossa-pizza"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text content */}
          <div
            className={`space-y-6 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <p className="text-xs tracking-[0.5em] uppercase text-primary font-sans font-semibold">
              Tradição Artesanal
            </p>
            <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Pizza como deve ser
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Massa fermentada por 72 horas, molho de tomate San Marzano, mussarela de búfala e 
              ingredientes frescos selecionados todos os dias. Nossa tradição napolitana encontra 
              o calor brasileiro em cada fatia.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Assada em forno de pedra a 400°C, cada pizza é uma obra de arte que honra tanto 
              a técnica italiana quanto o sabor autêntico que você merece.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-4xl font-serif font-bold text-primary">72h</div>
                <div className="text-sm text-foreground/60 tracking-wide">Fermentação Natural</div>
              </div>
              <div>
                <div className="text-4xl font-serif font-bold text-primary">400°C</div>
                <div className="text-sm text-foreground/60 tracking-wide">Forno de Pedra</div>
              </div>
              <div>
                <div className="text-4xl font-serif font-bold text-primary">100%</div>
                <div className="text-sm text-foreground/60 tracking-wide">Ingredientes Frescos</div>
              </div>
            </div>
          </div>

          {/* Floating pizza with 3D effect */}
          <div
            className={`relative transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
            style={{ perspective: '1000px' }}
          >
            {/* Gold radial glow behind */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-glow-pulse"></div>
            </div>

            {/* Pizza image */}
            <div
              className="relative group cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src={floatingPizzaPath}
                alt="Pizza artesanal CELEBRE"
                className="relative z-10 w-full animate-float group-hover:scale-105 transition-transform duration-700"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(212, 175, 55, 0.3))',
                  transition: 'all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-15px) rotate(2deg) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) rotate(0deg) scale(1)';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
