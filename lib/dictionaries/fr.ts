import type { Dictionary } from "./en";

// Français : parle aux entreprises marocaines (hôtels, agences, commerces).
export const fr: Dictionary = {
  meta: {
    title: "Abdellah Kachani — Création de sites web à Agadir",
    description:
      "Sites web bilingues FR/EN pour hôtels, agences et commerces au Maroc. Réservation WhatsApp, rapides sur mobile, livrés en 7 jours. À partir de 3 500 MAD.",
    ogTagline: "Sites web qui transforment vos visiteurs en clients — Agadir, Maroc",
  },
  nav: {
    label: "Navigation principale",
    backToTop: "Retour en haut",
    links: [
      { label: "Projets", href: "#work", phone: true },
      { label: "Offres", href: "#services", phone: true },
      { label: "FAQ", href: "#faq", phone: false },
      { label: "Contact", href: "#contact", phone: true },
    ],
    available: "Disponible — nov. 2026",
    switchLabel: "View the site in English",
  },
  journey: {
    railLabel: "Développeur web · Agadir",
    follow: "Suivez le signal",
    scrollHint: "Faites défiler ↓",
    skip: "Passer aux projets ↓",
    ariaLabel: "Parcours du portfolio au défilement",
    labels: ["Début", "Système", "Sensation", "Pont", "Suite"],
    ctaPrimary: "Discuter sur WhatsApp",
    ctaSecondary: "Voir les projets",
    whatsappMessage:
      "Bonjour Abdellah, j'ai vu votre portfolio et j'aimerais parler d'un projet de site web.",
    chapters: [
      {
        eyebrow: "Abdellah Kachani / Développeur web · Agadir, Maroc",
        title: "Votre site,\nvotre meilleur\n*vendeur.*",
        description:
          "Sites web bilingues pour hôtels, agences et commerces au Maroc : réservation WhatsApp, rapides sur mobile, livrés en 7 jours.",
      },
      {
        eyebrow: "Chapitre 01 / KachaniOS — Concept · Le système",
        title: "L'interface a appris\nà *penser.*",
        description:
          "Un concept d'OS pour agent IA : chaque pensée devient un nœud, la mémoire devient une structure, et la complexité devient lisible.",
      },
      {
        eyebrow: "Chapitre 02 / Aura Pay — Concept · La sensation",
        title: "L'argent numérique\ntrouve un *poids.*",
        description:
          "Un concept fintech : surfaces en titane, données spatiales et biométrie, pour que la confiance se ressente sans faire de bruit.",
      },
      {
        eyebrow: "Chapitre 03 / Yalla China — Projet client · Le pont",
        title: "Le design a franchi\nla langue et le *doute.*",
        description:
          "Un site en français, anglais et arabe qui guide les familles marocaines vers les études en Chine — et transforme les visites en candidatures et en conversations WhatsApp.",
      },
      {
        eyebrow: "Chapitre 04 / La suite",
        title: "Le prochain chapitre,\nc'est *votre projet.*",
        description:
          "Continuez pour voir les projets, les offres et la façon dont on travaille ensemble.",
      },
    ],
  },
  marquee: {
    rowA: [
      "Sites vitrines",
      "Réservation WhatsApp",
      "Sites bilingues",
      "SEO local",
      "Applications web",
      "Animation & 3D",
    ],
    rowB: [
      "React / Next.js",
      "Three.js / WebGL",
      "TypeScript",
      "Supabase / Prisma",
      "Google Business Profile",
      "FR · EN · AR",
    ],
  },
  work: {
    label: "Projets",
    edge: "Projets — 2024 / 2026",
    heading: "Des projets ~livrés,~\ndes résultats qui *durent.*",
    intro:
      "Deux projets en production, deux concepts. Chacun garde son identité ici — et chacun est interactif.",
    visit: "Voir le site en ligne",
    source: "Code source",
    readStory: "Lire l'histoire",
    hideStory: "Masquer l'histoire",
    caseStudy: "Étude de cas complète",
    role: "Mon rôle",
    stack: "Technologies",
    problem: "Le problème",
    built: "Ce que j'ai construit",
  },
  lab: {
    label: "Labo",
    edge: "Labo — Expériences",
    ariaLabel: "Labo visuel",
    heading: "~Fragments~ du\n*labo.*",
    intro:
      "Cinq petites expériences sur la façon dont une interface doit se ressentir : typographie, signal, physique, couleurs et geste. Toutes sont interactives. Touchez-les.",
    scrollHint: "Faites défiler — le mur glisse de côté",
    fragment: "Fragment",
    tablist: "Fragments du labo",
    previous: "Fragment précédent",
    next: "Fragment suivant",
    slides: [
      {
        title: "Typo variable",
        tag: "Le poids de chaque lettre suit votre doigt, de 100 à 900 sur un seul axe.",
        gesture: "Glissez",
      },
      {
        title: "Champ de signal",
        tag: "Un canvas de lignes de signal qui se plie au toucher et transporte des impulsions.",
        gesture: "Touchez · glissez",
      },
      {
        title: "Physique de ressort",
        tag: "Un vrai ressort amorti. Lancez-le, changez son caractère, observez l'amortissement.",
        gesture: "Tirez & lancez",
      },
      {
        title: "Design tokens",
        tag: "Un seul token de teinte change tout un composant, avec le contraste vérifié en direct.",
        gesture: "Tournez la teinte",
      },
      {
        title: "Glisser pour payer",
        tag: "Un geste de paiement avec résistance, retour élastique et confirmation haptique.",
        gesture: "Glissez à droite",
      },
    ],
  },
  services: {
    label: "Offres",
    edge: "Offres & tarifs",
    heading: "Trois offres,\nun prix *clair.*",
    intro:
      "Des forfaits simples et un devis fixe avant de commencer. Pas de surprise, pas d'intermédiaire.",
    featuredBadge: "Le plus demandé",
    cta: "Demander ce forfait",
    ctaMessage: "Bonjour Abdellah, je suis intéressé(e) par le forfait {name}.",
    packages: [
      {
        name: "Vitrine",
        priceFrom: "à partir de", amount: "3 500", currency: "MAD",
        pitch: "Pour exister sérieusement sur Google et sur WhatsApp.",
        features: [
          "1 à 5 pages, en français et en anglais",
          "Boutons et liens WhatsApp",
          "Fiche Google Business Profile",
          "Rapide sur mobile",
          "Livré en 7 jours",
        ],
        featured: false,
      },
      {
        name: "Business",
        priceFrom: "à partir de", amount: "6 500", currency: "MAD",
        pitch: "Tout le forfait Vitrine, plus de quoi recevoir des réservations et des demandes — pas seulement des visites.",
        features: [
          "Formulaire de réservation ou de demande",
          "Pages offres et tarifs",
          "Espace admin pour suivre vos demandes",
          "SEO local (Agadir, Taghazout…)",
        ],
        featured: true,
      },
      {
        name: "Sur-mesure",
        priceFrom: "à partir de", amount: "12 000", currency: "MAD",
        pitch: "Pour une plateforme, une application ou une expérience 3D qui marque.",
        features: [
          "Application web ou plateforme",
          "Animations et 3D sur mesure",
          "Arabe avec mise en page de droite à gauche",
          "Intégrations : paiement, CRM, API",
        ],
        featured: false,
      },
    ],
    notes: [
      "Maintenance : 300–500 MAD / mois (mises à jour, sauvegardes, modifications).",
      "Paiement : 50 % à la commande, 50 % à la mise en ligne.",
    ],
  },
  process: {
    label: "Méthode",
    heading: "De l'appel au lancement\nen *7 jours.*",
    intro:
      "Un seul interlocuteur du premier message à la mise en ligne. Voici comment se passe un site vitrine.",
    steps: [
      {
        title: "Appel découverte",
        time: "Jour 1",
        text: "15 minutes sur WhatsApp pour comprendre votre activité, vos clients et ce que le site doit vous rapporter.",
      },
      {
        title: "Maquette",
        time: "Jours 2–3",
        text: "Une première version visuelle de la page d'accueil. Vous validez avant que je code.",
      },
      {
        title: "Développement",
        time: "Jours 3–6",
        text: "Le site complet, en français et en anglais, rapide sur mobile, avec vos boutons WhatsApp et vos formulaires.",
      },
      {
        title: "Mise en ligne",
        time: "Jour 7",
        text: "Nom de domaine, fiche Google, et 30 minutes pour vous montrer comment tout fonctionne. Le site est à vous.",
      },
    ],
  },
  testimonial: {
    label: "Ils en parlent",
    // Laissé vide exprès : le bloc ne s'affiche qu'avec un vrai témoignage.
    quote: "",
    author: "",
    role: "",
  },
  about: {
    label: "À propos",
    heading: "Un ingénieur qui\nconstruit votre *vitrine.*",
    paragraphs: [
      "Je suis Abdellah Kachani, développeur web freelance à Agadir et élève-ingénieur en informatique (3e année, Polytechnique Agadir).",
      "Je conçois et je code moi-même chaque site : pas d'agence, pas d'intermédiaire, un seul interlocuteur du premier appel à la mise en ligne. J'ai livré une plateforme trilingue pour une agence d'études à l'étranger et l'application d'un festival de cinéma — et je crée des expériences 3D que peu d'agences au Maroc proposent.",
    ],
    interestsLabel: "Ce que je fais",
    interests: [
      "Sites vitrines",
      "Réservation WhatsApp",
      "Sites FR · EN · AR",
      "Applications web",
      "Animation & 3D",
    ],
    connectLabel: "Me contacter",
  },
  faq: {
    label: "Questions fréquentes",
    heading: "Vos questions,\nmes *réponses.*",
    moreTitle: "Une autre question ?",
    moreText: "Posez-la directement, je réponds moi-même.",
    moreCta: "Demander sur WhatsApp",
    moreMessage: "Bonjour Abdellah, j'ai une question sur la création de mon site.",
    items: [
      {
        q: "Combien coûte un site ?",
        a: "Un site vitrine commence à 3 500 MAD. Le prix final dépend du nombre de pages, des langues et des fonctionnalités ; vous recevez un devis fixe avant de commencer.",
      },
      {
        q: "Combien de temps ça prend ?",
        a: "7 jours pour un site vitrine, une fois vos textes et photos reçus. Comptez 2 à 4 semaines pour un site Business ou sur-mesure.",
      },
      {
        q: "Comment se passe le paiement ?",
        a: "50 % à la commande, 50 % à la mise en ligne. Rien n'est payé avant que vous ayez validé le devis.",
      },
      {
        q: "Et le nom de domaine, l'hébergement ?",
        a: "Je m'occupe de tout. Le nom de domaine est enregistré à votre nom ; seul son renouvellement annuel reste à votre charge.",
      },
      {
        q: "Je pourrai modifier mon site après ?",
        a: "Oui. Les petites modifications du premier mois sont offertes. Ensuite, la maintenance (300–500 MAD / mois) couvre mises à jour, sauvegardes et changements de contenu.",
      },
      {
        q: "Vous faites aussi les sites en arabe ?",
        a: "Oui, avec une vraie mise en page de droite à gauche. Le site Yalla China fonctionne en français, en anglais et en arabe.",
      },
    ],
  },
  stats: {
    ariaLabel: "En chiffres",
    items: [
      { value: 7, suffix: "", label: "Jours pour livrer un site vitrine" },
      { value: 3, suffix: "", label: "Langues livrées — FR · EN · AR" },
      { value: 96, suffix: "/100", label: "Score Lighthouse mobile, site client" },
    ],
  },
  contact: {
    label: "Contact",
    heading: "Parlons de\nvotre *projet.*",
    emailAria: "Écrire un e-mail à Abdellah Kachani",
    whatsapp: "Écrire sur WhatsApp",
    copy: "Copier",
    copied: "Copié ✓",
    retry: "Réessayer",
    brief: {
      title: "Votre demande, en une phrase",
      intro: "Touchez les mots soulignés pour les changer. WhatsApp s'ouvre avec le message déjà écrit.",
      greeting: "Bonjour Abdellah, j'ai vu votre portfolio.",
      sentence: "Je veux {type}, avec un budget de {budget}, à livrer {deadline}.",
      typeLabel: "Type de projet",
      types: [
        "un site vitrine",
        "un système de réservation",
        "une boutique en ligne",
        "une application web",
        "autre chose",
      ],
      budgetLabel: "Budget",
      budgets: ["moins de 5 000 MAD", "5 000 – 10 000 MAD", "10 000 – 20 000 MAD", "plus de 20 000 MAD"],
      deadlineLabel: "Délai",
      deadlines: ["au plus vite", "ce mois-ci", "sans urgence"],
      previewLabel: "Aperçu du message",
      previewName: "Abdellah Kachani",
      previewStatus: "Développeur web · Agadir",
      send: "Envoyer sur WhatsApp",
    },
  },
  floating: {
    whatsapp: "WhatsApp",
  },
  caseStudy: {
    back: "Tous les projets",
    eyebrow: "Étude de cas",
    role: "Rôle",
    stack: "Technologies",
    year: "Année",
    live: "Site en ligne",
    visit: "Visiter",
    context: "Le contexte",
    problem: "Le problème",
    built: "Ce que j'ai construit",
    results: "Le résultat",
    similarTitle: "Un projet similaire ?",
    similarText: "Dites-moi ce que vous voulez construire. Je vous réponds sur WhatsApp avec une première idée et une fourchette de prix.",
    similarCta: "Discuter sur WhatsApp",
    similarMessage: "Bonjour Abdellah, j'ai lu l'étude de cas {title} et j'ai un projet similaire.",
    next: "Étude de cas suivante :",
  },
};
