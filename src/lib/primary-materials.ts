import { randomUUID } from "node:crypto";
import { z } from "zod";

import { db } from "./db";
import { runMigrations } from "./migrations";

const materialTypes = ["primary_document", "official_record", "official_data", "fact_check"] as const;
export { materialTypes };

const externalHttpsUrl = z.string().url().max(2_048).superRefine((value, context) => {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) context.addIssue({ code: "custom", message: "Use a public HTTPS link without embedded credentials" });
});

export const primaryMaterialInput = z.object({
  storyId: z.string().uuid(),
  title: z.string().trim().min(3).max(300),
  materialType: z.enum(materialTypes),
  url: externalHttpsUrl,
  relevanceNote: z.string().trim().min(8).max(500),
  publishedAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
});

export function addPrimaryMaterial(input: unknown) {
  const value = primaryMaterialInput.parse(input); runMigrations();
  db.prepare("INSERT INTO primary_materials (id, story_id, title, material_type, url, relevance_note, published_at, method_version) VALUES (?, ?, ?, ?, ?, ?, ?, 'operator-material-v1')").run(randomUUID(), value.storyId, value.title, value.materialType, value.url, value.relevanceNote, value.publishedAt || null);
}
