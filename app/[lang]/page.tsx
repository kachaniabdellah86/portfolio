import { notFound } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import BackgroundScene from "@/components/three/BackgroundScene";
import JourneyChapters from "@/components/JourneyChapters";
import Marquee from "@/components/Marquee";
import WorkSection from "@/components/WorkSection";
import Gallery from "@/components/Gallery";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Testimonial from "@/components/Testimonial";
import About from "@/components/About";
import Faq from "@/components/Faq";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { getProjects } from "@/lib/projects";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const projects = getProjects(lang);

  return (
    <SmoothScroll>
      <BackgroundScene />
      <Cursor />
      <GrainOverlay />
      <Nav />
      <FloatingWhatsApp />

      <main id="top" className="relative z-10">
        <JourneyChapters />
        <div className="relative bg-[var(--bg)]">
          <Marquee />
          <WorkSection projects={projects} numeral="01" />
          {lang === "fr" ? (
            // Businesses: offer, method and proof first; the lab is a bonus.
            <>
              <Services t={dict.services} numeral="02" />
              <Process t={dict.process} />
              <Testimonial t={dict.testimonial} />
              <Stats />
              <About t={dict.about} numeral="03" whatsappMessage={dict.journey.whatsappMessage} />
              <Faq t={dict.faq} />
              <Gallery numeral="04" />
            </>
          ) : (
            // Studios and startups: craft first, then how to work together.
            <>
              <Gallery numeral="02" />
              <Services t={dict.services} numeral="03" />
              <Process t={dict.process} />
              <Testimonial t={dict.testimonial} />
              <About t={dict.about} numeral="04" whatsappMessage={dict.journey.whatsappMessage} />
              <Stats />
            </>
          )}
          <Footer />
        </div>
      </main>
    </SmoothScroll>
  );
}
