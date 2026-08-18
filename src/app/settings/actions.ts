"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { providers, removeCredential, resolveOpenAiCredential, saveCredential } from "@/lib/credentials";
import { clearOwnerSession, isOwner, setOwnerSession, validPassword } from "@/lib/owner-session";
import { safeProviderBaseUrl } from "@/lib/provider-url";
import { verifyOpenAiCredential } from "@/lib/provider-test";

export async function login(formData: FormData) {
  if (!validPassword(String(formData.get("password") ?? ""))) redirect("/settings?error=invalid");
  await setOwnerSession();
  redirect("/settings");
}
export async function logout() { await clearOwnerSession(); redirect("/settings"); }
export async function saveProvider(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized");
  const value = z.object({ provider: z.enum(providers), secret: z.string().min(1).max(4096), baseUrl: z.string().url().optional().or(z.literal("")), model: z.string().max(160).optional() }).parse(Object.fromEntries(formData));
  if (value.baseUrl && value.provider !== "openai") throw new Error("Custom base URLs are only supported for OpenAI-compatible credentials");
  const baseUrl = value.baseUrl ? await safeProviderBaseUrl(value.baseUrl) : undefined;
  saveCredential(value.provider, value.secret, baseUrl, value.model || undefined);
  revalidatePath("/settings");
}
export async function deleteProvider(formData: FormData) { if (!(await isOwner())) throw new Error("Unauthorized"); removeCredential(z.enum(providers).parse(formData.get("provider"))); revalidatePath("/settings"); }
export async function testProvider(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized");
  const provider = z.enum(providers).parse(formData.get("provider"));
  if (provider !== "openai") redirect("/settings?notice=unsupported");
  const credential = resolveOpenAiCredential();
  const result = credential && await verifyOpenAiCredential(credential);
  redirect(`/settings?notice=${result?.ok ? "verified" : "failed"}`);
}
