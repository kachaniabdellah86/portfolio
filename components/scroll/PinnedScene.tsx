"use client";

import { useRef, type ReactNode } from "react";
import {
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

export default function PinnedScene({
  track = "260vh",
  children,
}: {
  track?: string;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 130, damping: 28 });
  const progress = useTransform(smooth, (v) =>
    v < 0.02 ? 0 : v > 0.98 ? 1 : v
  );

  return (
    <div ref={ref} style={{ height: track }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {children(progress)}
      </div>
    </div>
  );
}
