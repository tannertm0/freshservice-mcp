const PRIORITY_MAP = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent" };
const STATUS_MAP = { 2: "Open", 3: "Pending", 4: "Resolved", 5: "Closed" };

function formatTicket(t) {
  return [
    `#${t.id} — ${t.subject}`,
    `  Status: ${STATUS_MAP[t.status] || t.status} | Priority: ${PRIORITY_MAP[t.priority] || t.priority}`,
    `  Requester: ${t.requester_id} | Group: ${t.group_id || "Unassigned"}`,
    `  Created: ${t.created_at} | Updated: ${t.updated_at}`,
  ].join("\n");
}

export function getTicketTools() {
  return [
    {
      name: "list_tickets",
      description: "List Freshservice tickets with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", description: "Page number (starts at 1)" },
          per_page: { type: "number", maximum: 100, description: "Results per page (max 100)" },
          filter: {
            type: "string",
            enum: ["new_and_my_open", "watching", "spam", "deleted"],
            description: "Predefined filter",
          },
          requester_id: { type: "number", description: "Filter by requester ID" },
          email: { type: "string", description: "Filter by requester email" },
          updated_since: { type: "string", description: "Filter tickets updated since (ISO 8601)" },
          order_by: { type: "string", enum: ["created_at", "due_by", "updated_at", "status"] },
          order_type: { type: "string", enum: ["asc", "desc"] },
        },
      },
    },
    {
      name: "get_ticket",
      description: "Get details of a specific Freshservice ticket",
      inputSchema: {
        type: "object",
        properties: {
          ticket_id: { type: "number", description: "The ticket ID" },
        },
        required: ["ticket_id"],
      },
    },
    {
      name: "create_ticket",
      description: "Create a new Freshservice ticket",
      inputSchema: {
        type: "object",
        properties: {
          subject: { type: "string", description: "Ticket subject" },
          description: { type: "string", description: "Ticket description (HTML supported)" },
          email: { type: "string", description: "Requester email (required if requester_id not provided)" },
          requester_id: { type: "number", description: "Requester ID (required if email not provided)" },
          priority: { type: "number", minimum: 1, maximum: 4, description: "1=Low, 2=Medium, 3=High, 4=Urgent" },
          status: { type: "number", minimum: 2, maximum: 5, description: "2=Open, 3=Pending, 4=Resolved, 5=Closed" },
          type: { type: "string", description: "Ticket type (Incident, Service Request, etc.)" },
          group_id: { type: "number", description: "Assign to agent group" },
          agent_id: { type: "number", description: "Assign to specific agent" },
          department_id: { type: "number", description: "Department ID" },
          category: { type: "string", description: "Ticket category" },
          sub_category: { type: "string", description: "Ticket sub-category" },
          cc_emails: { type: "array", items: { type: "string" }, description: "CC email addresses" },
          tags: { type: "array", items: { type: "string" }, description: "Tags" },
        },
        required: ["subject", "description"],
      },
    },
    {
      name: "update_ticket",
      description: "Update an existing Freshservice ticket",
      inputSchema: {
        type: "object",
        properties: {
          ticket_id: { type: "number", description: "The ticket ID to update" },
          subject: { type: "string", description: "Updated subject" },
          description: { type: "string", description: "Updated description" },
          priority: { type: "number", minimum: 1, maximum: 4, description: "Updated priority" },
          status: { type: "number", minimum: 2, maximum: 5, description: "Updated status" },
          group_id: { type: "number", description: "Reassign to group" },
          agent_id: { type: "number", description: "Reassign to agent" },
          type: { type: "string", description: "Updated ticket type" },
          category: { type: "string" },
          sub_category: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["ticket_id"],
      },
    },
    {
      name: "delete_ticket",
      description: "Delete a Freshservice ticket (moves to trash)",
      inputSchema: {
        type: "object",
        properties: {
          ticket_id: { type: "number", description: "The ticket ID to delete" },
        },
        required: ["ticket_id"],
      },
    },
    {
      name: "reply_to_ticket",
      description: "Reply to a Freshservice ticket",
      inputSchema: {
        type: "object",
        properties: {
          ticket_id: { type: "number", description: "The ticket ID" },
          body: { type: "string", description: "Reply body (HTML supported)" },
          cc_emails: { type: "array", items: { type: "string" }, description: "CC emails" },
          bcc_emails: { type: "array", items: { type: "string" }, description: "BCC emails" },
        },
        required: ["ticket_id", "body"],
      },
    },
    {
      name: "add_note_to_ticket",
      description: "Add a note to a Freshservice ticket",
      inputSchema: {
        type: "object",
        properties: {
          ticket_id: { type: "number", description: "The ticket ID" },
          body: { type: "string", description: "Note body (HTML supported)" },
          private: { type: "boolean", description: "Private note (default: true)" },
        },
        required: ["ticket_id", "body"],
      },
    },
    {
      name: "get_ticket_conversations",
      description: "Get all conversations (replies and notes) for a ticket",
      inputSchema: {
        type: "object",
        properties: {
          ticket_id: { type: "number", description: "The ticket ID" },
        },
        required: ["ticket_id"],
      },
    },
    {
      name: "search_tickets",
      description: "Search/filter Freshservice tickets using a query string",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: 'Freshservice filter query, e.g. "priority:4 AND status:2" or "agent_id:123"',
          },
        },
        required: ["query"],
      },
    },
  ];
}

export function handleTicketTool(name, args, client) {
  switch (name) {
    case "list_tickets":
      return handleListTickets(args, client);
    case "get_ticket":
      return handleGetTicket(args, client);
    case "create_ticket":
      return handleCreateTicket(args, client);
    case "update_ticket":
      return handleUpdateTicket(args, client);
    case "delete_ticket":
      return handleDeleteTicket(args, client);
    case "reply_to_ticket":
      return handleReplyToTicket(args, client);
    case "add_note_to_ticket":
      return handleAddNoteToTicket(args, client);
    case "get_ticket_conversations":
      return handleGetTicketConversations(args, client);
    case "search_tickets":
      return handleSearchTickets(args, client);
    default:
      return null;
  }
}

async function handleListTickets(args, client) {
  const result = await client.listTickets(args);
  const tickets = result.tickets || [];
  if (tickets.length === 0) {
    return { content: [{ type: "text", text: "No tickets found." }] };
  }
  const text = tickets.map(formatTicket).join("\n\n");
  return { content: [{ type: "text", text: `Found ${tickets.length} ticket(s):\n\n${text}` }] };
}

async function handleGetTicket({ ticket_id }, client) {
  const result = await client.getTicket(ticket_id);
  const t = result.ticket;
  const detail = [
    formatTicket(t),
    `  Source: ${t.source} | Type: ${t.type || "N/A"}`,
    `  Description:\n${t.description_text || t.description || "N/A"}`,
  ].join("\n");
  return { content: [{ type: "text", text: detail }] };
}

async function handleCreateTicket(args, client) {
  const result = await client.createTicket(args);
  const t = result.ticket;
  return { content: [{ type: "text", text: `Ticket created successfully!\n\n${formatTicket(t)}` }] };
}

async function handleUpdateTicket({ ticket_id, ...updates }, client) {
  const result = await client.updateTicket(ticket_id, updates);
  const t = result.ticket;
  return { content: [{ type: "text", text: `Ticket updated successfully!\n\n${formatTicket(t)}` }] };
}

async function handleDeleteTicket({ ticket_id }, client) {
  await client.deleteTicket(ticket_id);
  return { content: [{ type: "text", text: `Ticket #${ticket_id} deleted successfully.` }] };
}

async function handleReplyToTicket({ ticket_id, ...replyData }, client) {
  await client.replyToTicket(ticket_id, replyData);
  return { content: [{ type: "text", text: `Reply sent to ticket #${ticket_id} successfully.` }] };
}

async function handleAddNoteToTicket({ ticket_id, ...noteData }, client) {
  await client.addNoteToTicket(ticket_id, noteData);
  return { content: [{ type: "text", text: `Note added to ticket #${ticket_id} successfully.` }] };
}

async function handleGetTicketConversations({ ticket_id }, client) {
  const result = await client.getTicketConversations(ticket_id);
  const convos = result.conversations || [];
  if (convos.length === 0) {
    return { content: [{ type: "text", text: `No conversations found for ticket #${ticket_id}.` }] };
  }
  const text = convos
    .map(
      (c) =>
        `[${c.created_at}] ${c.private ? "(Private)" : "(Public)"} From: ${c.from_email || "Agent"}\n${c.body_text || c.body || ""}`
    )
    .join("\n---\n");
  return { content: [{ type: "text", text: `Conversations for ticket #${ticket_id}:\n\n${text}` }] };
}

async function handleSearchTickets({ query }, client) {
  const result = await client.filterTickets(query);
  const tickets = result.tickets || [];
  if (tickets.length === 0) {
    return { content: [{ type: "text", text: "No tickets matched the query." }] };
  }
  const text = tickets.map(formatTicket).join("\n\n");
  return { content: [{ type: "text", text: `Found ${tickets.length} ticket(s):\n\n${text}` }] };
}
