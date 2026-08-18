"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { providers, removeCredential, saveCredential } from "@/lib/credentials";
import { clearOwnerSession, isOwner, setOwnerSession, validPassword } from "@/lib/owner-session";

export async function login(formData: FormData) {
  if (!validPassword(String(formData.get("password") ?? ""))) redirect("/settings?error=invalid");
  await setOwnerSession();
  redirect("/settings");
}
export async function logout() { await clearOwnerSession(); redirect("/settings"); }
export async function saveProvider(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized");
  const value = z.object({ provider: z.enum(providers), secret: z.string().min(1).max(4096), baseUrl: z.string().url().optional().or(z.literal("")), model: z.string().max(160).optional() }).parse(Object.fromEntries(formData));
  saveCredential(value.provider, value.secret, value.baseUrl || undefined, value.model || undefined);
  revalidatePath("/settings");
}
export async function deleteProvider(formData: FormData) { if (!(await isOwner())) throw new Error("Unauthorized"); removeCredential(z.enum(providers).parse(formData.get("provider"))); revalidatePath("/settings"); }
