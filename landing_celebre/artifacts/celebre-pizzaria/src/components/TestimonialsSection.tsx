import { useEffect, useState, useRef } from 'react';

const testimonials = [
  {
    name: 'Ana Paula Silva',
    role: 'Líder do Grupo de Jovens',
    text: 'O CELEBRE se tornou nosso lugar preferido para confraternizações. A combinação de pizza deliciosa e um ambiente que acolhe nossa fé é única. As noites de karaokê são inesquecíveis!',
    rating: 5,
  },
  {
    name: 'Carlos Eduardo Santos',
    role: 'Pastor',
    text: 'Trouxemos nossa congregação para um jantar de celebração e foi perfeito. O rodízio é excelente, o atendimento é caloroso e o espaço comportou nosso grupo com conforto.',
    rating: 5,
  },
  {
    name: 'Mariana Oliveira',
    role: 'Mãe de Família',
    text: 'Minha família adora! As pizzas são autênticas, massa leve e ingredientes frescos. Meus filhos adoram cantar no karaokê enquanto esperamos a próxima fatia.',
    rating: 5,
  },
];

export function TestimonialsSection() {
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
      className="relative py-24 lg:py-32"
      id="depoimentos"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-primary font-sans font-semibold mb-4">
            Depoimentos
          </p>
          <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            O que dizem nossos clientes
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`p-8 border border-border/50 rounded-2xl space-y-4 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              data-testid={`testimonial-${index}`}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="pt-4 border-t border-border/30">
                <div className="font-sans font-bold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-foreground/60">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
