"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClaim } from "@/lib/claims";
import { isOwner } from "@/lib/owner-session";
import { mergeStories, splitStoryArticle } from "@/lib/story-operations";

export async function addClaim(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized");
  const storyId = String(formData.get("storyId") ?? "");
  createClaim({ storyId, articleId: String(formData.get("articleId") ?? ""), text: String(formData.get("text") ?? ""), status: String(formData.get("status") ?? ""), stance: String(formData.get("stance") ?? ""), note: String(formData.get("note") ?? "") });
  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}`);
}
export async function mergeStory(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized"); const targetStoryId = String(formData.get("targetStoryId") ?? "");
  mergeStories({ targetStoryId, sourceStoryId: String(formData.get("sourceStoryId") ?? ""), reason: String(formData.get("reason") ?? "") });
  revalidatePath(`/stories/${targetStoryId}`); redirect(`/stories/${targetStoryId}`);
}
export async function splitStory(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized"); const sourceStoryId = String(formData.get("sourceStoryId") ?? "");
  const storyId = splitStoryArticle({ sourceStoryId, articleId: String(formData.get("articleId") ?? ""), headline: String(formData.get("headline") ?? ""), reason: String(formData.get("reason") ?? "") });
  revalidatePath(`/stories/${sourceStoryId}`); redirect(`/stories/${storyId}`);
}
