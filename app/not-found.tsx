import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-screen">
      <h1>Page not found</h1>
      <Link href="/dashboard">Return to dashboard</Link>
    </main>
  );
}
