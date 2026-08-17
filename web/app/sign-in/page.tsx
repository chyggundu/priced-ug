"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignIn } from "@clerk/react";
import {
  AuthShell,
  FormError,
  buttonClass,
  inputClass,
  linkClass,
} from "@/components/auth/AuthShell";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { isClerkConfigured } from "@/lib/clerk";

/**
 * Mirrors the mobile app's sign-in screen, including its two-step shape: this
 * Clerk instance does not accept a password as a first factor on its own, so a
 * successful password call lands on `needs_second_factor` / `needs_client_trust`
 * and an emailed code finishes the job. Same behaviour as the app.
 */
export default function SignInPage() {
  // Clerk's hooks throw outside a provider, so the gate must sit above the form
  // rather than inside it.
  if (!isClerkConfigured) return <AuthUnavailable />;
  return <SignInForm />;
}

function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "code">("form");
  const [error, setError] = useState<string | null>(null);

  const busy = fetchStatus === "fetching";

  const sendCode = async () => {
    const { error: sendError } = await signIn.mfa.sendEmailCode();
    if (sendError) {
      setError(sendError.message ?? "Couldn't send the verification code. Try Resend.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const { error: passwordError } = await signIn.password({
        emailAddress: email,
        password,
      });
      if (passwordError) {
        setError(
          passwordError.longMessage ?? passwordError.message ?? "Sign in failed. Please try again.",
        );
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/");
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        await sendCode();
        setStep("code");
      } else {
        setError(`Additional verification is required (${signIn.status ?? "unknown"}).`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const { error: codeError } = await signIn.mfa.verifyEmailCode({ code });
      if (codeError) {
        setError(codeError.longMessage ?? codeError.message ?? "That code didn't work.");
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  };

  if (step === "code") {
    return (
      <AuthShell
        tagline="Find the best deals in Uganda"
        title="Verify your account"
        subtitle={`Enter the 6-digit code we sent to ${email || "your email"}.`}
      >
        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <input
            className={inputClass}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
          />
          <FormError message={error} />
          <button type="submit" className={buttonClass} disabled={!code || busy}>
            {busy ? "Verifying…" : "Verify"}
          </button>
          <div className="flex justify-between pt-1">
            <button
              type="button"
              className={linkClass}
              onClick={async () => {
                setError(null);
                await sendCode();
              }}
            >
              Resend code
            </button>
            <button
              type="button"
              className={linkClass}
              onClick={() => {
                setStep("form");
                setCode("");
                setError(null);
              }}
            >
              Back to sign in
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell tagline="Find the best deals in Uganda" title="Welcome back">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          autoComplete="email"
        />

        <div className="relative">
          <input
            className={`${inputClass} pr-12`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-ink-400 transition hover:text-ink-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <FormError message={error} />

        <button type="submit" className={buttonClass} disabled={!email || !password || busy}>
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <div className="pt-1 text-center">
          <Link href="/forgot-password" className={linkClass}>
            Forgot password?
          </Link>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className={linkClass}>
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
