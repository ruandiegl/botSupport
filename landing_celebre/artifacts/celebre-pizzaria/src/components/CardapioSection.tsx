import { useEffect, useState, useRef } from 'react';
import pizzaRealPath from '../../attached_assets/client_images/celebre-pizza-real.jpeg';
import pizzaVarietyPath from '../../attached_assets/generated_images/pizza-variety.jpg';
import pizzaHeroPath from '../../attached_assets/generated_images/pizza-hero.jpg';

const pizzas = [
  {
    name: 'Margherita Clássica',
    description: 'Molho de tomate San Marzano, mussarela de búfala, manjericão fresco, azeite extravirgem',
    price: 'R$ 58',
    image: pizzaHeroPath,
  },
  {
    name: 'Frango com Catupiry',
    description: 'Frango desfiado, catupiry cremoso, mussarela e borda dourada no forno',
    price: 'R$ 62',
    image: pizzaRealPath,
  },
  {
    name: 'Quattro Formaggi',
    description: 'Gorgonzola, parmesão, mussarela, provolone, mel de engenho',
    price: 'R$ 68',
    image: pizzaVarietyPath,
  },
  {
    name: 'Portuguesa Gospel',
    description: 'Presunto, ovos, cebola, azeitonas, mussarela, orégano',
    price: 'R$ 64',
    image: pizzaRealPath,
  },
  {
    name: 'Vegetariana da Casa',
    description: 'Tomate seco, rúcula, champignon, pimentão, azeitonas, queijo de cabra',
    price: 'R$ 66',
    image: pizzaHeroPath,
  },
  {
    name: 'Calabresa Especial',
    description: 'Calabresa artesanal, cebola roxa, mussarela, pimenta biquinho',
    price: 'R$ 60',
    image: pizzaVarietyPath,
  },
];

export function CardapioSection() {
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
      className="relative py-24 lg:py-32 bg-card/50"
      id="cardapio"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-primary font-sans font-semibold mb-4">
            Nosso Cardápio
          </p>
          <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
            Sabores que celebram
          </h2>
          <p className="text-lg text-foreground/70">
            Cada pizza é preparada com dedicação e os melhores ingredientes.
            Escolha entre nossos clássicos ou peça à la carte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pizzas.map((pizza, index) => (
            <div
              key={pizza.name}
              className={`group overflow-hidden border border-border/50 rounded-3xl bg-background/70 hover:border-primary/50 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              data-testid={`pizza-card-${index}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-7">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {pizza.name}
                  </h3>
                  <span className="font-sans text-xl font-bold text-primary whitespace-nowrap">
                    {pizza.price}
                  </span>
                </div>
                <p className="text-foreground/60 leading-relaxed">
                  {pizza.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm text-foreground/60 mb-4">
            Mais de 30 sabores disponíveis no rodízio
          </p>
          <button
            onClick={() => document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-full border-2 border-primary text-primary font-sans font-semibold text-sm tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            data-testid="cardapio-cta"
          >
            Fazer Reserva
          </button>
        </div>
      </div>
    </section>
  );
}
