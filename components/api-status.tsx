"use client";

import { useEffect, useState } from "react";

export default function ApiStatus() {
  const [failed, setFailed] = useState("");
  useEffect(() => {
    const onError = (event: Event) =>
      setFailed(
        event instanceof CustomEvent && typeof event.detail === "string"
          ? event.detail
          : "Some analytics could not be loaded. Values may be incomplete.",
      );
    window.addEventListener("analytics:request-error", onError);
    return () => window.removeEventListener("analytics:request-error", onError);
  }, []);
  if (!failed) return null;
  return (
    <div className="api-error-banner" role="alert">
      <span>{failed}</span>
      <button onClick={() => window.location.reload()}>Reload report</button>
      <button aria-label="Dismiss error" onClick={() => setFailed("")}>
        Dismiss
      </button>
    </div>
  );
}
