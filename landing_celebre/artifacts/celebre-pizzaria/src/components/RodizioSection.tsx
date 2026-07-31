import { useEffect, useState, useRef } from 'react';
import pizzaVarietyPath from '../../attached_assets/client_images/celebre-pizza-real.jpeg';

const benefits = [
  'Mais de 30 sabores de pizza',
  'Massas doces e salgadas',
  'Bebidas incluídas',
  'Sobremesas artesanais',
  'Sem limite de tempo',
  'Ambiente temático',
];

export function RodizioSection() {
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
      className="relative py-24 lg:py-32"
      id="rodizio"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={pizzaVarietyPath}
                alt="Rodízio de pizzas CELEBRE"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>

            {/* Price badge */}
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-full p-8 shadow-2xl">
              <div className="text-center">
                <div className="text-sm font-sans font-semibold tracking-wider">A partir de</div>
                <div className="text-4xl font-serif font-bold">R$ 69</div>
                <div className="text-xs tracking-wider">por pessoa</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`space-y-6 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <p className="text-xs tracking-[0.5em] uppercase text-primary font-sans font-semibold">
              Rodízio Completo
            </p>
            <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Pizza sem limites
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Nosso rodízio é perfeito para famílias e grupos de igreja. Experimente quantos 
              sabores quiser, com pizzas quentes saindo direto do forno, direto para sua mesa.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="text-foreground/80">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={() => document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-sans font-bold text-sm tracking-wide hover:scale-105 transition-transform duration-300"
                data-testid="rodizio-cta"
              >
                Reservar para o Rodízio
              </button>
            </div>

            <p className="text-sm text-foreground/50 pt-2">
              Disponível de terça a domingo, das 18h às 23h
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
