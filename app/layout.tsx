import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import "../features/analytics/index.css";
import "./table-overrides.css";
import "./auth.css";

export const metadata: Metadata = {
  title: "Data Analytics App",
  description: "App analytics dashboard",
  icons: { icon: "/rubik's.webp", apple: "/logo192.png" },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div id="root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
