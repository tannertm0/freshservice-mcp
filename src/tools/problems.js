import { z } from "zod";

const PRIORITY_MAP = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent" };
const STATUS_MAP = { 1: "Open", 2: "Change Requested", 3: "Closed" };
const IMPACT_MAP = { 1: "Low", 2: "Medium", 3: "High" };

function formatProblem(p) {
  return [
    `#${p.id} — ${p.subject}`,
    `  Status: ${STATUS_MAP[p.status] || p.status} | Priority: ${PRIORITY_MAP[p.priority] || p.priority}`,
    `  Impact: ${IMPACT_MAP[p.impact] || p.impact || "N/A"}`,
    `  Agent: ${p.agent_id || "Unassigned"} | Group: ${p.group_id || "N/A"}`,
    `  Due By: ${p.due_by || "N/A"} | Created: ${p.created_at}`,
  ].join("\n");
}

export function registerProblemTools(server, client) {
  server.tool(
    "list_problems",
    "List Freshservice problems",
    {
      page: z.number().optional().describe("Page number"),
      per_page: z.number().max(100).optional().describe("Results per page"),
      order_by: z.enum(["created_at", "updated_at", "due_by"]).optional(),
      order_type: z.enum(["asc", "desc"]).optional(),
    },
    async (args) => {
      const result = await client.listProblems(args);
      const problems = result.problems || [];
      if (problems.length === 0) {
        return { content: [{ type: "text", text: "No problems found." }] };
      }
      const text = problems.map(formatProblem).join("\n\n");
      return {
        content: [{ type: "text", text: `Found ${problems.length} problem(s):\n\n${text}` }],
      };
    }
  );

  server.tool(
    "get_problem",
    "Get details of a specific Freshservice problem",
    {
      problem_id: z.number().describe("The problem ID"),
    },
    async ({ problem_id }) => {
      const result = await client.getProblem(problem_id);
      const p = result.problem;
      const text = [
        formatProblem(p),
        `  Description:\n${p.description_text || p.description || "N/A"}`,
        `  Known Error: ${p.known_error ? "Yes" : "No"}`,
        p.analysis_fields ? `  Analysis: ${JSON.stringify(p.analysis_fields, null, 2)}` : "",
      ].filter(Boolean).join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "create_problem",
    "Create a new Freshservice problem",
    {
      subject: z.string().describe("Problem subject"),
      description: z.string().describe("Problem description (HTML supported)"),
      requester_id: z.number().describe("Requester ID"),
      priority: z.number().min(1).max(4).optional().describe("1=Low, 2=Medium, 3=High, 4=Urgent"),
      status: z.number().min(1).max(3).optional().describe("1=Open, 2=Change Requested, 3=Closed"),
      impact: z.number().min(1).max(3).optional().describe("1=Low, 2=Medium, 3=High"),
      agent_id: z.number().optional().describe("Assign to agent"),
      group_id: z.number().optional().describe("Assign to group"),
      department_id: z.number().optional().describe("Department ID"),
      due_by: z.string().optional().describe("Due date (ISO 8601)"),
      known_error: z.boolean().optional().describe("Mark as known error"),
    },
    async (args) => {
      const result = await client.createProblem(args);
      const p = result.problem;
      return {
        content: [{ type: "text", text: `Problem created successfully!\n\n${formatProblem(p)}` }],
      };
    }
  );

  server.tool(
    "update_problem",
    "Update an existing Freshservice problem",
    {
      problem_id: z.number().describe("The problem ID to update"),
      subject: z.string().optional(),
      description: z.string().optional(),
      priority: z.number().min(1).max(4).optional(),
      status: z.number().min(1).max(3).optional(),
      impact: z.number().min(1).max(3).optional(),
      agent_id: z.number().optional(),
      group_id: z.number().optional(),
      due_by: z.string().optional(),
      known_error: z.boolean().optional(),
    },
    async ({ problem_id, ...updates }) => {
      const result = await client.updateProblem(problem_id, updates);
      const p = result.problem;
      return {
        content: [{ type: "text", text: `Problem updated!\n\n${formatProblem(p)}` }],
      };
    }
  );

  server.tool(
    "delete_problem",
    "Delete a Freshservice problem",
    {
      problem_id: z.number().describe("The problem ID to delete"),
    },
    async ({ problem_id }) => {
      await client.deleteProblem(problem_id);
      return {
        content: [{ type: "text", text: `Problem #${problem_id} deleted successfully.` }],
      };
    }
  );
}
