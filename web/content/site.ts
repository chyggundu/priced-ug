/**
 * Single source of truth for every piece of copy and every outbound link on the
 * site. Edit this file to change the website — the page components read from it
 * and should not need touching.
 */

export const site = {
  name: "Priced Ug",
  tagline: "Uganda's local business directory & marketplace",
  description:
    "Browse Ugandan businesses by category, see every product with its real price in UGX, and call the owner in one tap. Free to browse — no sign-in needed.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pricedug.com",
} as const;

/**
 * TODO(priced-ug): fill these in before launch.
 *
 * `appStore` and `playStore`: set to the live listing URLs. While either is left
 * empty its download button renders as a disabled "Coming soon" chip instead of a
 * dead link — so it is safe to ship with them blank.
 *
 * `whatsapp`: full international format, digits only, no `+` (e.g. 256700000000).
 */
export const links = {
  appStore: "",
  playStore: "",
  /** Taken from the Contact section of the published privacy policy. */
  email: "priceduganda@gmail.com",
  whatsapp: "",
  phone: "",
} as const;

export const brand = {
  /** Matches the mobile app's palette (artifacts/pricedug/constants/colors.ts). */
  primary: "#E01E37",
} as const;

/** The three groups the app is built for, as described by the product brief. */
export const audiences = [
  {
    id: "public",
    title: "For everyone",
    badge: "No sign-in needed",
    summary:
      "Anyone can open the app and start browsing straight away. No account, no barrier.",
    points: [
      {
        title: "Browse businesses",
        body: "A grid of business pages you can filter by category — food, clothing, electronics and more — or search by name.",
      },
      {
        title: "View a business page",
        body: "Banner photo, description, address and a full product list. Every product shows its photo, price in UGX, size and materials.",
      },
      {
        title: "Contact instantly",
        body: "Call buttons are everywhere, so you can reach a business or place an order in a single tap.",
      },
      {
        title: "Read reviews",
        body: "See ratings and comments left by other customers before you buy.",
      },
    ],
  },
  {
    id: "owners",
    title: "For business owners",
    badge: "Sign in required",
    summary:
      "Your shop, your page. Everything you need to get found and take orders.",
    points: [
      {
        title: "Create your business page",
        body: "Every owner gets exactly one page that they fully control, from banner to address.",
      },
      {
        title: "Manage products",
        body: "Add, edit and delete products with photos, prices, descriptions, sizes and materials.",
      },
      {
        title: "Reply to reviews",
        body: "Respond once to each customer review, so buyers hear your side too.",
      },
      {
        title: "Look up customers for delivery",
        body: "Enter a customer's number and district to pull up their saved delivery details — address, a map pin, and the address photo of the house, gate or landmark. Message them, or share and copy the location.",
      },
    ],
  },
  {
    id: "customers",
    title: "For customers",
    badge: "Sign-in optional",
    summary:
      "Set your delivery details once, and every business you order from already knows how to find you.",
    points: [
      {
        title: "Save a delivery profile",
        body: "Name, phone, district, street, a map location and an address photo — stored once, ready for every order.",
      },
      {
        title: "Be found first time",
        body: "When you order, the business already has everything it needs to reach your door. No long directions over the phone.",
      },
      {
        title: "Leave reviews",
        body: "One review per business, with a 1–5 star rating and an optional comment.",
      },
    ],
  },
] as const;

export const features = [
  {
    title: "Real prices in UGX",
    body: "Every product lists its actual price. No guessing, no asking, no back-and-forth before you know what something costs.",
  },
  {
    title: "Filter by category",
    body: "Food, clothing, electronics, beddings, boda boda parts, bookshops and more — narrow the grid to what you actually need.",
  },
  {
    title: "Search by name",
    body: "Know the shop already? Type the name and go straight to its page.",
  },
  {
    title: "One-tap contact",
    body: "Call buttons throughout the app connect you to the business immediately.",
  },
  {
    title: "Ratings & reviews",
    body: "Honest 1–5 star reviews from real customers, with owner replies for balance.",
  },
  {
    title: "Delivery made simple",
    body: "Saved delivery profiles carry a map pin and an address photo, so drivers find the right gate the first time.",
  },
] as const;

export const screenshots = [
  {
    src: "/screenshots/browse.png",
    alt: "Browsing local products and prices in the Priced Ug app",
    caption: "Browse and filter every listing by category, location and price.",
  },
  {
    src: "/screenshots/business.png",
    alt: "A Priced Ug business page showing products with prices",
    caption: "Each business page carries its full product list and a call button.",
  },
  {
    src: "/screenshots/account.png",
    alt: "The Priced Ug account screen",
    caption: "Manage your account, delivery profile and business page.",
  },
  {
    src: "/screenshots/signin.png",
    alt: "Signing in to Priced Ug",
    caption: "Sign in only when you want to sell, review or save a delivery profile.",
  },
] as const;

export type TeamMember = {
  name: string;
  role: string;
  /** Post-nominals / academic titles, rendered under the name. */
  credentials?: string;
  linkedin?: string;
  /**
   * Path to a portrait under `public/`, e.g. "/team/tomasi-kiggundu.jpg".
   * Falls back to a brand-coloured initials tile when omitted.
   */
  photo?: string;
  /** Short line used as the card's lead-in. */
  lead: string;
  /** Full bio, one string per paragraph. */
  bio: string[];
  /** Rendered as chips. Keep to skills the person actually lists. */
  skills?: string[];
  education?: { school: string; detail: string }[];
};

export const team: TeamMember[] = [
  {
    name: "Tomasi Kiggundu",
    role: "Chief Executive Officer",
    photo: "/team/tomasi-kiggundu.jpg",
    lead: "A logistics and operations professional with an international background spanning Europe, Africa and the United States.",
    bio: [
      "Tomasi studied Logistics at Nova College in Haarlem, North Holland, where he built a strong foundation in supply chain management, operations and business logistics.",
      "Throughout his career he has gained hands-on experience in logistics coordination, operations management, media and entrepreneurship. He previously worked with GTV Uganda, and later served as a Junior Operations Manager (Logistics) at International Bike Group in Amsterdam, where he supported day-to-day operational planning and logistics processes. He also worked as a Logistical Clerk at AP Logistics in Amsterdam Sloterdijk, managing inventory, shipment coordination and warehouse operations.",
      "Today he is co-owner of East African Tacos in Los Angeles, where he combines operational expertise with a passion for business, customer service, and bringing authentic East African flavours to the community.",
      "His diverse international experience has strengthened his ability to adapt, solve complex operational challenges, and build businesses that prioritise efficiency, innovation and customer satisfaction. He is passionate about entrepreneurship, logistics, and creating opportunities that connect people, businesses and communities across borders.",
    ],
    skills: [
      "Supply chain management",
      "Operations management",
      "Logistics coordination",
      "Inventory & warehouse operations",
      "Entrepreneurship",
      "Customer service",
    ],
    education: [
      { school: "Nova College, Haarlem", detail: "Logistics — North Holland, Netherlands" },
    ],
  },
  {
    // Written from Resty's own LinkedIn profile. Skills are only the ones she
    // actually lists there — six more are hidden behind LinkedIn's "+6 skills",
    // so they are deliberately not guessed at. Degree classifications are on her
    // profile but omitted here; add them if she wants them shown.
    name: "Resty Babirye",
    role: "Business Development Manager",
    photo: "/team/resty-babirye.jpg",
    credentials: "MBA-IB, BA (SS), Dip-Ed",
    linkedin:
      "https://www.linkedin.com/in/resty-babirye-mba-ib-ba-ss-dip-ed-b0a385211",
    lead: "A results-driven sales and business development professional with over 10 years' experience in Pay-TV sales, the consumer sector and telecommunications.",
    bio: [
      "Resty has a proven ability to execute market growth strategies, build and manage cross-functional high-performing teams, strengthen client relationships, and drive consistent sales results through structured coaching, delegation, quality compliance oversight and data-driven decision-making. She streamlines processes and delivers projects on time and within budget.",
      "Since April 2018 she has been Territory Sales Manager at MultiChoice Group in Uganda, covering territory development and customer service management across her patch. Before that she spent three years as Retail Sales Manager at GOtv Uganda, from 2015 to 2018, growing the retail channel.",
      "Based in Kampala, she leads business development at Priced Ug — bringing Ugandan businesses onto the platform and helping them get the most out of it.",
    ],
    skills: [
      "Territory development",
      "Customer service management",
      "Business-to-Business (B2B)",
      "People management",
    ],
    education: [
      {
        school: "Amity University",
        detail: "Master of Business Administration (MBA) — International Business, 2014–2016",
      },
      {
        school: "Makerere University",
        detail: "Bachelor of Arts (BA) — Social Sciences, 2010–2014",
      },
      {
        school: "Kyambogo University",
        detail: "Diploma of Education — Secondary Education and Teaching",
      },
    ],
  },
];
