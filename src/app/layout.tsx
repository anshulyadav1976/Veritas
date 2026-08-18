import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { PwaRegister } from "./pwa-register";

export const metadata: Metadata = {
  title: "Veritas — Evidence-first news",
  description: "An open-source evidence layer for the news.",
};
export const viewport: Viewport = { themeColor: "#f7f8f6" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body><a className="skip-link" href="#main-content">Skip to content</a><PwaRegister/>{children}</body>
    </html>
  );
}
