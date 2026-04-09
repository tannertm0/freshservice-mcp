import { z } from "zod";

const PRIORITY_MAP = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent" };
const STATUS_MAP = { 1: "Open", 2: "Planning", 3: "Awaiting Approval", 4: "Pending Release", 5: "Pending Review", 6: "Closed" };
const CHANGE_TYPE_MAP = { 1: "Minor", 2: "Standard", 3: "Major", 4: "Emergency" };
const RISK_MAP = { 1: "Low", 2: "Medium", 3: "High", 4: "Very High" };

function formatChange(c) {
  return [
    `#${c.id} — ${c.subject}`,
    `  Status: ${STATUS_MAP[c.status] || c.status} | Priority: ${PRIORITY_MAP[c.priority] || c.priority}`,
    `  Type: ${CHANGE_TYPE_MAP[c.change_type] || c.change_type} | Risk: ${RISK_MAP[c.risk] || c.risk || "N/A"}`,
    `  Requester: ${c.requester_id} | Agent: ${c.agent_id || "Unassigned"}`,
    `  Planned Start: ${c.planned_start_date || "N/A"} | Planned End: ${c.planned_end_date || "N/A"}`,
    `  Created: ${c.created_at}`,
  ].join("\n");
}

export function registerChangeTools(server, client) {
  server.tool(
    "list_changes",
    "List Freshservice change requests",
    {
      page: z.number().optional().describe("Page number"),
      per_page: z.number().max(100).optional().describe("Results per page"),
      filter: z.enum(["my_open", "unassigned", "all", "my_approvals", "deleted"]).optional(),
      order_by: z.enum(["created_at", "updated_at"]).optional(),
      order_type: z.enum(["asc", "desc"]).optional(),
    },
    async (args) => {
      const result = await client.listChanges(args);
      const changes = result.changes || [];
      if (changes.length === 0) {
        return { content: [{ type: "text", text: "No changes found." }] };
      }
      const text = changes.map(formatChange).join("\n\n");
      return {
        content: [{ type: "text", text: `Found ${changes.length} change(s):\n\n${text}` }],
      };
    }
  );

  server.tool(
    "get_change",
    "Get details of a specific change request",
    {
      change_id: z.number().describe("The change ID"),
    },
    async ({ change_id }) => {
      const result = await client.getChange(change_id);
      const c = result.change;
      const text = [
        formatChange(c),
        `  Description:\n${c.description_text || c.description || "N/A"}`,
        `  Impact: ${c.impact || "N/A"}`,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "create_change",
    "Create a new Freshservice change request",
    {
      subject: z.string().describe("Change subject"),
      description: z.string().describe("Change description (HTML supported)"),
      requester_id: z.number().describe("Requester ID"),
      priority: z.number().min(1).max(4).optional().describe("1=Low, 2=Medium, 3=High, 4=Urgent"),
      status: z.number().min(1).max(6).optional().describe("1=Open, 2=Planning, 3=Awaiting Approval, 4=Pending Release, 5=Pending Review, 6=Closed"),
      change_type: z.number().min(1).max(4).optional().describe("1=Minor, 2=Standard, 3=Major, 4=Emergency"),
      risk: z.number().min(1).max(4).optional().describe("1=Low, 2=Medium, 3=High, 4=Very High"),
      impact: z.number().min(1).max(3).optional().describe("1=Low, 2=Medium, 3=High"),
      agent_id: z.number().optional().describe("Assign to agent"),
      group_id: z.number().optional().describe("Assign to group"),
      department_id: z.number().optional().describe("Department ID"),
      planned_start_date: z.string().optional().describe("Planned start (ISO 8601)"),
      planned_end_date: z.string().optional().describe("Planned end (ISO 8601)"),
    },
    async (args) => {
      const result = await client.createChange(args);
      const c = result.change;
      return {
        content: [{ type: "text", text: `Change created successfully!\n\n${formatChange(c)}` }],
      };
    }
  );

  server.tool(
    "update_change",
    "Update an existing Freshservice change request",
    {
      change_id: z.number().describe("The change ID to update"),
      subject: z.string().optional(),
      description: z.string().optional(),
      priority: z.number().min(1).max(4).optional(),
      status: z.number().min(1).max(6).optional(),
      change_type: z.number().min(1).max(4).optional(),
      risk: z.number().min(1).max(4).optional(),
      impact: z.number().min(1).max(3).optional(),
      agent_id: z.number().optional(),
      group_id: z.number().optional(),
      planned_start_date: z.string().optional(),
      planned_end_date: z.string().optional(),
    },
    async ({ change_id, ...updates }) => {
      const result = await client.updateChange(change_id, updates);
      const c = result.change;
      return {
        content: [{ type: "text", text: `Change updated!\n\n${formatChange(c)}` }],
      };
    }
  );

  server.tool(
    "delete_change",
    "Delete a Freshservice change request",
    {
      change_id: z.number().describe("The change ID to delete"),
    },
    async ({ change_id }) => {
      await client.deleteChange(change_id);
      return {
        content: [{ type: "text", text: `Change #${change_id} deleted successfully.` }],
      };
    }
  );
}
