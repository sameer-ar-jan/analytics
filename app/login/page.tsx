import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth";
import SignIn from "./sign-in";

export const metadata = { title: "Sign in | App Analytics" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const configured =
    clientId && process.env.SESSION_SECRET && process.env.ALLOWED_EMAILS;
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="auth-eyebrow">APP ANALYTICS</p>
        <h1>Sign in to your dashboard</h1>
        <p>
          Use your authorized Google account to access reports, charts, and
          exports.
        </p>
        {configured ? (
          <SignIn clientId={clientId} />
        ) : (
          <p role="alert">
            Sign-in is not configured. Ask the administrator to configure Google
            sign-in and authorized accounts.
          </p>
        )}
      </section>
    </main>
  );
}
