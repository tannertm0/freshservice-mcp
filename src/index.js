#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FreshserviceClient } from "./freshservice-client.js";
import { registerTicketTools } from "./tools/tickets.js";
import { registerAssetTools } from "./tools/assets.js";
import { registerPeopleTools } from "./tools/people.js";
import { registerTicketTaskTools } from "./tools/ticket-tasks.js";
import { registerTimeEntryTools } from "./tools/time-entries.js";
import { registerChangeTools } from "./tools/changes.js";
import { registerProblemTools } from "./tools/problems.js";
import { registerServiceCatalogTools } from "./tools/service-catalog.js";
import { registerKnowledgeBaseTools } from "./tools/knowledge-base.js";

const domain = process.env.FRESHSERVICE_DOMAIN;
const apiKey = process.env.FRESHSERVICE_API_KEY;

if (!domain || !apiKey) {
  console.error(
    "Error: FRESHSERVICE_DOMAIN and FRESHSERVICE_API_KEY environment variables are required.\n" +
      "  FRESHSERVICE_DOMAIN = your Freshservice subdomain (e.g. 'acmeinc' for acmeinc.freshservice.com)\n" +
      "  FRESHSERVICE_API_KEY = your Freshservice API key"
  );
  process.exit(1);
}

const client = new FreshserviceClient(domain, apiKey);

const server = new McpServer({
  name: "freshservice-mcp",
  version: "1.0.0",
});

registerTicketTools(server, client);
registerAssetTools(server, client);
registerPeopleTools(server, client);
registerTicketTaskTools(server, client);
registerTimeEntryTools(server, client);
registerChangeTools(server, client);
registerProblemTools(server, client);
registerServiceCatalogTools(server, client);
registerKnowledgeBaseTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
