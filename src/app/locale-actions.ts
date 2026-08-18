"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { readerLanguages } from "@/lib/i18n";

export async function saveReaderLanguage(formData: FormData) {
  const language = String(formData.get("language") ?? "");
  if (!readerLanguages.includes(language as typeof readerLanguages[number])) throw new Error("Unsupported language");
  (await cookies()).set("veritas:language", language, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
