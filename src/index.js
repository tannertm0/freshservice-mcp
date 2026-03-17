#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { FreshserviceClient } from "./freshservice-client.js";
import { getTicketTools, handleTicketTool } from "./tools/tickets.js";
import { getAssetTools, handleAssetTool } from "./tools/assets.js";
import { getPeopleTools, handlePeopleTool } from "./tools/people.js";

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

const server = new Server(
  { name: "freshservice-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const allTools = [
  ...getTicketTools(),
  ...getAssetTools(),
  ...getPeopleTools(),
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const result =
    (await handleTicketTool(name, args, client)) ||
    (await handleAssetTool(name, args, client)) ||
    (await handlePeopleTool(name, args, client));

  if (!result) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return result;
});

const transport = new StdioServerTransport();
await server.connect(transport);
