"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/owner-session";
import { saveSourceRecords } from "@/lib/source-records";

export async function saveSource(formData: FormData) {
  if (!(await isOwner())) throw new Error("Unauthorized");
  const domain = String(formData.get("domain") ?? "");
  saveSourceRecords({ sourceId: String(formData.get("sourceId") ?? ""), status: String(formData.get("status") ?? ""), rationale: String(formData.get("rationale") ?? ""), evidenceUrl: String(formData.get("evidenceUrl") ?? ""), ownerName: String(formData.get("ownerName") ?? ""), ownerEvidenceUrl: String(formData.get("ownerEvidenceUrl") ?? ""), confidence: String(formData.get("confidence") ?? "") });
  revalidatePath(`/sources/${encodeURIComponent(domain)}`); redirect(`/sources/${encodeURIComponent(domain)}`);
}
