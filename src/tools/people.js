import { z } from "zod";

function formatRequester(r) {
  return [
    `#${r.id} — ${r.first_name} ${r.last_name || ""}`.trim(),
    `  Email: ${r.primary_email || "N/A"} | Phone: ${r.work_phone_number || r.mobile_phone_number || "N/A"}`,
    `  Department: ${r.department_ids?.join(", ") || "N/A"} | Active: ${r.active}`,
  ].join("\n");
}

function formatAgent(a) {
  return [
    `#${a.id} — ${a.first_name} ${a.last_name || ""}`.trim(),
    `  Email: ${a.email || "N/A"} | Active: ${a.active}`,
    `  Role IDs: ${a.role_ids?.join(", ") || "N/A"} | Group IDs: ${a.group_ids?.join(", ") || "N/A"}`,
  ].join("\n");
}

function formatGroup(g) {
  return `#${g.id} — ${g.name} | Description: ${g.description || "N/A"} | Members: ${g.members?.length || 0}`;
}

function formatDepartment(d) {
  return `#${d.id} — ${d.name} | Description: ${d.description || "N/A"} | Head: ${d.head_user_id || "N/A"}`;
}

export function registerPeopleTools(server, client) {
  // Requesters
  server.tool(
    "list_requesters",
    "List Freshservice requesters (end users)",
    {
      page: z.number().optional(),
      per_page: z.number().max(100).optional(),
      email: z.string().optional().describe("Filter by email"),
    },
    async (args) => {
      const result = await client.listRequesters(args);
      const items = result.requesters || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No requesters found." }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `Found ${items.length} requester(s):\n\n${items.map(formatRequester).join("\n\n")}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_requester",
    "Get details of a specific requester",
    { requester_id: z.number().describe("The requester ID") },
    async ({ requester_id }) => {
      const result = await client.getRequester(requester_id);
      return {
        content: [{ type: "text", text: formatRequester(result.requester) }],
      };
    }
  );

  // Agents
  server.tool(
    "list_agents",
    "List Freshservice agents (support staff)",
    {
      page: z.number().optional(),
      per_page: z.number().max(100).optional(),
      email: z.string().optional().describe("Filter by email"),
      active: z.boolean().optional().describe("Filter by active status"),
    },
    async (args) => {
      const result = await client.listAgents(args);
      const items = result.agents || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No agents found." }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `Found ${items.length} agent(s):\n\n${items.map(formatAgent).join("\n\n")}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_agent",
    "Get details of a specific agent",
    { agent_id: z.number().describe("The agent ID") },
    async ({ agent_id }) => {
      const result = await client.getAgent(agent_id);
      return {
        content: [{ type: "text", text: formatAgent(result.agent) }],
      };
    }
  );

  // Groups
  server.tool(
    "list_groups",
    "List Freshservice agent groups",
    {
      page: z.number().optional(),
      per_page: z.number().max(100).optional(),
    },
    async (args) => {
      const result = await client.listGroups(args);
      const items = result.groups || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No groups found." }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `Found ${items.length} group(s):\n\n${items.map(formatGroup).join("\n")}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_group",
    "Get details of a specific agent group",
    { group_id: z.number().describe("The group ID") },
    async ({ group_id }) => {
      const result = await client.getGroup(group_id);
      const g = result.group;
      const text = [
        formatGroup(g),
        `  Members: ${JSON.stringify(g.members || [])}`,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  // Departments
  server.tool(
    "list_departments",
    "List Freshservice departments",
    {
      page: z.number().optional(),
      per_page: z.number().max(100).optional(),
    },
    async (args) => {
      const result = await client.listDepartments(args);
      const items = result.departments || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No departments found." }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `Found ${items.length} department(s):\n\n${items.map(formatDepartment).join("\n")}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_department",
    "Get details of a specific department",
    { department_id: z.number().describe("The department ID") },
    async ({ department_id }) => {
      const result = await client.getDepartment(department_id);
      return {
        content: [{ type: "text", text: formatDepartment(result.department) }],
      };
    }
  );
}
