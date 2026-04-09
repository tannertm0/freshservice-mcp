import { z } from "zod";

const STATUS_MAP = { 1: "Open", 2: "In Progress", 3: "Completed" };

function formatTask(t) {
  return [
    `Task #${t.id} — ${t.title}`,
    `  Status: ${STATUS_MAP[t.status] || t.status} | Due: ${t.due_date || "N/A"}`,
    `  Assigned To: ${t.agent_id || "Unassigned"} | Group: ${t.group_id || "N/A"}`,
    `  Created: ${t.created_at}`,
  ].join("\n");
}

export function registerTicketTaskTools(server, client) {
  server.tool(
    "list_ticket_tasks",
    "List all tasks for a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
    },
    async ({ ticket_id }) => {
      const result = await client.listTicketTasks(ticket_id);
      const tasks = result.tasks || [];
      if (tasks.length === 0) {
        return { content: [{ type: "text", text: `No tasks found for ticket #${ticket_id}.` }] };
      }
      const text = tasks.map(formatTask).join("\n\n");
      return {
        content: [{ type: "text", text: `Tasks for ticket #${ticket_id}:\n\n${text}` }],
      };
    }
  );

  server.tool(
    "get_ticket_task",
    "Get details of a specific task on a ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      task_id: z.number().describe("The task ID"),
    },
    async ({ ticket_id, task_id }) => {
      const result = await client.getTicketTask(ticket_id, task_id);
      const t = result.task;
      const text = [
        formatTask(t),
        `  Description: ${t.description || "N/A"}`,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "create_ticket_task",
    "Create a new task on a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      title: z.string().describe("Task title"),
      description: z.string().optional().describe("Task description"),
      status: z.number().min(1).max(3).optional().describe("1=Open, 2=In Progress, 3=Completed"),
      due_date: z.string().optional().describe("Due date (ISO 8601)"),
      agent_id: z.number().optional().describe("Assign to agent"),
      group_id: z.number().optional().describe("Assign to group"),
    },
    async ({ ticket_id, ...taskData }) => {
      const result = await client.createTicketTask(ticket_id, taskData);
      const t = result.task;
      return {
        content: [{ type: "text", text: `Task created on ticket #${ticket_id}!\n\n${formatTask(t)}` }],
      };
    }
  );

  server.tool(
    "update_ticket_task",
    "Update a task on a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      task_id: z.number().describe("The task ID to update"),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.number().min(1).max(3).optional(),
      due_date: z.string().optional(),
      agent_id: z.number().optional(),
      group_id: z.number().optional(),
    },
    async ({ ticket_id, task_id, ...updates }) => {
      const result = await client.updateTicketTask(ticket_id, task_id, updates);
      const t = result.task;
      return {
        content: [{ type: "text", text: `Task updated!\n\n${formatTask(t)}` }],
      };
    }
  );

  server.tool(
    "delete_ticket_task",
    "Delete a task from a Freshservice ticket",
    {
      ticket_id: z.number().describe("The ticket ID"),
      task_id: z.number().describe("The task ID to delete"),
    },
    async ({ ticket_id, task_id }) => {
      await client.deleteTicketTask(ticket_id, task_id);
      return {
        content: [{ type: "text", text: `Task #${task_id} deleted from ticket #${ticket_id}.` }],
      };
    }
  );
}
