import { McpServer } from "@modelcontextprotocol/server";

import { mcpGetStoryInput, mcpListStoriesInput } from "./mcp-input";
import { getStory, listStories } from "./story-read-model";

export { mcpGetStoryInput, mcpListStoriesInput } from "./mcp-input";

function response(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }], structuredContent: value };
}

export function createVeritasMcpServer() {
  const server = new McpServer({ name: "veritas", version: "0.1.0" });
  server.registerTool("veritas_list_stories", {
    title: "List Veritas stories",
    description: "Read up to 30 current public Veritas stories. This tool has no write, network, credential, or provider capabilities.",
    inputSchema: mcpListStoriesInput,
  }, async ({ limit, region }) => response({ data: listStories(limit ?? 10, region), meta: { readOnly: true } }));
  server.registerTool("veritas_get_story", {
    title: "Read a Veritas story",
    description: "Read a public story, its original-report links, reviewed evidence records, and provenance limits. This tool has no write, network, credential, or provider capabilities.",
    inputSchema: mcpGetStoryInput,
  }, async ({ storyId }) => {
    const story = getStory(storyId);
    return response(story ? { data: story, meta: { readOnly: true } } : { data: null, meta: { readOnly: true, notFound: true } });
  });
  return server;
}
