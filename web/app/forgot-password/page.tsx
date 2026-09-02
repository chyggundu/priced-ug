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

/** Mirrors the mobile app's forgot-password screen: email → code → new password. */
export default function ForgotPasswordPage() {
  // Clerk's hooks throw outside a provider, so the gate sits above the form.
  if (!isClerkConfigured) return <AuthUnavailable />;
  return <ForgotPasswordForm />;
}

function ForgotPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = fetchStatus === "fetching";

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const created = await signIn.create({ identifier: email });
    if (created.error) {
      setError(created.error.longMessage ?? created.error.message ?? "We couldn't find that account.");
      return;
    }
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) {
      setError(sent.error.longMessage ?? sent.error.message ?? "Couldn't send the code.");
      return;
    }
    setStep("code");
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const res = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (res.error) {
      setError(res.error.longMessage ?? res.error.message ?? "That code didn't work.");
      return;
    }
    if (signIn.status === "needs_new_password") setStep("reset");
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const res = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
    if (res.error) {
      setError(res.error.longMessage ?? res.error.message ?? "Could not set that password.");
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize();
      router.replace("/");
    }
  };

  if (step === "reset") {
    return (
      <AuthShell
        tagline="Find the best deals in Uganda"
        title="Set a new password"
        subtitle="Choose a password you have not used before."
      >
        <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
          <input
            className={inputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            type="password"
            autoComplete="new-password"
            autoFocus
          />
          <FormError message={error} />
          <button type="submit" className={buttonClass} disabled={!newPassword || busy}>
            {busy ? "Saving…" : "Reset password"}
          </button>
        </form>
      </AuthShell>
    );
  }

  if (step === "code") {
    return (
      <AuthShell
        tagline="Find the best deals in Uganda"
        title="Check your email"
        subtitle={`Enter the code we sent to ${email}.`}
      >
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
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
            {busy ? "Verifying…" : "Verify code"}
          </button>
          <button
            type="button"
            className={`${linkClass} pt-1`}
            onClick={() => signIn.resetPasswordEmailCode.sendCode()}
          >
            Resend code
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline="Find the best deals in Uganda"
      title="Forgot password"
      subtitle="We'll email you a code to reset it."
    >
      <form onSubmit={handleSendCode} className="flex flex-col gap-3">
        <input
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          autoComplete="email"
        />
        <FormError message={error} />
        <button type="submit" className={buttonClass} disabled={!email || busy}>
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        Remembered it?{" "}
        <Link href="/sign-in" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
