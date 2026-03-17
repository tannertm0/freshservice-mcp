function formatAsset(a) {
  return [
    `#${a.display_id} — ${a.name}`,
    `  Type: ${a.asset_type_id} | State: ${a.ci_type_id || "N/A"}`,
    `  Assigned To: ${a.user_id || "Unassigned"} | Department: ${a.department_id || "N/A"}`,
    `  Created: ${a.created_at}`,
  ].join("\n");
}

export function getAssetTools() {
  return [
    {
      name: "list_assets",
      description: "List Freshservice assets/configuration items",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", description: "Page number" },
          per_page: { type: "number", maximum: 100, description: "Results per page" },
        },
      },
    },
    {
      name: "get_asset",
      description: "Get details of a specific asset",
      inputSchema: {
        type: "object",
        properties: {
          display_id: { type: "number", description: "The asset display ID" },
        },
        required: ["display_id"],
      },
    },
    {
      name: "create_asset",
      description: "Create a new Freshservice asset",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Asset name" },
          asset_type_id: { type: "number", description: "Asset type ID" },
          description: { type: "string", description: "Asset description" },
          user_id: { type: "number", description: "Assign to user ID" },
          department_id: { type: "number", description: "Department ID" },
          location_id: { type: "number", description: "Location ID" },
          asset_tag: { type: "string", description: "Asset tag" },
        },
        required: ["name", "asset_type_id"],
      },
    },
    {
      name: "update_asset",
      description: "Update an existing Freshservice asset",
      inputSchema: {
        type: "object",
        properties: {
          display_id: { type: "number", description: "The asset display ID to update" },
          name: { type: "string" },
          description: { type: "string" },
          user_id: { type: "number" },
          department_id: { type: "number" },
          location_id: { type: "number" },
          asset_tag: { type: "string" },
        },
        required: ["display_id"],
      },
    },
    {
      name: "delete_asset",
      description: "Delete a Freshservice asset",
      inputSchema: {
        type: "object",
        properties: {
          display_id: { type: "number", description: "The asset display ID to delete" },
        },
        required: ["display_id"],
      },
    },
  ];
}

export function handleAssetTool(name, args, client) {
  switch (name) {
    case "list_assets":
      return handleListAssets(args, client);
    case "get_asset":
      return handleGetAsset(args, client);
    case "create_asset":
      return handleCreateAsset(args, client);
    case "update_asset":
      return handleUpdateAsset(args, client);
    case "delete_asset":
      return handleDeleteAsset(args, client);
    default:
      return null;
  }
}

async function handleListAssets(args, client) {
  const result = await client.listAssets(args);
  const assets = result.assets || [];
  if (assets.length === 0) {
    return { content: [{ type: "text", text: "No assets found." }] };
  }
  const text = assets.map(formatAsset).join("\n\n");
  return { content: [{ type: "text", text: `Found ${assets.length} asset(s):\n\n${text}` }] };
}

async function handleGetAsset({ display_id }, client) {
  const result = await client.getAsset(display_id);
  const a = result.asset;
  const text = [
    formatAsset(a),
    `  Description: ${a.description || "N/A"}`,
    `  Impact: ${a.impact || "N/A"}`,
    a.type_fields ? `  Fields: ${JSON.stringify(a.type_fields, null, 2)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return { content: [{ type: "text", text }] };
}

async function handleCreateAsset(args, client) {
  const result = await client.createAsset(args);
  const a = result.asset;
  return { content: [{ type: "text", text: `Asset created successfully!\n\n${formatAsset(a)}` }] };
}

async function handleUpdateAsset({ display_id, ...updates }, client) {
  const result = await client.updateAsset(display_id, updates);
  const a = result.asset;
  return { content: [{ type: "text", text: `Asset updated successfully!\n\n${formatAsset(a)}` }] };
}

async function handleDeleteAsset({ display_id }, client) {
  await client.deleteAsset(display_id);
  return { content: [{ type: "text", text: `Asset #${display_id} deleted successfully.` }] };
}
