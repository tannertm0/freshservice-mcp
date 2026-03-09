import { z } from "zod";

function formatAsset(a) {
  return [
    `#${a.display_id} — ${a.name}`,
    `  Type: ${a.asset_type_id} | State: ${a.ci_type_id || "N/A"}`,
    `  Assigned To: ${a.user_id || "Unassigned"} | Department: ${a.department_id || "N/A"}`,
    `  Created: ${a.created_at}`,
  ].join("\n");
}

export function registerAssetTools(server, client) {
  server.tool(
    "list_assets",
    "List Freshservice assets/configuration items",
    {
      page: z.number().optional().describe("Page number"),
      per_page: z.number().max(100).optional().describe("Results per page"),
    },
    async (args) => {
      const result = await client.listAssets(args);
      const assets = result.assets || [];
      if (assets.length === 0) {
        return { content: [{ type: "text", text: "No assets found." }] };
      }
      const text = assets.map(formatAsset).join("\n\n");
      return {
        content: [
          { type: "text", text: `Found ${assets.length} asset(s):\n\n${text}` },
        ],
      };
    }
  );

  server.tool(
    "get_asset",
    "Get details of a specific asset",
    {
      display_id: z.number().describe("The asset display ID"),
    },
    async ({ display_id }) => {
      const result = await client.getAsset(display_id);
      const a = result.asset;
      const text = [
        formatAsset(a),
        `  Description: ${a.description || "N/A"}`,
        `  Impact: ${a.impact || "N/A"}`,
        a.type_fields
          ? `  Fields: ${JSON.stringify(a.type_fields, null, 2)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "create_asset",
    "Create a new Freshservice asset",
    {
      name: z.string().describe("Asset name"),
      asset_type_id: z.number().describe("Asset type ID"),
      description: z.string().optional().describe("Asset description"),
      user_id: z.number().optional().describe("Assign to user ID"),
      department_id: z.number().optional().describe("Department ID"),
      location_id: z.number().optional().describe("Location ID"),
      asset_tag: z.string().optional().describe("Asset tag"),
    },
    async (args) => {
      const result = await client.createAsset(args);
      const a = result.asset;
      return {
        content: [
          { type: "text", text: `Asset created successfully!\n\n${formatAsset(a)}` },
        ],
      };
    }
  );

  server.tool(
    "update_asset",
    "Update an existing Freshservice asset",
    {
      display_id: z.number().describe("The asset display ID to update"),
      name: z.string().optional(),
      description: z.string().optional(),
      user_id: z.number().optional(),
      department_id: z.number().optional(),
      location_id: z.number().optional(),
      asset_tag: z.string().optional(),
    },
    async ({ display_id, ...updates }) => {
      const result = await client.updateAsset(display_id, updates);
      const a = result.asset;
      return {
        content: [
          { type: "text", text: `Asset updated successfully!\n\n${formatAsset(a)}` },
        ],
      };
    }
  );

  server.tool(
    "delete_asset",
    "Delete a Freshservice asset",
    {
      display_id: z.number().describe("The asset display ID to delete"),
    },
    async ({ display_id }) => {
      await client.deleteAsset(display_id);
      return {
        content: [
          { type: "text", text: `Asset #${display_id} deleted successfully.` },
        ],
      };
    }
  );
}
