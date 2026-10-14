"use client";

import { useEffect, useState } from "react";
import { whatsappUrl } from "@/lib/site";
import { useLocale } from "./LocaleProvider";
import WhatsAppIcon from "./WhatsAppIcon";

// Phones only: once the hero is behind you, WhatsApp stays one tap away,
// and it steps aside when the contact section is already on screen.
export default function FloatingWhatsApp() {
  const { dict } = useLocale();
  const [pastHero, setPastHero] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const contact = document.querySelector("#contact");
    const observer = new IntersectionObserver(([entry]) => setContactVisible(entry.isIntersecting));
    if (contact) observer.observe(contact);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const shown = pastHero && !contactVisible;

  return (
    <a
      href={whatsappUrl(dict.journey.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp_click"
      data-track-label="floating"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={`fixed bottom-5 right-4 z-[70] inline-flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-3 text-sm font-semibold text-[#05210f] shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all duration-300 md:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <WhatsAppIcon className="size-5" />
      {dict.floating.whatsapp}
    </a>
  );
}
