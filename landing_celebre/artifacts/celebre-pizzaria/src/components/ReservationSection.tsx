import { useEffect, useState, useRef } from 'react';
import roomPath from '../../attached_assets/client_images/celebre-sala-evento.jpeg';

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE ?? '5511987654321';
const WHATSAPP_MESSAGE = 'olá, quero fazer uma reserva!';
const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export function ReservationSection() {
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
      id="reserva"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-primary font-sans font-semibold mb-4">
            Reserve sua Mesa
          </p>
          <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
            Garanta seu lugar
          </h2>
          <p className="text-lg text-foreground/70">
            Chame a equipe no WhatsApp e confirme sua mesa com uma conversa simples e direta.
          </p>
        </div>

        <div
          className={`grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-primary/20">
            <img
              src={roomPath}
              alt="Salão preparado para reservas e eventos no CELEBRE"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs tracking-[0.35em] uppercase text-primary font-semibold mb-2">
                Mesas, grupos e eventos
              </p>
              <h3 className="font-serif text-3xl font-bold text-foreground">
                Reserve para celebrar com calma
              </h3>
            </div>
          </div>

          <div className="rounded-3xl border border-border/40 bg-background/70 p-8 lg:p-10 flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.35em] text-primary font-semibold mb-4">
              Atendimento direto
            </p>
            <h3 className="font-serif text-4xl font-bold text-foreground mb-4">
              Fale conosco pelo WhatsApp
            </h3>
            <p className="text-foreground/70 leading-relaxed mb-8">
              O botão abre uma conversa com a mensagem “olá, quero fazer uma reserva!” já preenchida.
              Depois é só informar dia, horário e quantidade de pessoas.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-wide text-primary-foreground transition-transform duration-300 hover:scale-[1.02]"
              data-testid="whatsapp-reservation"
            >
              Reservar pelo WhatsApp
            </a>
            <p className="mt-5 text-sm text-foreground/50">
              Número configurável por <span className="font-mono">VITE_WHATSAPP_PHONE</span>.
            </p>
          </div>
        </div>

        <div
          className={`mt-16 grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center p-6 border border-border/30 rounded-xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="text-foreground/60 text-sm">Telefone</div>
            <div className="text-foreground font-semibold">(11) 98765-4321</div>
          </div>

          <div className="text-center p-6 border border-border/30 rounded-xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-foreground/60 text-sm">Endereço</div>
            <div className="text-foreground font-semibold">Av. Principal, 1234 - São Paulo</div>
          </div>

          <div className="text-center p-6 border border-border/30 rounded-xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-foreground/60 text-sm">Horário</div>
            <div className="text-foreground font-semibold">Ter-Dom: 18h - 23h</div>
          </div>
        </div>
      </div>
    </section>
  );
}
