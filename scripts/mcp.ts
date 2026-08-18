import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { createVeritasMcpServer } from "../src/lib/mcp";

void serveStdio(createVeritasMcpServer);
console.error("Veritas MCP server listening on stdio");
