"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/services/firebase";
import { useApp } from "@/context/AppContext";
import { sampleZones } from "@/data/mockIncident";
import Aurora from "@/components/reactbits/Aurora";

type Mode = "signin" | "register";

const FAKE_LOG = [
  "[02:14:08] Motion detected — Zone 4",
  "[02:14:09] AI triage: CRITICAL",
  "[02:14:10] Snapshot captured",
  "[02:14:11] Responders alerted — 3 in range",
  "[02:14:43] Unit 7 en route",
  "[02:15:12] ETA 4 minutes",
  "[02:15:48] Responder on scene",
  "[02:16:02] Threat neutralised",
  "[02:16:14] Zone clear",
];

function AuthInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { setUser, user } = useApp();
  const [mode, setMode] = useState<Mode>(
    search.get("mode") === "register" ? "register" : "signin"
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    certificationId: "",
    zone: sampleZones[0],
  });

  useEffect(() => {
    if (user?.isAuthenticated) {
      router.replace(search.get("redirect") || "/dashboard");
    }
  }, [user, router, search]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (mode === "register") {
      if (!form.name) e.name = "Enter your full name.";
      if (!form.certificationId) e.certificationId = "Certification ID is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result =
        mode === "signin"
          ? await signIn(form.email, form.password)
          : await signUp({
              name: form.name,
              email: form.email,
              password: form.password,
              certificationId: form.certificationId,
              zone: form.zone,
            });
      setUser(result.user);
      router.push(search.get("redirect") || "/dashboard");
    } catch {
      setErrors({ form: "Authentication failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-ocean-darker)" }}
    >
      {/* Aurora background */}
      <Aurora
        colorStops={["#001a33", "#0066cc", "#00e5ff"]}
        blend={0.35}
        amplitude={0.8}
        speed={0.6}
      />

      {/* Scrolling log — decorative, left side, desktop only */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-72 flex-col overflow-hidden z-10">
        <div
          className="flex-1 overflow-hidden relative"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        >
          <div className="animate-log-scroll px-6 pt-24 space-y-2">
            {[...FAKE_LOG, ...FAKE_LOG].map((line, i) => (
              <div
                key={i}
                className="font-mono text-[11px]"
                style={{ color: "var(--color-ocean-cyan)", opacity: 0.45 }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div
        className="relative z-20 w-full max-w-md mx-4 rounded-2xl p-8 glass-card"
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Logo */}
        <Link href="/" className="block mb-8">
          <span className="text-2xl font-bold tracking-wider text-white">SALVO</span>
          <span
            className="block text-xs font-mono mt-0.5"
            style={{ color: "var(--color-ocean-cyan)", opacity: 0.7 }}
          >
            RESPONDER PORTAL
          </span>
        </Link>

        {/* Tabs */}
        <div
          className="flex gap-6 mb-6 border-b"
          style={{ borderColor: "rgba(0,229,255,0.1)" }}
        >
          {(["signin", "register"] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="relative pb-3 text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--color-ocean-cyan)" : "var(--color-text-secondary)",
                }}
              >
                {m === "signin" ? "Sign In" : "Register"}
                {active && (
                  <span
                    className="absolute bottom-[-1px] inset-x-0 h-[2px] rounded-full"
                    style={{ background: "var(--color-ocean-cyan)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "register" && (
            <Field label="Full Name" error={errors.name} htmlFor="name">
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full"
                style={errors.name ? { borderColor: "var(--color-critical)" } : undefined}
              />
            </Field>
          )}

          <Field label="Email" error={errors.email} htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full"
              placeholder="responder@salvo.io"
              style={errors.email ? { borderColor: "var(--color-critical)" } : undefined}
            />
          </Field>

          <Field label="Password" error={errors.password} htmlFor="password">
            <input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full"
              style={errors.password ? { borderColor: "var(--color-critical)" } : undefined}
            />
          </Field>

          {mode === "register" && (
            <>
              <Field label="Certification ID" error={errors.certificationId} htmlFor="cert">
                <input
                  id="cert"
                  type="text"
                  value={form.certificationId}
                  onChange={(e) => update("certificationId", e.target.value)}
                  placeholder="e.g. SG-04821"
                  className="w-full"
                  style={
                    errors.certificationId ? { borderColor: "var(--color-critical)" } : undefined
                  }
                />
              </Field>

              <Field label="Region / Zone" htmlFor="zone">
                <select
                  id="zone"
                  value={form.zone}
                  onChange={(e) => update("zone", e.target.value)}
                  className="w-full"
                >
                  {sampleZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {errors.form && (
            <p className="text-sm" style={{ color: "var(--color-critical)" }}>
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all glow-cyan-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--color-ocean-cyan)",
              color: "var(--color-ocean-darker)",
            }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Working…
              </span>
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {mode === "signin" ? (
              <>
                <button type="button" onClick={() => setMode("register")} className="hover:text-ocean-cyan transition-colors">
                  Need an account?
                </button>
                <a href="#" className="hover:text-ocean-cyan transition-colors">
                  Forgot password?
                </a>
              </>
            ) : (
              <button type="button" onClick={() => setMode("signin")} className="hover:text-ocean-cyan transition-colors">
                Already registered? Sign in
              </button>
            )}
          </div>
        </form>

        <p className="mt-8 text-xs leading-relaxed" style={{ color: "var(--color-text-dim)" }}>
          By continuing, you confirm you are a certified security professional.
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium mb-1.5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs" style={{ color: "var(--color-critical)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--color-ocean-darker)" }}
        >
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Loading…
          </span>
        </div>
      }
    >
      <AuthInner />
    </Suspense>
  );
}
