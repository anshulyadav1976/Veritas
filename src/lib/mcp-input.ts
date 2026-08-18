import { z } from "zod/v4";

export const mcpListStoriesInput = z.object({
  limit: z.number().int().min(1).max(30).optional(),
  region: z.enum(["US", "GB", "IN"]).optional(),
});

export const mcpGetStoryInput = z.object({ storyId: z.string().uuid() });
