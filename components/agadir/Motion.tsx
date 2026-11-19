"use client";

import { Engine } from "@/engine/next";
import { setupMotion } from "@/motion/setup";

// Rendered as the last child of <body>, so page components register before the engine boots.
export default function Motion() {
  return <Engine setup={setupMotion} />;
}
