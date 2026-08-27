import { Reveal } from "./Marquee";

const SERVICES = [
  {
    index: "01",
    title: "Product & UI/UX Design",
    desc: "End-to-end product design — research, flows and high-fidelity interfaces built to convert, not just to impress.",
  },
  {
    index: "02",
    title: "Design Systems",
    desc: "Tokens, components and documentation that keep teams fast and products consistent at any scale.",
  },
  {
    index: "03",
    title: "Motion & Interaction",
    desc: "Micro-interactions, WebGL scenes and page transitions with intent — motion that carries the story.",
  },
  {
    index: "04",
    title: "Conversion & Trust UX",
    desc: "Multilingual journeys (FR / EN / AR) designed around clarity, credibility and the next click.",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative px-6 py-24 sm:px-12 sm:py-36">
      <span aria-hidden="true" className="ghost-numeral">
        03
      </span>
      <span
        aria-hidden="true"
        className="edge-label label-caps absolute left-3 top-40 hidden text-faint lg:block"
      >
        Capabilities
      </span>

      <Reveal>
        <p className="label-caps accent">Services</p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
          What I <span className="text-outline">bring</span> to
          <br />
          the{" "}
          <em className="serif accent text-[1.06em] italic">table.</em>
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="mt-8 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed">
          I work where product design and front-end engineering meet — turning
          complex ideas into clear, responsive experiences that feel considered
          in both the interface and the implementation.
        </p>
      </Reveal>

      <div className="mt-16">
        {SERVICES.map((service, i) => (
          <Reveal key={service.index} delay={i * 0.04}>
            <div className="group hairline-t relative grid gap-4 overflow-hidden py-9 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-10">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-[101%] bg-gradient-to-r from-transparent via-[rgba(91,143,255,0.07)] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-0"
              />
              <span className="serif accent text-xl italic">{service.index}</span>

              <div className="max-w-2xl">
                <h3 className="display text-2xl tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-3xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {service.desc}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="hidden text-xl text-faint opacity-0 transition-all duration-500 group-hover:text-[var(--accent)] group-hover:opacity-100 sm:block"
              >
                ↗
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
