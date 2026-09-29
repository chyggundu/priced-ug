"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSignIn, useSignUp } from "@clerk/react";
import {
  AuthShell,
  FormError,
  buttonClass,
  inputClass,
  linkClass,
} from "@/components/auth/AuthShell";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { isClerkConfigured } from "@/lib/clerk";
import { formatForDisplay, isValidPhone, toE164 } from "@/lib/phone";

/**
 * Clerk reports the useful code in two places: the returned error carries a
 * generic `code: "api_response_error"` with the real per-field code nested in
 * `errors[0].code`. Reading only the top level made the sign-up fallback never
 * fire, since the outer code never equals `form_identifier_not_found`.
 */
type ClerkLikeError = {
  code?: string;
  message?: string;
  longMessage?: string;
  errors?: { code?: string; message?: string; longMessage?: string }[];
};

function clerkCode(e: unknown): string | undefined {
  const err = e as ClerkLikeError;
  return err?.errors?.[0]?.code ?? err?.code;
}

function describeClerkError(e: unknown): string {
  const err = e as ClerkLikeError;
  const first = err?.errors?.[0];
  const code = clerkCode(e);
  if (code === "captcha_missing_token" || code === "captcha_invalid") {
    return "Bot protection blocked this sign-up. Turn off Bot Protection for this Clerk instance, or sign in with email.";
  }
  return (
    first?.longMessage ??
    first?.message ??
    err?.longMessage ??
    err?.message ??
    "Something went wrong. Please try again."
  );
}

/** Seconds before "Resend code" becomes clickable again, matching Clerk's throttle. */
const RESEND_COOLDOWN = 30;

/**
 * Phone sign-in on the web, mirroring the app's /(auth)/phone screen: one number
 * field, one SMS code, no separate "create account" step. Clerk keeps sign-in
 * and sign-up as distinct resources, so this page picks between them itself — it
 * tries to sign in, and reads `form_identifier_not_found` as "this number is
 * new" and registers it instead.
 */
export default function PhoneAuthPage() {
  // Clerk's hooks throw outside a provider, so the gate sits above the form.
  if (!isClerkConfigured) return <AuthUnavailable />;
  return <PhoneAuthForm />;
}

function PhoneAuthForm() {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  // Which Clerk resource owns this attempt. Decided when the code is sent, and
  // read again on verify — the two must not disagree.
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const busy = signInStatus === "fetching" || signUpStatus === "fetching";
  const e164 = toE164(phone);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown > 0]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!e164) return;
    setError(null);

    const { error: signInError } = await signIn.phoneCode.sendCode({ phoneNumber: e164 });

    if (!signInError) {
      setMode("sign-in");
      setStep("code");
      setCooldown(RESEND_COOLDOWN);
      return;
    }

    /*
      Clerk returns this when no account carries the number. That is not a
      failure here — it is the signal to register instead. Any other code is a
      real error and gets shown.
    */
    if (clerkCode(signInError) !== "form_identifier_not_found") {
      setError(describeClerkError(signInError));
      return;
    }

    const { error: createError } = await signUp.create({ phoneNumber: e164 });
    if (createError) {
      setError(describeClerkError(createError));
      return;
    }

    const { error: sendError } = await signUp.verifications.sendPhoneCode();
    if (sendError) {
      setError(describeClerkError(sendError));
      return;
    }

    setMode("sign-up");
    setStep("code");
    setCooldown(RESEND_COOLDOWN);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    const { error: resendError } =
      mode === "sign-in"
        ? await signIn.phoneCode.sendCode()
        : await signUp.verifications.sendPhoneCode();
    if (resendError) {
      setError(describeClerkError(resendError));
      return;
    }
    setCooldown(RESEND_COOLDOWN);
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === "sign-in") {
      const { error: verifyError } = await signIn.phoneCode.verifyCode({ code });
      if (verifyError) {
        setError(describeClerkError(verifyError));
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/");
      }
      return;
    }

    const { error: verifyError } = await signUp.verifications.verifyPhoneCode({ code });
    if (verifyError) {
      setError(describeClerkError(verifyError));
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize();
      router.replace("/");
    }
  };

  if (step === "code") {
    return (
      <AuthShell
        tagline="Find the best deals in Uganda"
        title="Enter the code"
        subtitle={`We sent a 6-digit code to ${formatForDisplay(phone)}.`}
      >
        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <input
            className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="------"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
          />
          <FormError message={error} />
          <button type="submit" className={buttonClass} disabled={code.length !== 6 || busy}>
            {busy ? "Verifying…" : "Verify"}
          </button>
          <div className="flex justify-between pt-1">
            <button
              type="button"
              className={linkClass}
              onClick={resend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              className={linkClass}
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
            >
              Change number
            </button>
          </div>
        </form>

        {/* Clerk's bot check needs somewhere to mount when the number is new. */}
        <div id="clerk-captcha" />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline="Find the best deals in Uganda"
      title="Continue with phone"
      subtitle="We'll text you a code. No password needed. Include your country code, for example +256 or +92."
    >
      <form onSubmit={handleSend} className="flex flex-col gap-3">
        <div className="flex items-center rounded-[10px] border border-line bg-white transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
          <input
            className="w-full bg-transparent px-4 py-3 text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+256 772 123 456"
            type="tel"
            autoComplete="tel"
            autoFocus
          />
        </div>

        <FormError message={error} />

        <button
          type="submit"
          className={buttonClass}
          disabled={!isValidPhone(phone) || busy}
        >
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>

      <div id="clerk-captcha" />

      <p className="mt-8 text-center text-sm text-ink-600">
        Prefer email?{" "}
        <Link href="/sign-in" className={linkClass}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
