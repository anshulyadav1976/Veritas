"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClaim } from "@/lib/claims";
import { isOwner } from "@/lib/owner-session";

export async function addClaim(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized");
  const storyId = String(formData.get("storyId") ?? "");
  createClaim({ storyId, articleId: String(formData.get("articleId") ?? ""), text: String(formData.get("text") ?? ""), status: String(formData.get("status") ?? ""), stance: String(formData.get("stance") ?? ""), note: String(formData.get("note") ?? "") });
  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}`);
}
