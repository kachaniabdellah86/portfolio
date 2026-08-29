import { Reveal } from "./Marquee";

export default function About() {
  return (
    <section id="about" className="relative px-6 py-24 sm:px-12 sm:py-36">
      <span aria-hidden="true" className="ghost-numeral">
        04
      </span>

      <Reveal>
        <p className="label-caps accent">About</p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[1.04]">
          Computer engineer <span className="text-outline">building</span> the next
          <br />
          <em className="serif accent text-[1.06em] italic">intersection.</em>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-8 max-w-3xl">
        <Reveal delay={0.12}>
          <div className="grid gap-3">
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              I&apos;m a computer engineering student based in Morocco, working across creative development, AI systems, product design and full-stack development.
            </p>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed">
              I design and build intelligent digital products — from AI interfaces and full-stack platforms to cinematic experiences. I&apos;m drawn to problems where design and engineering collide: making invisible systems visible, translating complex ideas into clarity, and creating experiences that feel both thoughtful and alive.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="grid gap-3 border-t border-white/8 pt-8">
            <p className="label-caps text-white/50">Interested in</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Creative Development",
                "Frontend Engineering",
                "Full-Stack Development",
                "AI Engineering",
                "Product Design",
              ].map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="grid gap-3 border-t border-white/8 pt-8">
            <p className="label-caps text-white/50">Connect</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href="https://github.com/kachaniabdellah86"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[var(--accent)] transition-colors"
              >
                GitHub →
              </a>
              <a
                href="https://www.linkedin.com/in/abdellah-kachani-8284a5251/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[var(--accent)] transition-colors"
              >
                LinkedIn →
              </a>
              <a
                href="mailto:abdellah.kachani@e-polytechnique.ma"
                className="text-white/60 hover:text-[var(--accent)] transition-colors"
              >
                Email →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
