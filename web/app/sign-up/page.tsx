"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignUp } from "@clerk/react";
import {
  AuthShell,
  FormError,
  buttonClass,
  inputClass,
  linkClass,
} from "@/components/auth/AuthShell";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { isClerkConfigured } from "@/lib/clerk";

/** Mirrors the mobile app's sign-up screen: password, then an emailed code. */
export default function SignUpPage() {
  // Clerk's hooks throw outside a provider, so the gate sits above the form.
  if (!isClerkConfigured) return <AuthUnavailable />;
  return <SignUpForm />;
}

function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = fetchStatus === "fetching";

  // Clerk drives the step, not local state: once the account exists and only the
  // email is unverified, the code form is what should be on screen.
  const awaitingCode =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const { error: signUpError } = await signUp.password({ emailAddress: email, password });
    if (signUpError) {
      setError(
        signUpError.longMessage ?? signUpError.message ?? "Could not create the account.",
      );
      return;
    }
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const { error: codeError } = await signUp.verifications.verifyEmailCode({ code });
    if (codeError) {
      setError(codeError.longMessage ?? codeError.message ?? "That code didn't work.");
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize();
      router.replace("/");
    }
  };

  if (awaitingCode) {
    return (
      <AuthShell
        tagline="Create your business page"
        title="Verify your email"
        subtitle={`Enter the code sent to ${email || "your email"}.`}
      >
        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <input
            className={inputClass}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
          />
          <FormError message={error} />
          <button type="submit" className={buttonClass} disabled={!code || busy}>
            {busy ? "Verifying…" : "Verify Email"}
          </button>
          <button
            type="button"
            className={`${linkClass} pt-1`}
            onClick={() => signUp.verifications.sendEmailCode()}
          >
            Resend code
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell tagline="Create your business page" title="Create account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          autoComplete="email"
        />
        <input
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          autoComplete="new-password"
        />

        <FormError message={error} />

        <button type="submit" className={buttonClass} disabled={!email || !password || busy}>
          {busy ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <GoogleAuthButton mode="sign-up" />

      <p className="mt-8 text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/sign-in" className={linkClass}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
