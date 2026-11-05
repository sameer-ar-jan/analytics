"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="status-screen" role="alert">
      <h1>This report could not load</h1>
      <p>Please try again.</p>
      <button onClick={reset}>Try again</button>{" "}
      <Link href="/dashboard">Dashboard</Link>
    </main>
  );
}
