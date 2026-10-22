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
  /** Search snippet: ~150 characters, stands alone. */
  seoDescription: string;
  subtitle: string;
  tags: string[];
  status: string;
  role: string;
  problem: string;
  built: string;
};

export type CaseStudy = {
  context: string;
  results: { value: string; label: string }[];
};

type Preview = { src: string; width: number; height: number; alt: Record<Locale, string> };

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
  preview?: Preview;
  study?: Record<Locale, CaseStudy>;
};

export type Project = Omit<ProjectSource, "text" | "stack" | "preview" | "study"> & {
  seoDescription: string;
  preview?: { src: string; width: number; height: number; alt: string };
  study?: CaseStudy;
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
    preview: {
      src: "/media/yallachina-preview.webp",
      width: 2560,
      height: 1600,
      alt: {
        en: "Yalla China home page: studying in China with guidance that reassures the whole family",
        fr: "Page d'accueil de Yalla China : étudier en Chine avec un accompagnement qui rassure toute la famille",
      },
    },
    study: {
      en: {
        context:
          "Yalla China is a Moroccan study-abroad agency that takes students from a first conversation to their arrival on a campus in one of six Chinese cities. Its clients are students and, just as much, their parents — people deciding on a big, expensive step in a country they don't know.",
        results: [
          { value: "3", label: "Languages, with right-to-left Arabic" },
          { value: "96", label: "Lighthouse mobile score" },
          { value: "7", label: "Steps, from consultation to arrival" },
          { value: "1", label: "Admin area for every application" },
        ],
      },
      fr: {
        context:
          "Yalla China est une agence marocaine d'études à l'étranger qui accompagne les étudiants du premier échange jusqu'à leur arrivée sur un campus, dans six villes chinoises. Ses clients sont les étudiants et, tout autant, leurs parents : des familles qui prennent une décision importante et coûteuse, pour un pays qu'elles ne connaissent pas.",
        results: [
          { value: "3", label: "Langues, dont l'arabe de droite à gauche" },
          { value: "96", label: "Score Lighthouse sur mobile" },
          { value: "7", label: "Étapes, de la consultation à l'arrivée" },
          { value: "1", label: "Espace admin pour toutes les candidatures" },
        ],
      },
    },
    text: {
      en: {
        meaning: "From Morocco to a campus in China, step by step.",
        seoDescription:
          "Case study: a trilingual FR/EN/AR Next.js platform with RTL Arabic, applications and an admin area, built by Abdellah Kachani for a Moroccan agency.",
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
        seoDescription:
          "Étude de cas : plateforme Next.js trilingue (FR, EN, arabe RTL) avec candidatures, espace admin et WhatsApp, réalisée à Agadir par Abdellah Kachani.",
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
    preview: {
      src: "/media/ficam-preview.png",
      width: 1440,
      height: 900,
      alt: {
        en: "FICAM companion app home page: Vivez le Cinéma, scan, play and win rewards",
        fr: "Page d'accueil de l'application FICAM : Vivez le Cinéma, scannez, jouez et gagnez des récompenses",
      },
    },
    study: {
      en: {
        context:
          "FICAM is a film festival that welcomes student audiences across many screenings. The organizers wanted those students to come back session after session — and needed a reliable way to know who actually attended.",
        results: [
          { value: "QR", label: "Session validation at the door" },
          { value: "5", label: "Levels, from Spectateur to Palme d'or" },
          { value: "Live", label: "Points and rewards in real time" },
          { value: "30 s", label: "To register and start" },
        ],
      },
      fr: {
        context:
          "Le FICAM est un festival de cinéma qui accueille un public étudiant sur de nombreuses séances. Les organisateurs voulaient que ces étudiants reviennent séance après séance — et avaient besoin d'un moyen fiable de savoir qui était vraiment présent.",
        results: [
          { value: "QR", label: "Validation des séances à l'entrée" },
          { value: "5", label: "Niveaux, de Spectateur à Palme d'or" },
          { value: "Live", label: "Points et récompenses en temps réel" },
          { value: "30 s", label: "Pour s'inscrire et commencer" },
        ],
      },
    },
    text: {
      en: {
        meaning: "Vivez le cinéma — in your pocket.",
        seoDescription:
          "Case study: the FICAM film festival companion app — registration, QR session validation, levels and live rewards, built with Next.js and Supabase.",
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
        seoDescription:
          "Étude de cas : l'application du festival FICAM — inscription, validation des séances par QR code, niveaux et récompenses en direct (Next.js, Supabase).",
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
        seoDescription:
          "KachaniOS, an interactive concept interface that makes an AI agent's routing, memory and verification visible.",
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
        seoDescription:
          "KachaniOS, un concept d'interface interactive qui rend visibles le routage, la mémoire et la vérification d'un agent IA.",
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
        seoDescription:
          "Aura Pay, a spatial fintech concept: a titanium card, one-gesture biometric payment and an interactive spending model.",
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
        seoDescription:
          "Aura Pay, un concept fintech spatial : carte en titane, paiement biométrique en un geste et modèle de dépenses interactif.",
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
  return PROJECTS.map(({ text, stack, preview, study, ...project }) => {
    const t = text[lang];
    return {
      ...project,
      preview: preview && { ...preview, alt: preview.alt[lang] },
      study: study?.[lang],
      meaning: t.meaning,
      seoDescription: t.seoDescription,
      subtitle: t.subtitle,
      tags: t.tags,
      status: t.status,
      details: { role: t.role, problem: t.problem, built: t.built, stack },
    };
  });
}

export function getProject(lang: Locale, slug: string): Project | undefined {
  return getProjects(lang).find((project) => project.slug === slug);
}

export const caseStudySlugs = PROJECTS.flatMap((project) => (project.slug ? [project.slug] : []));
