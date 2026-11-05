"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    nonce: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: { theme: string; size: string; width: number },
  ) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

export default function SignIn({ clientId }: { clientId: string }) {
  const router = useRouter();
  const button = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const authenticate = useCallback(
    async ({ credential }: { credential: string }) => {
      setBusy(true);
      setError("");
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to sign in.");
        router.replace("/dashboard");
        router.refresh();
      } catch (failure) {
        setError(
          failure instanceof Error ? failure.message : "Unable to sign in.",
        );
        setReady(false);
        // A failed credential consumes the challenge; fetch another before retrying.
        setTimeout(() => setReady(true), 0);
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  useEffect(() => {
    localStorage.removeItem("token");
    if (!ready || !button.current || !window.google) return;
    let cancelled = false;
    fetch("/api/auth/challenge", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to start sign-in.");
        return response.json();
      })
      .then(({ nonce }) => {
        if (cancelled || !button.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          nonce,
          callback: authenticate,
        });
        button.current.replaceChildren();
        window.google.accounts.id.renderButton(button.current, {
          theme: "outline",
          size: "large",
          width: 300,
        });
      })
      .catch(() =>
        setError("Unable to connect. Reload the page to try again."),
      );
    return () => {
      cancelled = true;
    };
  }, [ready, clientId, authenticate]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() =>
          setError(
            "Google sign-in could not load. Check your connection and reload.",
          )
        }
      />
      <div ref={button} aria-busy={busy} />
      {!ready && !error && <p role="status">Loading Google sign-in…</p>}
      {busy && <p role="status">Signing in…</p>}
      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
    </>
  );
}
