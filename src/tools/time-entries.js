import { z } from "zod";

function formatTimeEntry(e) {
  return [
    `Entry #${e.id} — ${e.time_spent || "N/A"} spent`,
    `  Agent: ${e.agent_id || "N/A"} | Billable: ${e.billable ? "Yes" : "No"}`,
    `  Note: ${e.note || "N/A"}`,
    `  Executed: ${e.executed_at || "N/A"} | Created: ${e.created_at}`,
  ].join("\n");
}

export function registerTimeEntryTools(server, client) {
  server.tool(
    "list_time_entries",
    "List time entries for a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
    },
    async ({ ticket_id }) => {
      const result = await client.listTimeEntries(ticket_id);
      const entries = result.time_entries || [];
      if (entries.length === 0) {
        return { content: [{ type: "text", text: `No time entries for ticket #${ticket_id}.` }] };
      }
      const text = entries.map(formatTimeEntry).join("\n\n");
      return {
        content: [{ type: "text", text: `Time entries for ticket #${ticket_id}:\n\n${text}` }],
      };
    }
  );

  server.tool(
    "create_time_entry",
    "Log time spent on a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      agent_id: z.number().describe("Agent who performed the work"),
      time_spent: z.string().describe("Time spent (e.g. '01:30' for 1h 30m)"),
      note: z.string().optional().describe("Description of work done"),
      billable: z.boolean().optional().describe("Whether this time is billable"),
      executed_at: z.string().optional().describe("When the work was done (ISO 8601)"),
    },
    async ({ ticket_id, ...entryData }) => {
      const result = await client.createTimeEntry(ticket_id, entryData);
      const e = result.time_entry;
      return {
        content: [{ type: "text", text: `Time logged on ticket #${ticket_id}!\n\n${formatTimeEntry(e)}` }],
      };
    }
  );

  server.tool(
    "update_time_entry",
    "Update a time entry on a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      entry_id: z.number().describe("The time entry ID"),
      time_spent: z.string().optional(),
      note: z.string().optional(),
      billable: z.boolean().optional(),
      executed_at: z.string().optional(),
    },
    async ({ ticket_id, entry_id, ...updates }) => {
      const result = await client.updateTimeEntry(ticket_id, entry_id, updates);
      const e = result.time_entry;
      return {
        content: [{ type: "text", text: `Time entry updated!\n\n${formatTimeEntry(e)}` }],
      };
    }
  );

  server.tool(
    "delete_time_entry",
    "Delete a time entry from a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      entry_id: z.number().describe("The time entry ID to delete"),
    },
    async ({ ticket_id, entry_id }) => {
      await client.deleteTimeEntry(ticket_id, entry_id);
      return {
        content: [{ type: "text", text: `Time entry #${entry_id} deleted from ticket #${ticket_id}.` }],
      };
    }
  );
}
