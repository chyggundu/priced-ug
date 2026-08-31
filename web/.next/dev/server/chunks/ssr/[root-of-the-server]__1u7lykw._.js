module.exports = [
"[next]/internal/font/google/inter_2fe1ab3d.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "inter_2fe1ab3d-module__-T-KAq__className",
  "variable": "inter_2fe1ab3d-module__-T-KAq__variable",
});
}),
"[next]/internal/font/google/inter_2fe1ab3d.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_2fe1ab3d$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_2fe1ab3d.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_2fe1ab3d$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Inter', 'Inter Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_2fe1ab3d$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_2fe1ab3d$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[project]/content/site.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/app/providers.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Providers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/providers.tsx <module evaluation>", "Providers");
}),
"[project]/app/providers.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Providers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/providers.tsx", "Providers");
}),
"[project]/app/providers.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$providers$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/providers.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$providers$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/providers.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$providers$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_2fe1ab3d$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_2fe1ab3d.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/content/site.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$providers$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/providers.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
const metadata = {
    metadataBase: new URL(__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].url),
    title: {
        default: `${__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].name} — ${__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].tagline}`,
        template: `%s — ${__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].name}`
    },
    description: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].description,
    applicationName: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].name,
    icons: {
        // SVG first so the tab shows the same brand-red tag as the header; the PNG is
        // the fallback for browsers that do not take SVG favicons.
        icon: [
            {
                url: "/logo.svg",
                type: "image/svg+xml"
            },
            {
                url: "/favicon.png",
                type: "image/png",
                sizes: "225x225"
            }
        ],
        apple: "/icon.png"
    },
    openGraph: {
        type: "website",
        siteName: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].name,
        title: `${__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].name} — ${__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].tagline}`,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].description,
        url: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].url,
        images: [
            {
                url: "/icon.png",
                width: 512,
                height: 512,
                alt: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].name
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: `${__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].name} — ${__TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].tagline}`,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$content$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["site"].description,
        images: [
            "/icon.png"
        ]
    }
};
function RootLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_2fe1ab3d$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            className: "font-sans antialiased",
            suppressHydrationWarning: true,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("noscript", {
                    dangerouslySetInnerHTML: {
                        __html: `<style>.reveal{opacity:1!important;transform:none!important}</style>`
                    }
                }, void 0, false, {
                    fileName: "[project]/app/layout.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$providers$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Providers"], {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/app/layout.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/layout.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/layout.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1u7lykw._.js.map