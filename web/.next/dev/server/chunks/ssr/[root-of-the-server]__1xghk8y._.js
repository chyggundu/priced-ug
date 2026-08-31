module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/lib/supabase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BUCKET",
    ()=>BUCKET,
    "getCurrentUserId",
    ()=>getCurrentUserId,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured,
    "sb",
    ()=>sb,
    "setAuthTokenGetter",
    ()=>setAuthTokenGetter,
    "setCurrentUserId",
    ()=>setCurrentUserId,
    "supabaseUrl",
    ()=>supabaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$112$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.112.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
/**
 * The website's own Supabase client. It mirrors the mobile app's setup
 * (artifacts/pricedug + lib/api-client-react) but shares no code with it: same
 * project, same RLS, separate implementation and separate env.
 *
 * Every request carries the Clerk session token, which is what Postgres RLS
 * reads via `clerk_uid()`. Without a token the client still works — it just sees
 * exactly what an anonymous visitor is allowed to see.
 */ const url = ("TURBOPACK compile-time value", "https://nirodctxmpvswrjyvlqq.supabase.co") ?? "";
const anonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcm9kY3R4bXB2c3dyanl2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0ODcyMTksImV4cCI6MjA5OTA2MzIxOX0.k4REAWvuDlh1cKBZfVnAA9pDlHgx_IoaklgXsVQHdCI") ?? "";
const isSupabaseConfigured = Boolean(url && anonKey);
const BUCKET = "uploads";
let tokenGetter = null;
let currentUserId = null;
let client = null;
function setAuthTokenGetter(getter) {
    tokenGetter = getter;
}
function setCurrentUserId(id) {
    currentUserId = id;
}
function getCurrentUserId() {
    return currentUserId;
}
function sb() {
    if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local.");
    }
    if (!client) {
        client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$112$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            },
            accessToken: async ()=>{
                if (!tokenGetter) return null;
                try {
                    return await tokenGetter() ?? null;
                } catch  {
                    return null;
                }
            }
        });
    }
    return client;
}
const supabaseUrl = url;
}),
"[project]/components/SupabaseAuthBridge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SupabaseAuthBridge",
    ()=>SupabaseAuthBridge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/hooks-74kNS3WZ.mjs [app-ssr] (ecmascript) <locals> <export b as useAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function SupabaseAuthBridge() {
    const { userId, getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__b__as__useAuth$3e$__["useAuth"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAuthTokenGetter"])(async ()=>{
            try {
                const templated = await getToken({
                    template: "supabase"
                });
                if (templated) return templated;
            } catch  {
            // No such template on this Clerk instance — fall through.
            }
            try {
                return await getToken();
            } catch  {
                return null;
            }
        });
    }, [
        getToken
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setCurrentUserId"])(userId ?? null);
    }, [
        userId
    ]);
    return null;
}
}),
"[project]/lib/clerk.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Clerk keys are environment-bound: a `pk_live_` key is rejected by Clerk on any
 * host other than the production domain, and a `pk_test_` key belongs to the
 * development instance. So `.env.local` holds the development key and the
 * production host supplies the live one — never the other way round.
 *
 * When the key is absent the site still has to work: these pages are the public
 * website first, and auth is an add-on. Everything guards on `isClerkConfigured`
 * rather than mounting Clerk and letting it throw.
 */ __turbopack_context__.s([
    "clerkPublishableKey",
    ()=>clerkPublishableKey,
    "isClerkConfigured",
    ()=>isClerkConfigured
]);
const clerkPublishableKey = ("TURBOPACK compile-time value", "pk_test_Z2VudWluZS1iaXNvbi01Ni5jbGVyay5hY2NvdW50cy5kZXYk") ?? "";
const isClerkConfigured = clerkPublishableKey.length > 0;
}),
"[project]/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.10_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$ClerkProvider$2d$BWj89qiw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__ClerkProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@clerk+react@6.14.3_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@clerk/react/dist/ClerkProvider-BWj89qiw.mjs [app-ssr] (ecmascript) <export t as ClerkProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SupabaseAuthBridge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SupabaseAuthBridge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/clerk.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function Providers({ children }) {
    // Without a key Clerk throws on mount and takes the whole page with it. The
    // marketing pages must stay readable regardless, so render them unwrapped and
    // let the auth pages report the misconfiguration themselves.
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isClerkConfigured"]) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$clerk$2b$react$40$6$2e$14$2e$3_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$ClerkProvider$2d$BWj89qiw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__ClerkProvider$3e$__["ClerkProvider"], {
        publishableKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$clerk$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clerkPublishableKey"],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$10_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SupabaseAuthBridge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SupabaseAuthBridge"], {}, void 0, false, {
                fileName: "[project]/app/providers.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1xghk8y._.js.map