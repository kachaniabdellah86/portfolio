import type { Locale } from "@/lib/i18n";

export type Brand = {
  accent: string;
  accentSoft: string;
  background: string;
  ink: string;
};

export type ProjectId = "kachanios" | "ficam" | "yalla" | "aura";

type ProjectText = {
  meaning: string;
  subtitle: string;
  tags: string[];
  status: string;
  role: string;
  problem: string;
  built: string;
};

type ProjectSource = {
  id: ProjectId;
  index: string;
  title: string;
  year: string;
  brand: Brand;
  href?: string;
  sourceHref?: string;
  /** Set for shipped work that has its own case-study page. */
  slug?: string;
  stack: string[];
  text: Record<Locale, ProjectText>;
};

export type Project = Omit<ProjectSource, "text" | "stack"> & {
  meaning: string;
  subtitle: string;
  tags: string[];
  status: string;
  details: { role: string; problem: string; built: string; stack: string[] };
};

// Real client work first: it is what a business visiting this page needs to see.
const PROJECTS: ProjectSource[] = [
  {
    id: "yalla",
    index: "01",
    title: "Yalla China",
    year: "2025",
    slug: "yalla-china",
    brand: {
      accent: "#f0b64a",
      accentSoft: "rgba(240,182,74,0.16)",
      background:
        "radial-gradient(ellipse at 74% 34%, rgba(240,182,74,0.16), transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(217,51,63,0.16), transparent 50%), linear-gradient(180deg, #1a0709 0%, #0d0405 100%)",
      ink: "#fff1dc",
    },
    href: "https://go-china-site.vercel.app/fr",
    stack: ["Next.js", "TypeScript", "Prisma + Supabase", "Tailwind CSS"],
    text: {
      en: {
        meaning: "From Morocco to a campus in China, step by step.",
        subtitle:
          "A trust-first platform in French, English and Arabic that guides Moroccan students and their families through a seven-step journey to studying in China — and turns visitors into applications and WhatsApp conversations.",
        tags: ["Client project", "FR · EN · AR + RTL", "Lighthouse 96 mobile"],
        status: "Client project · Live",
        role: "Full-stack developer — design, build and launch for a study-abroad agency",
        problem:
          "Families needed clarity and trust around studying abroad in China. Language and cultural distance created friction; reassurance was missing.",
        built:
          "Trilingual site (French, English, Arabic with right-to-left layout), a seven-step journey, two pricing packs, an application form with server-side validation and spam protection, an admin area to manage applications, and WhatsApp lead capture.",
      },
      fr: {
        meaning: "Du Maroc à un campus en Chine, étape par étape.",
        subtitle:
          "Une plateforme en français, anglais et arabe qui rassure les étudiants marocains et leurs familles, les guide en sept étapes vers les études en Chine — et transforme les visites en candidatures et en conversations WhatsApp.",
        tags: ["Projet client", "FR · EN · AR + RTL", "Lighthouse 96 mobile"],
        status: "Projet client · En ligne",
        role: "Développeur full-stack — conception, développement et lancement pour une agence d'études à l'étranger",
        problem:
          "Les familles avaient besoin de clarté et de confiance avant d'envoyer leur enfant étudier en Chine. La langue et la distance créaient des doutes ; rien ne les rassurait.",
        built:
          "Un site trilingue (français, anglais, arabe de droite à gauche), un parcours en sept étapes, deux formules tarifaires, un formulaire de candidature validé côté serveur et protégé contre le spam, un espace admin pour gérer les candidatures, et la prise de contact WhatsApp.",
      },
    },
  },
  {
    id: "ficam",
    index: "02",
    title: "FICAM Festival Platform",
    year: "2024",
    slug: "ficam",
    brand: {
      accent: "#e879f9",
      accentSoft: "rgba(168,85,247,0.18)",
      background:
        "radial-gradient(ellipse at 28% 42%, rgba(168,85,247,0.24), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(219,39,119,0.14), transparent 50%), linear-gradient(180deg, #0d0618 0%, #07040f 100%)",
      ink: "#f5e9ff",
    },
    href: "https://ficam-festival-final.vercel.app",
    sourceHref: "https://github.com/kachaniabdellah86/ficam-festival-app",
    stack: ["Next.js", "TypeScript", "Supabase (PostgreSQL)", "Realtime"],
    text: {
      en: {
        meaning: "Vivez le cinéma — in your pocket.",
        subtitle:
          "The official companion app for the FICAM film festival: student registration, QR-code session validation, gamified progression and live rewards.",
        tags: ["Next.js", "Supabase", "Full-Stack"],
        status: "Live product",
        role: "Full-stack developer",
        problem:
          "Festival organizers needed to engage student participants, track attendance, validate screenings and reward engagement across multiple sessions.",
        built:
          "Registration and authentication. QR scanning for session validation. Gamified progression with badges and level unlocks. Real-time reward accumulation.",
      },
      fr: {
        meaning: "Vivez le cinéma — dans votre poche.",
        subtitle:
          "L'application officielle du festival de cinéma FICAM : inscription des étudiants, validation des séances par QR code, progression ludique et récompenses en direct.",
        tags: ["Next.js", "Supabase", "Full-stack"],
        status: "En production",
        role: "Développeur full-stack",
        problem:
          "Les organisateurs devaient mobiliser les étudiants, suivre la présence, valider les projections et récompenser la participation sur plusieurs séances.",
        built:
          "Inscription et authentification. Scan QR pour valider les séances. Progression avec badges et niveaux. Points de récompense en temps réel.",
      },
    },
  },
  {
    id: "kachanios",
    index: "03",
    title: "KachaniOS",
    year: "2026",
    brand: {
      accent: "#7fa5ff",
      accentSoft: "rgba(91,143,255,0.16)",
      background:
        "radial-gradient(ellipse at 72% 28%, rgba(91,143,255,0.2), transparent 55%), linear-gradient(180deg, #060b1c 0%, #04070f 100%)",
      ink: "#e6edff",
    },
    stack: ["React 19", "TypeScript", "SVG / Canvas", "Motion"],
    text: {
      en: {
        meaning: "The interface that thinks.",
        subtitle:
          "An operating system for a self-evolving AI agent — routing, memory and verification made visible so people can read what the machine is thinking.",
        tags: ["AI Interfaces", "Product UX", "Desktop OS"],
        status: "Concept · Interactive prototype",
        role: "Designer & developer",
        problem:
          "Autonomous agents operate as black boxes. Making invisible computation visible requires interfaces where thought becomes nodes, memory becomes structure, and complexity becomes clarity.",
        built:
          "Interactive graph of multi-agent routing. Real-time task pipeline with typed orchestration. Simulated telemetry that shows the architecture without exposing private context.",
      },
      fr: {
        meaning: "L'interface qui pense.",
        subtitle:
          "Un système d'exploitation pour un agent IA : routage, mémoire et vérification rendus visibles, pour lire ce que la machine pense.",
        tags: ["Interfaces IA", "UX produit", "OS de bureau"],
        status: "Concept · Prototype interactif",
        role: "Designer & développeur",
        problem:
          "Les agents autonomes fonctionnent comme des boîtes noires. Rendre ce calcul visible demande une interface où la pensée devient des nœuds et la complexité devient lisible.",
        built:
          "Un graphe interactif du routage multi-agents. Un pipeline de tâches en temps réel. Une télémétrie simulée qui montre l'architecture sans exposer de données privées.",
      },
    },
  },
  {
    id: "aura",
    index: "04",
    title: "Aura Pay",
    year: "2026",
    brand: {
      accent: "#a78bfa",
      accentSoft: "rgba(167,139,250,0.16)",
      background:
        "radial-gradient(ellipse at 30% 62%, rgba(167,139,250,0.2), transparent 55%), linear-gradient(180deg, #0a0812 0%, #050408 100%)",
      ink: "#efeaff",
    },
    stack: ["React 19", "TypeScript", "SVG", "Motion"],
    text: {
      en: {
        meaning: "Digital money with physical weight.",
        subtitle:
          "A spatial finance concept: a titanium card, biometric settlement in one gesture, and yield that routes itself — trust you can feel.",
        tags: ["FinTech Concept", "Spatial UI", "Product Design"],
        status: "Concept · Interactive prototype",
        role: "Product designer",
        problem:
          "Digital finance feels weightless. How do you make trust tactile and make an instant transaction feel intentional?",
        built:
          "Interactive prototype of a spatial finance interface: a physical-feeling card, biometric settlement flow, dynamic currency switching and a spending model.",
      },
      fr: {
        meaning: "L'argent numérique, avec un vrai poids.",
        subtitle:
          "Un concept de finance spatiale : une carte en titane, un paiement biométrique en un geste, et une épargne qui s'oriente seule — une confiance qui se ressent.",
        tags: ["Concept fintech", "UI spatiale", "Design produit"],
        status: "Concept · Prototype interactif",
        role: "Designer produit",
        problem:
          "La finance numérique semble sans poids. Comment rendre la confiance tangible et donner de l'intention à une transaction instantanée ?",
        built:
          "Un prototype interactif : une carte qui semble physique, un paiement biométrique, le changement de devise et un modèle de dépenses.",
      },
    },
  },
];

export function getProjects(lang: Locale): Project[] {
  return PROJECTS.map(({ text, stack, ...project }) => {
    const t = text[lang];
    return {
      ...project,
      meaning: t.meaning,
      subtitle: t.subtitle,
      tags: t.tags,
      status: t.status,
      details: { role: t.role, problem: t.problem, built: t.built, stack },
    };
  });
}
