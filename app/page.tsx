import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import BackgroundScene from "@/components/three/BackgroundScene";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import WorkSection from "@/components/WorkSection";
import Gallery from "@/components/Gallery";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <BackgroundScene />
      <Preloader />
      <Cursor />
      <GrainOverlay />
      <Nav />

      <main id="top" className="relative z-10">
        <Hero />
        <Marquee />
        <WorkSection />
        <Gallery />
        <Services />
        <Stats />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
