export type Project = {
  slug: string;
  number: string;
  title: string;
  category: string;
  year: string;
  client: string;
  role: string;
  duration: string;
  tools: string[];
  hero: {
    type: 'video' | 'image';
    src: string;
    poster?: string;
  };
  excerpt: string;
  context: string;
  challenge: string;
  process: ProcessStep[];
  outcome: string;
  liveUrl?: string;
};

export type ProcessStep = {
  number: string;
  title: string;
  body: string;
  media?: { type: 'image' | 'video'; src: string; caption?: string }[];
};

export const projects: Project[] = [
  {
    slug: 'acro',
    number: '001',
    title: 'Acro Automation Systems',
    category: '3D / Motion',
    year: '2024',
    client: 'Acro Automation Systems · Milwaukee',
    role: 'Lead 3D Designer (Freelance)',
    duration: '5 months',
    tools: ['Rhino', 'Maya'],
    hero: {
      type: 'video',
      src: '/videos/acro-final.mp4',
      poster: '/images/acro-poster.jpg',
    },
    excerpt:
      'Hero animation for an 80-year-old Milwaukee robotics company, recreating a system they actually built.',
    context:
      "Founded in 1936 in Milwaukee, Acro Automation Systems is a family-owned company that designs and installs robotic automation lines for the automotive, electronics, and medical industries. As a certified FANUC system integrator, they've spent over 80 years quietly building the systems that move American manufacturing.\n\nIn 2024, Acro commissioned a hero animation for their new website. Not a generic demo — a visual recreation of a system they had actually programmed and installed, intended to show that an 80-year-old company still operates at the front of its industry.",
    challenge:
      'The brief was short — "An animation that represents the website. Precise keyframes, strong visuals."\n\nBut there was a difficult balance buried inside it. Acro\'s engineers needed technical precision — how a real FANUC arm moves through a real cycle, because that accuracy is what their reputation is built on. Marketing needed visual appeal — a prospective customer, often not an engineer, had to feel "this company is good at what they do" within the first second of landing on the page.\n\nToo accurate, it gets boring. Too cinematic, it stops feeling real. Holding both at once was the actual project.',
    process: [
      {
        number: '01',
        title: 'Modeling in Rhino',
        body: 'Working from the technical drawings of an actual cell Acro had programmed, I rebuilt the FANUC arm, conveyor lines, and pickup station in Rhino — keeping proportions and component detail true to the industrial spec.',
        media: [
          { type: 'image', src: '/images/acro-rhino-wireframe.png', caption: 'Rhino wireframe' },
          { type: 'image', src: '/images/acro-rhino-solid.png', caption: 'Rhino solid model' },
        ],
      },
      {
        number: '02',
        title: 'Lighting & Environment in Maya',
        body: "The Rhino model was brought into Maya, where the work shifted to lighting, materials, camera language, and motion. Camera angle, background tone, and key lights were all dialed in across recurring meetings with Acro's team — small decisions stacked up over weeks. Camera one degree higher. Background gray one step lighter.",
        media: [
          { type: 'image', src: '/images/acro-maya-render.jpg', caption: 'Maya rendering view' },
        ],
      },
      {
        number: '03',
        title: 'Animation & Keyframing',
        body: "The motion was hand-keyed across 155 frames at 60fps, mapping the arm's pick-and-place cycle to the rhythm a viewer would actually watch on a homepage — fast enough to feel alive, slow enough to read.",
        media: [
          { type: 'image', src: '/images/acro-maya-timeline.jpg', caption: 'Maya animation timeline' },
        ],
      },
      {
        number: '04',
        title: 'The white background decision',
        body: "The white background was a deliberate choice, not a default. Acro's new site was being built on a white base, and the animation needed to live inside the page rather than sit on top of it like a pasted-in GIF. Darker treatments and subtle gradients were tested, but the white version held the page's tone the strongest — and made the arm's yellow do all the visual work.",
      },
      {
        number: '05',
        title: 'Multiple angles, multiple versions',
        body: "Beyond the final, several alternate camera angles and motion variations were rendered. This gave Acro's team something to compare directly, rather than approve in the abstract — which made the final decision a much shorter conversation.",
      },
    ],
    outcome:
      "The animation now lives as the hero of acro.com, the first thing every visitor sees.\n\nAcro's response was direct — they said the new site felt distinctly more forward-looking than the previous one, and that the animation was central to that shift. An 80-year-old family company, communicating in one second that it's still building what comes next.",
    liveUrl: 'https://www.acro.com',
  },
  {
    slug: 'soban',
    number: '002',
    title: 'Soban Korean Eatery',
    category: 'Brand & Menu System',
    year: '2025',
    client: 'Soban Korean Eatery · Hales Corners + Milwaukee',
    role: 'Designer (sole)',
    duration: '1 week',
    tools: ['InDesign', 'Illustrator'],
    hero: {
      type: 'image',
      src: '/images/soban-after-hero.jpg',
    },
    excerpt:
      'A menu system redesign for a fast-casual Korean restaurant — keeping every piece of information, halving the visual noise.',
    context:
      "Soban is a fast-casual Korean restaurant that opened in Hales Corners and recently expanded to a second location in downtown Milwaukee. The brand is run by Solki (owner) and Hyelim (CFO) — both deeply involved in shaping how the restaurant looks, reads, and feels to first-time guests.\n\nIn 2025, Soban commissioned a redesign of their menu system across both locations. The goal was not a full rebrand, but a sharpening — keeping every piece of information the customer already relied on, while replacing the visual language with something quieter, cleaner, and easier to scan.",
    challenge:
      "The existing menu boards leaned playful — bright greens, bold strokes, expressive typography. It worked when Soban was a single location, but as the brand grew it started to feel out of step with where the restaurant was going.\n\nSolki and Hyelim asked for something modern, simple, and highly legible — using as few colors as possible, with generous whitespace, but without losing a single piece of information from the existing boards.\n\nThat last constraint was the real challenge. The old boards were dense — six signature dishes with photos and descriptions, a build-your-own section with three steps, soup, beverages, sides, prices, dietary icons, modifiers. All of it had to fit in roughly the same physical space, but feel half as crowded.",
    process: [
      {
        number: '01',
        title: 'A clear brief, before any design',
        body: "Solki and Hyelim came in with a sharp direction and a set of reference images they liked — minimalist menu systems with strong type hierarchy and lots of breathing room. That made the early decisions easier than they usually are: black and white as the base, photography doing the color work, numbered structure replacing the old icon-heavy navigation.",
      },
      {
        number: '02',
        title: 'Inventory before layout',
        body: "Before opening InDesign, every piece of text, every price, every icon from the old menu was pulled into a single document. Nothing could be cut without sign-off, so the first job was just understanding exactly what the customer needed to see.",
        media: [
          { type: 'image', src: '/images/soban-before.jpg', caption: 'Before — original menu boards' },
        ],
      },
      {
        number: '03',
        title: 'Hierarchy doing the work',
        body: "The hardest part was fitting the old menu's information into a layout that felt twice as spacious. This came down to typographic hierarchy — pulling section headers into solid black blocks (SIGNATURE, SOUP, BEVERAGE), letting dish names breathe at a larger size, and demoting descriptions to a quiet secondary weight. Every element earned its size by its importance to a customer in line.",
        media: [
          { type: 'image', src: '/images/soban-after-hero.jpg', caption: 'After — Hales Corners' },
        ],
      },
      {
        number: '04',
        title: 'Two locations, one system',
        body: "The Hales Corners and downtown Milwaukee boards share the same system but adapt to slightly different physical contexts — different ceiling heights, different lighting, different total panel widths. The grid stretches and contracts cleanly across both.",
        media: [
          { type: 'image', src: '/images/soban-after-downtown.jpg', caption: 'After — Milwaukee Downtown' },
        ],
      },
    ],
    outcome:
      "The redesigned menu boards are now in use at both Soban locations. Solki reported that the space felt visibly cleaner after install, and that staff preferred working under the new boards.\n\nFor me, this project sat exactly where I want my work to live — using minimalism not as a style, but as a tool to let the most important information speak first. It became a clear reference for what I'm trying to do across the rest of my practice.",
  },
  {
    slug: 'out-of-plane',
    number: '003',
    title: 'Out of Plane',
    category: 'Parametric / Installation',
    year: '2026',
    client: 'DFD Capstone · UWM (University of Wisconsin–Milwaukee)',
    role: 'Designer & Fabricator (sole)',
    duration: 'Capstone semester',
    tools: ['Rhino', 'Grasshopper', '3D printing', 'Hand finishing'],
    hero: {
      type: 'image',
      src: '/images/oop-gallery.jpg',
    },
    excerpt:
      'A 9 × 6 ft parametric Voronoi installation — the most random pattern, made through perfect planning.',
    context:
      "Out of Plane is the capstone project for my DFD (Digital Fabrication and Design) certificate at UWM (University of Wisconsin–Milwaukee) — a 9 × 6 ft wall-mounted installation built from a parametric Voronoi field, generated in Grasshopper and fabricated through 3D-printed PLA and PLA-CF joints connected by 3/4-inch wood dowels.\n\nThe project sits between three things at once: a study in computational geometry, a fabrication exercise, and a finished sculptural object. The title — Out of Plane — points at what the work is doing: a flat, mathematically generated network pulled off the wall into physical space, every node and edge made by hand.",
    challenge:
      "The brief I set for myself was simple but uncomfortable: take on the most complex challenge the program had to offer, and see if I could land it.\n\nThe thesis behind the form was a single sentence — the most random pattern, made through perfect planning. A Voronoi tessellation looks chaotic at a glance: no two cells the same, no obvious grid. But every cell, every edge, every joint has to be parametrically defined, individually labeled, and physically fabricated to assemble at full scale. The randomness on the surface is held together by complete control underneath.\n\nThe hard part was never the geometry. It was managing the gap between digital and physical at scale.",
    process: [
      {
        number: '01',
        title: 'Generating the field in Grasshopper',
        body: "The Voronoi was built in Grasshopper from a small but deliberate definition: a 9 × 6 ft Rectangle as the bounding frame, Pop2D to scatter seed points across it, Voronoi to tessellate the cells, then Explode and dupln to break the cells into individual edges and joint locations.\n\nTwo parameters drove the entire system — cell density (Count in Pop2D) and edge thickness. The whole field could be re-generated with two sliders, which meant I could test density and weight against each other dozens of times before committing to a single seed.",
        media: [
          { type: 'image', src: '/images/oop-grasshopper.jpg', caption: 'Grasshopper definition' },
        ],
      },
      {
        number: '02',
        title: 'Labeling every cell',
        body: "Once the geometry was locked, every cell and every edge had to be uniquely numbered before fabrication could begin. Without this step the wall would be impossible to assemble — there are no two identical pieces in a Voronoi.\n\nEach cell received a coordinate ID (1-1, 1-2, 2-1, etc.) so that each rod, each joint, and each connection point could be tracked from digital file to printer to finishing station to wall.",
        media: [
          { type: 'image', src: '/images/oop-labeling.jpg', caption: 'Cell labeling diagram' },
        ],
      },
      {
        number: '03',
        title: 'Printing the joints — PLA and PLA-CF',
        body: "Every node where edges meet became a custom 3D-printed joint. The body of the field used standard PLA, while the top row of hanger parts — the ones taking the entire weight of the structure — were printed in PLA-CF (carbon-fiber-reinforced PLA) for stiffness. Because every joint sits at a different angle in the field, no two joints are the same; each had to be printed as its own part.\n\nThe edges between joints are 3/4-inch wood dowels, cut to the exact length each Voronoi edge required.",
        media: [
          { type: 'image', src: '/images/oop-hangers.jpg', caption: 'PLA-CF hanger parts' },
        ],
      },
      {
        number: '04',
        title: 'The hardest part — keeping the pieces straight',
        body: "The geometry was the easy half. The hard half was the workshop.\n\nEvery printed joint had to be filed, sanded, primed, and spray-painted before assembly. With dozens of unique parts, each only distinguishable by tiny labels, the real challenge was logistical — building a system to keep parts from getting mixed up during finishing, and to assemble them efficiently on the wall in the right order.\n\nThis was the work that didn't show up in any rendering. But it was the work that decided whether the project finished on time.",
        media: [
          { type: 'image', src: '/images/oop-installed.jpg', caption: 'Installed — in-progress documentation' },
        ],
      },
      {
        number: '05',
        title: 'Installation',
        body: "The final piece was mounted on a gallery wall, suspended from a row of black anchor brackets at the top edge — letting the structure read as if it's pulled out of the surface rather than attached to it.",
      },
    ],
    outcome:
      "Out of Plane was completed and exhibited as my DFD capstone. It was my first installation work, and it landed the way it was planned — the most random pattern, made through perfect planning, end to end.",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
