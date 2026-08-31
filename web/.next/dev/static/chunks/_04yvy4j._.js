(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/content/site.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Single source of truth for every piece of copy and every outbound link on the
 * site. Edit this file to change the website — the page components read from it
 * and should not need touching.
 */ __turbopack_context__.s([
    "audiences",
    ()=>audiences,
    "brand",
    ()=>brand,
    "features",
    ()=>features,
    "links",
    ()=>links,
    "screenshots",
    ()=>screenshots,
    "site",
    ()=>site,
    "team",
    ()=>team
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const site = {
    name: "Priced Ug",
    tagline: "Uganda's local business directory & marketplace",
    description: "Browse Ugandan businesses by category, see every product with its real price in UGX, and call the owner in one tap. Free to browse — no sign-in needed.",
    url: ("TURBOPACK compile-time value", "https://pricedug.com") ?? "https://pricedug.com"
};
const links = {
    appStore: "",
    playStore: "https://play.google.com/store/apps/details?id=com.pricedug.mobile",
    /** Taken from the Contact section of the published privacy policy. */ email: "priceduganda@gmail.com",
    whatsapp: "256787298866",
    phone: ""
};
const brand = {
    /** Matches the mobile app's palette (artifacts/pricedug/constants/colors.ts). */ primary: "#E01E37"
};
const audiences = [
    {
        id: "public",
        title: "For everyone",
        badge: "No sign-in needed",
        summary: "Anyone can open the app and start browsing straight away. No account, no barrier.",
        points: [
            {
                title: "Browse businesses",
                body: "A grid of business pages you can filter by category — food, clothing, electronics and more — or search by name."
            },
            {
                title: "View a business page",
                body: "Banner photo, description, address and a full product list. Every product shows its photo, price in UGX, size and materials."
            },
            {
                title: "Contact instantly",
                body: "Call buttons are everywhere, so you can reach a business or place an order in a single tap."
            },
            {
                title: "Read reviews",
                body: "See ratings and comments left by other customers before you buy."
            }
        ]
    },
    {
        id: "owners",
        title: "For business owners",
        badge: "Sign in required",
        summary: "Your shop, your page. Everything you need to get found and take orders.",
        points: [
            {
                title: "Create your business page",
                body: "Every owner gets exactly one page that they fully control, from banner to address."
            },
            {
                title: "Manage products",
                body: "Add, edit and delete products with photos, prices, descriptions, sizes and materials."
            },
            {
                title: "Reply to reviews",
                body: "Respond once to each customer review, so buyers hear your side too."
            },
            {
                title: "Look up customers for delivery",
                body: "Enter a customer's number and district to pull up their saved delivery details — address, a map pin, and the address photo of the house, gate or landmark. Message them, or share and copy the location."
            }
        ]
    },
    {
        id: "customers",
        title: "For customers",
        badge: "Sign-in optional",
        summary: "Set your delivery details once, and every business you order from already knows how to find you.",
        points: [
            {
                title: "Save a delivery profile",
                body: "Name, phone, district, street, a map location and an address photo — stored once, ready for every order."
            },
            {
                title: "Be found first time",
                body: "When you order, the business already has everything it needs to reach your door. No long directions over the phone."
            },
            {
                title: "Leave reviews",
                body: "One review per business, with a 1–5 star rating and an optional comment."
            }
        ]
    }
];
const features = [
    {
        title: "Real prices in UGX",
        body: "Every product lists its actual price. No guessing, no asking, no back-and-forth before you know what something costs."
    },
    {
        title: "Filter by category",
        body: "Food, clothing, electronics, beddings, boda boda parts, bookshops and more — narrow the grid to what you actually need."
    },
    {
        title: "Search by name",
        body: "Know the shop already? Type the name and go straight to its page."
    },
    {
        title: "One-tap contact",
        body: "Call buttons throughout the app connect you to the business immediately."
    },
    {
        title: "Ratings & reviews",
        body: "Honest 1–5 star reviews from real customers, with owner replies for balance."
    },
    {
        title: "Delivery made simple",
        body: "Saved delivery profiles carry a map pin and an address photo, so drivers find the right gate the first time."
    }
];
const screenshots = [
    {
        src: "/screenshots/browse.png",
        alt: "Browsing local products and prices in the Priced Ug app",
        caption: "Browse and filter every listing by category, location and price."
    },
    {
        src: "/screenshots/business.png",
        alt: "A Priced Ug business page showing products with prices",
        caption: "Each business page carries its full product list and a call button."
    },
    {
        src: "/screenshots/account.png",
        alt: "The Priced Ug account screen",
        caption: "Manage your account, delivery profile and business page."
    },
    {
        src: "/screenshots/signin.png",
        alt: "Signing in to Priced Ug",
        caption: "Sign in only when you want to sell, review or save a delivery profile."
    }
];
const team = [
    {
        name: "Tomasi Kiggundu",
        role: "Chief Executive Officer",
        photo: "/team/tomasi-kiggundu.jpg",
        lead: "A logistics and operations professional with an international background spanning Europe, Africa and the United States.",
        bio: [
            "Tomasi studied Logistics at Nova College in Haarlem, North Holland, where he built a strong foundation in supply chain management, operations and business logistics.",
            "Throughout his career he has gained hands-on experience in logistics coordination, operations management, media and entrepreneurship. He previously worked with GTV Uganda, and later served as a Junior Operations Manager (Logistics) at International Bike Group in Amsterdam, where he supported day-to-day operational planning and logistics processes. He also worked as a Logistical Clerk at AP Logistics in Amsterdam Sloterdijk, managing inventory, shipment coordination and warehouse operations.",
            "Today he is co-owner of East African Tacos in Los Angeles, where he combines operational expertise with a passion for business, customer service, and bringing authentic East African flavours to the community.",
            "His diverse international experience has strengthened his ability to adapt, solve complex operational challenges, and build businesses that prioritise efficiency, innovation and customer satisfaction. He is passionate about entrepreneurship, logistics, and creating opportunities that connect people, businesses and communities across borders."
        ],
        skills: [
            "Supply chain management",
            "Operations management",
            "Logistics coordination",
            "Inventory & warehouse operations",
            "Entrepreneurship",
            "Customer service"
        ],
        education: [
            {
                school: "Nova College, Haarlem",
                detail: "Logistics — North Holland, Netherlands"
            }
        ]
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
        linkedin: "https://www.linkedin.com/in/resty-babirye-mba-ib-ba-ss-dip-ed-b0a385211",
        lead: "A results-driven sales and business development professional with over 10 years' experience in Pay-TV sales, the consumer sector and telecommunications.",
        bio: [
            "Resty has a proven ability to execute market growth strategies, build and manage cross-functional high-performing teams, strengthen client relationships, and drive consistent sales results through structured coaching, delegation, quality compliance oversight and data-driven decision-making. She streamlines processes and delivers projects on time and within budget.",
            "Since April 2018 she has been Territory Sales Manager at MultiChoice Group in Uganda, covering territory development and customer service management across her patch. Before that she spent three years as Retail Sales Manager at GOtv Uganda, from 2015 to 2018, growing the retail channel.",
            "Based in Kampala, she leads business development at Priced Ug — bringing Ugandan businesses onto the platform and helping them get the most out of it."
        ],
        skills: [
            "Territory development",
            "Customer service management",
            "Business-to-Business (B2B)",
            "People management"
        ],
        education: [
            {
                school: "Amity University",
                detail: "Master of Business Administration (MBA) — International Business, 2014–2016"
            },
            {
                school: "Makerere University",
                detail: "Bachelor of Arts (BA) — Social Sciences, 2010–2014"
            },
            {
                school: "Kyambogo University",
                detail: "Diploma of Education — Secondary Education and Teaching"
            }
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AuthButtons.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthButtons",
    ()=>AuthButtons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/hooks-74kNS3WZ.mjs [app-client] (ecmascript) <locals> <export b as useAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+shared@4.29.1_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript) <export useClerk as s> <export s as useClerk>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+shared@4.29.1_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript) <export useUser as h> <export h as useUser>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/clerk.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function AuthButtons() {
    // No Clerk key in this build: still offer the buttons (the pages explain the
    // situation) rather than calling hooks that would throw without a provider.
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClerkConfigured"]) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SignedOutButtons, {}, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 19,
        columnNumber: 34
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthButtonsLive, {}, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 20,
        columnNumber: 10
    }, this);
}
_c = AuthButtons;
function AuthButtonsLive() {
    _s();
    const { isLoaded, isSignedIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__["useAuth"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__["useUser"])();
    const { signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__["useClerk"])();
    if (!isLoaded) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-9 w-[8.5rem]",
        "aria-hidden": true
    }, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 28,
        columnNumber: 25
    }, this);
    if (isSignedIn) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/my-business",
                    className: "hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500 sm:block",
                    children: "My business"
                }, void 0, false, {
                    fileName: "[project]/components/AuthButtons.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/account",
                    title: user?.primaryEmailAddress?.emailAddress ?? undefined,
                    className: "rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500",
                    children: "Account"
                }, void 0, false, {
                    fileName: "[project]/components/AuthButtons.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>signOut({
                            redirectUrl: "/"
                        }),
                    className: "rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:border-brand-500 hover:text-brand-500",
                    children: "Sign out"
                }, void 0, false, {
                    fileName: "[project]/components/AuthButtons.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/AuthButtons.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SignedOutButtons, {}, void 0, false, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 57,
        columnNumber: 10
    }, this);
}
_s(AuthButtonsLive, "Sd+aCZlsRKXNn8nQNj23O6rQ3n4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__h$3e$__$3c$export__h__as__useUser$3e$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$shared$40$4$2e$29$2e$1_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__["useClerk"]
    ];
});
_c1 = AuthButtonsLive;
function SignedOutButtons() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/sign-in",
                className: "rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500",
                children: "Login"
            }, void 0, false, {
                fileName: "[project]/components/AuthButtons.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/sign-up",
                className: "rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 transition duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                children: "Sign up"
            }, void 0, false, {
                fileName: "[project]/components/AuthButtons.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AuthButtons.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_c2 = SignedOutButtons;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "AuthButtons");
__turbopack_context__.k.register(_c1, "AuthButtonsLive");
__turbopack_context__.k.register(_c2, "SignedOutButtons");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Nav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Nav",
    ()=>Nav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/content/site.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthButtons.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const NAV_LINKS = [
    {
        href: "/browse",
        label: "Browse"
    },
    {
        href: "/#how-it-works",
        label: "How it works"
    },
    {
        href: "/#features",
        label: "Features"
    },
    {
        href: "/#contact",
        label: "Contact"
    },
    {
        href: "/#download",
        label: "Get the app"
    }
];
function Nav() {
    _s();
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Lift the bar off the page once scrolling starts. Initial state matches the
    // server render (false), so there is no hydration mismatch.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Nav.useEffect": ()=>{
            const onScroll = {
                "Nav.useEffect.onScroll": ()=>setScrolled(window.scrollY > 8)
            }["Nav.useEffect.onScroll"];
            onScroll();
            window.addEventListener("scroll", onScroll, {
                passive: true
            });
            return ({
                "Nav.useEffect": ()=>window.removeEventListener("scroll", onScroll)
            })["Nav.useEffect"];
        }
    }["Nav.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: `sticky top-0 z-50 backdrop-blur-md transition duration-300 ${scrolled ? "border-b border-line/80 bg-white/85 shadow-sm shadow-black/5" : "border-b border-transparent bg-white/60"}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            "aria-label": "Main",
            className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "group flex items-center gap-2.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: "/logo.svg",
                            alt: "",
                            width: 32,
                            height: 32,
                            className: "size-8 transition duration-300 group-hover:-rotate-12 group-hover:scale-110",
                            priority: true
                        }, void 0, false, {
                            fileName: "[project]/components/Nav.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-lg font-bold tracking-tight",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["site"].name
                        }, void 0, false, {
                            fileName: "[project]/components/Nav.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Nav.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "hidden items-center gap-5 md:flex lg:gap-7",
                    children: NAV_LINKS.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: link.href,
                                className: "relative text-sm font-medium text-ink-600 transition after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-brand-500 after:transition-[width] after:duration-300 hover:text-brand-500 hover:after:w-full",
                                children: link.label
                            }, void 0, false, {
                                fileName: "[project]/components/Nav.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this)
                        }, link.href, false, {
                            fileName: "[project]/components/Nav.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/Nav.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthButtons"], {}, void 0, false, {
                    fileName: "[project]/components/Nav.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Nav.tsx",
            lineNumber: 37,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Nav.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_s(Nav, "tQtW9FyKD+Ut/6k+f0BCbABprL4=");
_c = Nav;
var _c;
__turbopack_context__.k.register(_c, "Nav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_04yvy4j._.js.map