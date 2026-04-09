import { z } from "zod";

function formatCatalogItem(item) {
  return [
    `#${item.id} — ${item.name}`,
    `  Category: ${item.category_id || "N/A"} | Visibility: ${item.visibility || "N/A"}`,
    `  Short Description: ${item.short_description || "N/A"}`,
    `  Created: ${item.created_at}`,
  ].join("\n");
}

export function registerServiceCatalogTools(server, client) {
  server.tool(
    "list_service_catalog_items",
    "List items in the Freshservice service catalog",
    {
      page: z.number().optional().describe("Page number"),
      per_page: z.number().max(100).optional().describe("Results per page"),
    },
    async (args) => {
      const result = await client.listServiceCatalogItems(args);
      const items = result.service_items || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No service catalog items found." }] };
      }
      const text = items.map(formatCatalogItem).join("\n\n");
      return {
        content: [{ type: "text", text: `Found ${items.length} catalog item(s):\n\n${text}` }],
      };
    }
  );

  server.tool(
    "get_service_catalog_item",
    "Get details of a specific service catalog item",
    {
      item_id: z.number().describe("The service catalog item ID"),
    },
    async ({ item_id }) => {
      const result = await client.getServiceCatalogItem(item_id);
      const item = result.service_item;
      const text = [
        formatCatalogItem(item),
        `  Description: ${item.description || "N/A"}`,
        `  Delivery Time: ${item.delivery_time || "N/A"} hours`,
        item.custom_fields ? `  Custom Fields: ${JSON.stringify(item.custom_fields, null, 2)}` : "",
      ].filter(Boolean).join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "place_service_request",
    "Place a service request from the Freshservice catalog",
    {
      item_id: z.number().describe("The service catalog item ID"),
      quantity: z.number().optional().describe("Quantity requested (default 1)"),
      email: z.string().optional().describe("Requester email"),
      custom_fields: z.record(z.unknown()).optional().describe("Custom field values as key-value pairs"),
    },
    async ({ item_id, ...requestData }) => {
      const result = await client.placeServiceRequest(item_id, requestData);
      const sr = result.service_request;
      return {
        content: [{
          type: "text",
          text: `Service request placed successfully!\n\n  Request ID: ${sr.id}\n  Subject: ${sr.subject || "N/A"}\n  Status: ${sr.status || "N/A"}`,
        }],
      };
    }
  );
}
