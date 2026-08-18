import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import { readerLanguage, readerLocale, t } from "@/lib/i18n";
import "./globals.css";
import { PwaRegister } from "./pwa-register";
import { LocalePicker } from "./locale-picker";

export const metadata: Metadata = {
  title: "Veritas — Evidence-first news",
  description: "An open-source evidence layer for the news.",
};
export const viewport: Viewport = { themeColor: "#f7f8f6" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = readerLocale((await cookies()).get("veritas:language")?.value, (await headers()).get("accept-language"));
  const language = readerLanguage(locale);
  return (
    <html lang={locale}>
      <body><a className="skip-link" href="#main-content">{t(language, "skip")}</a><PwaRegister/>{children}<footer className="reader-footer"><LocalePicker language={language}/></footer></body>
    </html>
  );
}
