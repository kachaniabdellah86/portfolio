"use client";

import { useEffect } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { track } from "@vercel/analytics";
import type { Locale } from "@/lib/i18n";

// Any element with data-track="event" is counted on click, with its
// data-track-label and the page language, so we can see what converts.
export default function Analytics({ lang }: { lang: Locale }) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el?.dataset.track) return;
      track(el.dataset.track, { label: el.dataset.trackLabel ?? "", lang });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [lang]);

  // The insights script is served by Vercel only; elsewhere (local QA) it would 404.
  return process.env.NEXT_PUBLIC_VERCEL_ENV ? <VercelAnalytics /> : null;
}
