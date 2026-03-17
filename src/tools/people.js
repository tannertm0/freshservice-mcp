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

export function getPeopleTools() {
  return [
    {
      name: "list_requesters",
      description: "List Freshservice requesters (end users)",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number" },
          per_page: { type: "number", maximum: 100 },
          email: { type: "string", description: "Filter by email" },
        },
      },
    },
    {
      name: "get_requester",
      description: "Get details of a specific requester",
      inputSchema: {
        type: "object",
        properties: {
          requester_id: { type: "number", description: "The requester ID" },
        },
        required: ["requester_id"],
      },
    },
    {
      name: "list_agents",
      description: "List Freshservice agents (support staff)",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number" },
          per_page: { type: "number", maximum: 100 },
          email: { type: "string", description: "Filter by email" },
          active: { type: "boolean", description: "Filter by active status" },
        },
      },
    },
    {
      name: "get_agent",
      description: "Get details of a specific agent",
      inputSchema: {
        type: "object",
        properties: {
          agent_id: { type: "number", description: "The agent ID" },
        },
        required: ["agent_id"],
      },
    },
    {
      name: "list_groups",
      description: "List Freshservice agent groups",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number" },
          per_page: { type: "number", maximum: 100 },
        },
      },
    },
    {
      name: "get_group",
      description: "Get details of a specific agent group",
      inputSchema: {
        type: "object",
        properties: {
          group_id: { type: "number", description: "The group ID" },
        },
        required: ["group_id"],
      },
    },
    {
      name: "list_departments",
      description: "List Freshservice departments",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number" },
          per_page: { type: "number", maximum: 100 },
        },
      },
    },
    {
      name: "get_department",
      description: "Get details of a specific department",
      inputSchema: {
        type: "object",
        properties: {
          department_id: { type: "number", description: "The department ID" },
        },
        required: ["department_id"],
      },
    },
  ];
}

export function handlePeopleTool(name, args, client) {
  switch (name) {
    case "list_requesters":
      return handleListRequesters(args, client);
    case "get_requester":
      return handleGetRequester(args, client);
    case "list_agents":
      return handleListAgents(args, client);
    case "get_agent":
      return handleGetAgent(args, client);
    case "list_groups":
      return handleListGroups(args, client);
    case "get_group":
      return handleGetGroup(args, client);
    case "list_departments":
      return handleListDepartments(args, client);
    case "get_department":
      return handleGetDepartment(args, client);
    default:
      return null;
  }
}

async function handleListRequesters(args, client) {
  const result = await client.listRequesters(args);
  const items = result.requesters || [];
  if (items.length === 0) {
    return { content: [{ type: "text", text: "No requesters found." }] };
  }
  return {
    content: [{ type: "text", text: `Found ${items.length} requester(s):\n\n${items.map(formatRequester).join("\n\n")}` }],
  };
}

async function handleGetRequester({ requester_id }, client) {
  const result = await client.getRequester(requester_id);
  return { content: [{ type: "text", text: formatRequester(result.requester) }] };
}

async function handleListAgents(args, client) {
  const result = await client.listAgents(args);
  const items = result.agents || [];
  if (items.length === 0) {
    return { content: [{ type: "text", text: "No agents found." }] };
  }
  return {
    content: [{ type: "text", text: `Found ${items.length} agent(s):\n\n${items.map(formatAgent).join("\n\n")}` }],
  };
}

async function handleGetAgent({ agent_id }, client) {
  const result = await client.getAgent(agent_id);
  return { content: [{ type: "text", text: formatAgent(result.agent) }] };
}

async function handleListGroups(args, client) {
  const result = await client.listGroups(args);
  const items = result.groups || [];
  if (items.length === 0) {
    return { content: [{ type: "text", text: "No groups found." }] };
  }
  return {
    content: [{ type: "text", text: `Found ${items.length} group(s):\n\n${items.map(formatGroup).join("\n")}` }],
  };
}

async function handleGetGroup({ group_id }, client) {
  const result = await client.getGroup(group_id);
  const g = result.group;
  const text = [
    formatGroup(g),
    `  Members: ${JSON.stringify(g.members || [])}`,
  ].join("\n");
  return { content: [{ type: "text", text }] };
}

async function handleListDepartments(args, client) {
  const result = await client.listDepartments(args);
  const items = result.departments || [];
  if (items.length === 0) {
    return { content: [{ type: "text", text: "No departments found." }] };
  }
  return {
    content: [{ type: "text", text: `Found ${items.length} department(s):\n\n${items.map(formatDepartment).join("\n")}` }],
  };
}

async function handleGetDepartment({ department_id }, client) {
  const result = await client.getDepartment(department_id);
  return { content: [{ type: "text", text: formatDepartment(result.department) }] };
}
