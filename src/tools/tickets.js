import { z } from "zod";

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

export function registerTicketTools(server, client) {
  server.tool(
    "list_tickets",
    "List Freshservice tickets with optional filters",
    {
      page: z.number().optional().describe("Page number (starts at 1)"),
      per_page: z
        .number()
        .max(100)
        .optional()
        .describe("Results per page (max 100)"),
      filter: z
        .enum([
          "new_and_my_open",
          "watching",
          "spam",
          "deleted",
        ])
        .optional()
        .describe("Predefined filter"),
      requester_id: z.number().optional().describe("Filter by requester ID"),
      email: z.string().optional().describe("Filter by requester email"),
      updated_since: z
        .string()
        .optional()
        .describe("Filter tickets updated since (ISO 8601)"),
      order_by: z
        .enum(["created_at", "due_by", "updated_at", "status"])
        .optional(),
      order_type: z.enum(["asc", "desc"]).optional(),
    },
    async (args) => {
      const result = await client.listTickets(args);
      const tickets = result.tickets || [];
      if (tickets.length === 0) {
        return { content: [{ type: "text", text: "No tickets found." }] };
      }
      const text = tickets.map(formatTicket).join("\n\n");
      return {
        content: [
          {
            type: "text",
            text: `Found ${tickets.length} ticket(s):\n\n${text}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_ticket",
    "Get details of a specific Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
    },
    async ({ ticket_id }) => {
      const result = await client.getTicket(ticket_id);
      const t = result.ticket;
      const detail = [
        formatTicket(t),
        `  Source: ${t.source} | Type: ${t.type || "N/A"}`,
        `  Description:\n${t.description_text || t.description || "N/A"}`,
      ].join("\n");
      return { content: [{ type: "text", text: detail }] };
    }
  );

  server.tool(
    "create_ticket",
    "Create a new Freshservice ticket",
    {
      subject: z.string().describe("Ticket subject"),
      description: z.string().describe("Ticket description (HTML supported)"),
      email: z
        .string()
        .optional()
        .describe("Requester email (required if requester_id not provided)"),
      requester_id: z
        .number()
        .optional()
        .describe("Requester ID (required if email not provided)"),
      priority: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .describe("1=Low, 2=Medium, 3=High, 4=Urgent"),
      status: z
        .number()
        .min(2)
        .max(5)
        .optional()
        .describe("2=Open, 3=Pending, 4=Resolved, 5=Closed"),
      type: z
        .string()
        .optional()
        .describe("Ticket type (Incident, Service Request, etc.)"),
      group_id: z.number().optional().describe("Assign to agent group"),
      agent_id: z.number().optional().describe("Assign to specific agent"),
      department_id: z.number().optional().describe("Department ID"),
      category: z.string().optional().describe("Ticket category"),
      sub_category: z.string().optional().describe("Ticket sub-category"),
      cc_emails: z
        .array(z.string())
        .optional()
        .describe("CC email addresses"),
      tags: z.array(z.string()).optional().describe("Tags"),
    },
    async (args) => {
      const result = await client.createTicket(args);
      const t = result.ticket;
      return {
        content: [
          {
            type: "text",
            text: `Ticket created successfully!\n\n${formatTicket(t)}`,
          },
        ],
      };
    }
  );

  server.tool(
    "update_ticket",
    "Update an existing Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID to update"),
      subject: z.string().optional().describe("Updated subject"),
      description: z.string().optional().describe("Updated description"),
      priority: z.number().min(1).max(4).optional().describe("Updated priority"),
      status: z.number().min(2).max(5).optional().describe("Updated status"),
      group_id: z.number().optional().describe("Reassign to group"),
      agent_id: z.number().optional().describe("Reassign to agent"),
      type: z.string().optional().describe("Updated ticket type"),
      category: z.string().optional(),
      sub_category: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ ticket_id, ...updates }) => {
      const result = await client.updateTicket(ticket_id, updates);
      const t = result.ticket;
      return {
        content: [
          {
            type: "text",
            text: `Ticket updated successfully!\n\n${formatTicket(t)}`,
          },
        ],
      };
    }
  );

  server.tool(
    "delete_ticket",
    "Delete a Freshservice ticket (moves to trash)",
    {
      ticket_id: z.number().describe("The ticket ID to delete"),
    },
    async ({ ticket_id }) => {
      await client.deleteTicket(ticket_id);
      return {
        content: [
          { type: "text", text: `Ticket #${ticket_id} deleted successfully.` },
        ],
      };
    }
  );

  server.tool(
    "reply_to_ticket",
    "Reply to a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      body: z.string().describe("Reply body (HTML supported)"),
      cc_emails: z.array(z.string()).optional().describe("CC emails"),
      bcc_emails: z.array(z.string()).optional().describe("BCC emails"),
    },
    async ({ ticket_id, ...replyData }) => {
      await client.replyToTicket(ticket_id, replyData);
      return {
        content: [
          {
            type: "text",
            text: `Reply sent to ticket #${ticket_id} successfully.`,
          },
        ],
      };
    }
  );

  server.tool(
    "add_note_to_ticket",
    "Add a note to a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      body: z.string().describe("Note body (HTML supported)"),
      private: z
        .boolean()
        .optional()
        .describe("Private note (default: true)"),
    },
    async ({ ticket_id, ...noteData }) => {
      await client.addNoteToTicket(ticket_id, noteData);
      return {
        content: [
          {
            type: "text",
            text: `Note added to ticket #${ticket_id} successfully.`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_ticket_conversations",
    "Get all conversations (replies and notes) for a ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
    },
    async ({ ticket_id }) => {
      const result = await client.getTicketConversations(ticket_id);
      const convos = result.conversations || [];
      if (convos.length === 0) {
        return {
          content: [
            { type: "text", text: `No conversations found for ticket #${ticket_id}.` },
          ],
        };
      }
      const text = convos
        .map(
          (c) =>
            `[${c.created_at}] ${c.private ? "(Private)" : "(Public)"} From: ${c.from_email || "Agent"}\n${c.body_text || c.body || ""}`
        )
        .join("\n---\n");
      return {
        content: [
          {
            type: "text",
            text: `Conversations for ticket #${ticket_id}:\n\n${text}`,
          },
        ],
      };
    }
  );

  server.tool(
    "search_tickets",
    "Search/filter Freshservice tickets using a query string",
    {
      query: z
        .string()
        .describe(
          'Freshservice filter query, e.g. "priority:4 AND status:2" or "agent_id:123"'
        ),
    },
    async ({ query }) => {
      const result = await client.filterTickets(query);
      const tickets = result.tickets || [];
      if (tickets.length === 0) {
        return { content: [{ type: "text", text: "No tickets matched the query." }] };
      }
      const text = tickets.map(formatTicket).join("\n\n");
      return {
        content: [
          {
            type: "text",
            text: `Found ${tickets.length} ticket(s):\n\n${text}`,
          },
        ],
      };
    }
  );
}
