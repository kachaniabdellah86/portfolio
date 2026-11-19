"use client";

import { useEffect, useState } from "react";

const format = () =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Casablanca", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());

/** Local time in Agadir: it is also what sets the angle of the light on the wall. */
export default function Clock({ label }: { label: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setTime(format());
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time className="num" aria-label={time ? `${label}: ${time}` : label} suppressHydrationWarning>
      {time ?? "--:--"}
    </time>
  );
}
