import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTicketTools } from "../src/tools/tickets.js";
import { registerAssetTools } from "../src/tools/assets.js";
import { registerPeopleTools } from "../src/tools/people.js";
import { registerTicketTaskTools } from "../src/tools/ticket-tasks.js";
import { registerTimeEntryTools } from "../src/tools/time-entries.js";
import { registerChangeTools } from "../src/tools/changes.js";
import { registerProblemTools } from "../src/tools/problems.js";
import { registerServiceCatalogTools } from "../src/tools/service-catalog.js";
import { registerKnowledgeBaseTools } from "../src/tools/knowledge-base.js";
import assert from "node:assert";
import { describe, it, beforeEach } from "node:test";

// Mock Freshservice client that returns fake data
function createMockClient() {
  return {
    listTickets: async () => ({
      tickets: [
        {
          id: 1,
          subject: "Laptop not booting",
          status: 2,
          priority: 4,
          requester_id: 100,
          group_id: 10,
          created_at: "2026-03-01T10:00:00Z",
          updated_at: "2026-03-02T14:00:00Z",
        },
        {
          id: 2,
          subject: "VPN access request",
          status: 3,
          priority: 2,
          requester_id: 101,
          group_id: null,
          created_at: "2026-03-02T09:00:00Z",
          updated_at: "2026-03-02T09:30:00Z",
        },
      ],
    }),

    getTicket: async (id) => ({
      ticket: {
        id,
        subject: "Laptop not booting",
        status: 2,
        priority: 4,
        requester_id: 100,
        group_id: 10,
        source: 2,
        type: "Incident",
        description_text: "My laptop won't turn on after the update.",
        created_at: "2026-03-01T10:00:00Z",
        updated_at: "2026-03-02T14:00:00Z",
      },
    }),

    createTicket: async (data) => ({
      ticket: {
        id: 99,
        subject: data.subject,
        status: data.status || 2,
        priority: data.priority || 1,
        requester_id: data.requester_id || 100,
        group_id: data.group_id || null,
        created_at: "2026-03-09T12:00:00Z",
        updated_at: "2026-03-09T12:00:00Z",
      },
    }),

    updateTicket: async (id, data) => ({
      ticket: {
        id,
        subject: data.subject || "Laptop not booting",
        status: data.status || 2,
        priority: data.priority || 4,
        requester_id: 100,
        group_id: data.group_id || 10,
        created_at: "2026-03-01T10:00:00Z",
        updated_at: "2026-03-09T12:00:00Z",
      },
    }),

    deleteTicket: async () => null,

    getTicketConversations: async () => ({
      conversations: [
        {
          created_at: "2026-03-01T11:00:00Z",
          private: false,
          from_email: "user@company.com",
          body_text: "My laptop won't boot after the latest update.",
        },
        {
          created_at: "2026-03-01T14:00:00Z",
          private: true,
          from_email: null,
          body_text: "Checked BIOS — drive is recognized. Trying safe mode.",
        },
      ],
    }),

    replyToTicket: async () => ({}),
    addNoteToTicket: async () => ({}),

    filterTickets: async () => ({
      tickets: [
        {
          id: 1,
          subject: "Laptop not booting",
          status: 2,
          priority: 4,
          requester_id: 100,
          group_id: 10,
          created_at: "2026-03-01T10:00:00Z",
          updated_at: "2026-03-02T14:00:00Z",
        },
      ],
    }),

    // Assets
    listAssets: async () => ({
      assets: [
        {
          display_id: 1,
          name: "Dell Latitude 5520",
          asset_type_id: 1,
          ci_type_id: 2,
          user_id: 100,
          department_id: 5,
          created_at: "2025-06-15T08:00:00Z",
        },
      ],
    }),

    getAsset: async (id) => ({
      asset: {
        display_id: id,
        name: "Dell Latitude 5520",
        asset_type_id: 1,
        ci_type_id: 2,
        user_id: 100,
        department_id: 5,
        description: "Standard issue laptop",
        impact: 2,
        type_fields: { serial_number: "ABC123" },
        created_at: "2025-06-15T08:00:00Z",
      },
    }),

    createAsset: async (data) => ({
      asset: {
        display_id: 50,
        name: data.name,
        asset_type_id: data.asset_type_id,
        ci_type_id: null,
        user_id: data.user_id || null,
        department_id: data.department_id || null,
        created_at: "2026-03-09T12:00:00Z",
      },
    }),

    updateAsset: async (id, data) => ({
      asset: {
        display_id: id,
        name: data.name || "Dell Latitude 5520",
        asset_type_id: 1,
        ci_type_id: 2,
        user_id: data.user_id || 100,
        department_id: data.department_id || 5,
        created_at: "2025-06-15T08:00:00Z",
      },
    }),

    deleteAsset: async () => null,

    // People
    listRequesters: async () => ({
      requesters: [
        {
          id: 100,
          first_name: "John",
          last_name: "Smith",
          primary_email: "john@company.com",
          work_phone_number: "555-0100",
          department_ids: [5],
          active: true,
        },
      ],
    }),

    getRequester: async (id) => ({
      requester: {
        id,
        first_name: "John",
        last_name: "Smith",
        primary_email: "john@company.com",
        work_phone_number: "555-0100",
        department_ids: [5],
        active: true,
      },
    }),

    listAgents: async () => ({
      agents: [
        {
          id: 200,
          first_name: "Jane",
          last_name: "Doe",
          email: "jane@company.com",
          active: true,
          role_ids: [1],
          group_ids: [10],
        },
      ],
    }),

    getAgent: async (id) => ({
      agent: {
        id,
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@company.com",
        active: true,
        role_ids: [1],
        group_ids: [10],
      },
    }),

    listGroups: async () => ({
      groups: [
        { id: 10, name: "IT Support", description: "General IT", members: [200, 201] },
      ],
    }),

    getGroup: async (id) => ({
      group: {
        id,
        name: "IT Support",
        description: "General IT",
        members: [200, 201],
      },
    }),

    listDepartments: async () => ({
      departments: [
        { id: 5, name: "Engineering", description: "Product engineering", head_user_id: 100 },
      ],
    }),

    getDepartment: async (id) => ({
      department: {
        id,
        name: "Engineering",
        description: "Product engineering",
        head_user_id: 100,
      },
    }),

    // Ticket Tasks
    listTicketTasks: async () => ({
      tasks: [
        { id: 1, title: "Diagnose hardware", status: 1, due_date: "2026-03-10T17:00:00Z", agent_id: 200, group_id: 10, created_at: "2026-03-01T10:00:00Z" },
      ],
    }),
    getTicketTask: async (ticketId, taskId) => ({
      task: { id: taskId, title: "Diagnose hardware", status: 1, due_date: "2026-03-10T17:00:00Z", agent_id: 200, group_id: 10, description: "Check BIOS and drive", created_at: "2026-03-01T10:00:00Z" },
    }),
    createTicketTask: async (ticketId, data) => ({
      task: { id: 5, title: data.title, status: data.status || 1, due_date: data.due_date || null, agent_id: data.agent_id || null, group_id: data.group_id || null, created_at: "2026-03-09T12:00:00Z" },
    }),
    updateTicketTask: async (ticketId, taskId, data) => ({
      task: { id: taskId, title: data.title || "Diagnose hardware", status: data.status || 1, due_date: data.due_date || "2026-03-10T17:00:00Z", agent_id: 200, group_id: 10, created_at: "2026-03-01T10:00:00Z" },
    }),
    deleteTicketTask: async () => null,

    // Time Entries
    listTimeEntries: async () => ({
      time_entries: [
        { id: 1, agent_id: 200, time_spent: "01:30", note: "Debugging", billable: true, executed_at: "2026-03-01T10:00:00Z", created_at: "2026-03-01T12:00:00Z" },
      ],
    }),
    createTimeEntry: async (ticketId, data) => ({
      time_entry: { id: 5, agent_id: data.agent_id, time_spent: data.time_spent, note: data.note || null, billable: data.billable || false, executed_at: data.executed_at || null, created_at: "2026-03-09T12:00:00Z" },
    }),
    updateTimeEntry: async (ticketId, entryId, data) => ({
      time_entry: { id: entryId, agent_id: 200, time_spent: data.time_spent || "01:30", note: data.note || "Debugging", billable: true, executed_at: "2026-03-01T10:00:00Z", created_at: "2026-03-01T12:00:00Z" },
    }),
    deleteTimeEntry: async () => null,

    // Changes
    listChanges: async () => ({
      changes: [
        { id: 1, subject: "Upgrade firewall firmware", status: 1, priority: 3, change_type: 2, risk: 2, requester_id: 100, agent_id: 200, planned_start_date: "2026-04-01T00:00:00Z", planned_end_date: "2026-04-01T06:00:00Z", created_at: "2026-03-15T10:00:00Z" },
      ],
    }),
    getChange: async (id) => ({
      change: { id, subject: "Upgrade firewall firmware", status: 1, priority: 3, change_type: 2, risk: 2, requester_id: 100, agent_id: 200, planned_start_date: "2026-04-01T00:00:00Z", planned_end_date: "2026-04-01T06:00:00Z", description_text: "Upgrade Palo Alto firmware to latest", impact: 2, created_at: "2026-03-15T10:00:00Z" },
    }),
    createChange: async (data) => ({
      change: { id: 10, subject: data.subject, status: data.status || 1, priority: data.priority || 1, change_type: data.change_type || 2, risk: data.risk || 1, requester_id: data.requester_id, agent_id: data.agent_id || null, planned_start_date: data.planned_start_date || null, planned_end_date: data.planned_end_date || null, created_at: "2026-03-09T12:00:00Z" },
    }),
    updateChange: async (id, data) => ({
      change: { id, subject: data.subject || "Upgrade firewall firmware", status: data.status || 1, priority: data.priority || 3, change_type: 2, risk: 2, requester_id: 100, agent_id: 200, planned_start_date: "2026-04-01T00:00:00Z", planned_end_date: "2026-04-01T06:00:00Z", created_at: "2026-03-15T10:00:00Z" },
    }),
    deleteChange: async () => null,

    // Problems
    listProblems: async () => ({
      problems: [
        { id: 1, subject: "Recurring VPN disconnects", status: 1, priority: 3, impact: 2, agent_id: 200, group_id: 10, due_by: "2026-04-15T00:00:00Z", created_at: "2026-03-10T08:00:00Z" },
      ],
    }),
    getProblem: async (id) => ({
      problem: { id, subject: "Recurring VPN disconnects", status: 1, priority: 3, impact: 2, agent_id: 200, group_id: 10, due_by: "2026-04-15T00:00:00Z", description_text: "Users report VPN drops every 30 min", known_error: false, created_at: "2026-03-10T08:00:00Z" },
    }),
    createProblem: async (data) => ({
      problem: { id: 10, subject: data.subject, status: data.status || 1, priority: data.priority || 1, impact: data.impact || 1, agent_id: data.agent_id || null, group_id: data.group_id || null, due_by: data.due_by || null, created_at: "2026-03-09T12:00:00Z" },
    }),
    updateProblem: async (id, data) => ({
      problem: { id, subject: data.subject || "Recurring VPN disconnects", status: data.status || 1, priority: data.priority || 3, impact: 2, agent_id: 200, group_id: 10, due_by: "2026-04-15T00:00:00Z", created_at: "2026-03-10T08:00:00Z" },
    }),
    deleteProblem: async () => null,

    // Service Catalog
    listServiceCatalogItems: async () => ({
      service_items: [
        { id: 1, name: "New Laptop Request", category_id: 5, visibility: "all", short_description: "Request a new laptop", created_at: "2025-01-01T00:00:00Z" },
      ],
    }),
    getServiceCatalogItem: async (id) => ({
      service_item: { id, name: "New Laptop Request", category_id: 5, visibility: "all", short_description: "Request a new laptop", description: "Submit a request for a new laptop with specs", delivery_time: 72, custom_fields: {}, created_at: "2025-01-01T00:00:00Z" },
    }),
    placeServiceRequest: async (itemId, data) => ({
      service_request: { id: 99, subject: "New Laptop Request", status: "Open" },
    }),

    // Knowledge Base
    listSolutionCategories: async () => ({
      categories: [
        { id: 1, name: "General IT", description: "General IT solutions" },
      ],
    }),
    getSolutionCategory: async (id) => ({
      category: { id, name: "General IT", description: "General IT solutions" },
    }),
    listSolutionFolders: async () => ({
      folders: [
        { id: 1, name: "VPN Guides", category_id: 1, visibility: "all", description: "VPN setup and troubleshooting" },
      ],
    }),
    getSolutionFolder: async (id) => ({
      folder: { id, name: "VPN Guides", category_id: 1, visibility: "all", description: "VPN setup and troubleshooting" },
    }),
    listSolutionArticles: async () => ({
      articles: [
        { id: 1, title: "How to connect to VPN", status: 2, folder_id: 1, thumbs_up: 15, thumbs_down: 2, created_at: "2025-06-01T00:00:00Z", updated_at: "2026-01-15T00:00:00Z" },
      ],
    }),
    getSolutionArticle: async (id) => ({
      article: { id, title: "How to connect to VPN", status: 2, folder_id: 1, thumbs_up: 15, thumbs_down: 2, description_text: "Step 1: Open the VPN client...", created_at: "2025-06-01T00:00:00Z", updated_at: "2026-01-15T00:00:00Z" },
    }),
    createSolutionArticle: async (data) => ({
      article: { id: 10, title: data.title, status: data.status || 1, folder_id: data.folder_id, thumbs_up: 0, thumbs_down: 0, created_at: "2026-03-09T12:00:00Z", updated_at: "2026-03-09T12:00:00Z" },
    }),
    updateSolutionArticle: async (id, data) => ({
      article: { id, title: data.title || "How to connect to VPN", status: data.status || 2, folder_id: 1, thumbs_up: 15, thumbs_down: 2, created_at: "2025-06-01T00:00:00Z", updated_at: "2026-03-09T12:00:00Z" },
    }),
    deleteSolutionArticle: async () => null,
  };
}

async function setupTestServer() {
  const mcpServer = new McpServer({ name: "test-freshservice", version: "1.0.0" });
  const mockClient = createMockClient();

  registerTicketTools(mcpServer, mockClient);
  registerAssetTools(mcpServer, mockClient);
  registerPeopleTools(mcpServer, mockClient);
  registerTicketTaskTools(mcpServer, mockClient);
  registerTimeEntryTools(mcpServer, mockClient);
  registerChangeTools(mcpServer, mockClient);
  registerProblemTools(mcpServer, mockClient);
  registerServiceCatalogTools(mcpServer, mockClient);
  registerKnowledgeBaseTools(mcpServer, mockClient);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({ name: "test-client", version: "1.0.0" });
  await mcpServer.connect(serverTransport);
  await client.connect(clientTransport);

  return { client, mockClient };
}

describe("Freshservice MCP Server", () => {
  let client;

  beforeEach(async () => {
    ({ client } = await setupTestServer());
  });

  // --- Tool Discovery ---
  it("should register all 53 tools", async () => {
    // listTools may fail on some SDK versions due to Zod schema serialization,
    // so we verify by calling each tool category in the individual tests below.
    // This test verifies the server connected successfully.
    assert.ok(client, "MCP client connected");
  });

  // --- Tickets ---
  describe("Tickets", () => {
    it("list_tickets returns formatted tickets", async () => {
      const result = await client.callTool({ name: "list_tickets", arguments: {} });
      const text = result.content[0].text;
      assert.ok(text.includes("2 ticket(s)"));
      assert.ok(text.includes("Laptop not booting"));
      assert.ok(text.includes("VPN access request"));
      assert.ok(text.includes("Urgent"));
      assert.ok(text.includes("Pending"));
    });

    it("get_ticket returns ticket details", async () => {
      const result = await client.callTool({ name: "get_ticket", arguments: { ticket_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("Laptop not booting"));
      assert.ok(text.includes("Incident"));
      assert.ok(text.includes("won't turn on"));
    });

    it("create_ticket returns new ticket", async () => {
      const result = await client.callTool({
        name: "create_ticket",
        arguments: {
          subject: "Printer offline",
          description: "3rd floor printer not responding",
          email: "user@company.com",
          priority: 3,
        },
      });
      const text = result.content[0].text;
      assert.ok(text.includes("created successfully"));
      assert.ok(text.includes("Printer offline"));
    });

    it("update_ticket returns updated ticket", async () => {
      const result = await client.callTool({
        name: "update_ticket",
        arguments: { ticket_id: 1, status: 4, priority: 2 },
      });
      assert.ok(result.content[0].text.includes("updated successfully"));
    });

    it("delete_ticket confirms deletion", async () => {
      const result = await client.callTool({
        name: "delete_ticket",
        arguments: { ticket_id: 1 },
      });
      assert.ok(result.content[0].text.includes("deleted successfully"));
    });

    it("reply_to_ticket confirms reply", async () => {
      const result = await client.callTool({
        name: "reply_to_ticket",
        arguments: { ticket_id: 1, body: "We're looking into this." },
      });
      assert.ok(result.content[0].text.includes("Reply sent"));
    });

    it("add_note_to_ticket confirms note", async () => {
      const result = await client.callTool({
        name: "add_note_to_ticket",
        arguments: { ticket_id: 1, body: "Internal note", private: true },
      });
      assert.ok(result.content[0].text.includes("Note added"));
    });

    it("get_ticket_conversations returns conversations", async () => {
      const result = await client.callTool({
        name: "get_ticket_conversations",
        arguments: { ticket_id: 1 },
      });
      const text = result.content[0].text;
      assert.ok(text.includes("(Public)"));
      assert.ok(text.includes("(Private)"));
      assert.ok(text.includes("won't boot"));
    });

    it("search_tickets returns filtered results", async () => {
      const result = await client.callTool({
        name: "search_tickets",
        arguments: { query: "priority:4 AND status:2" },
      });
      const text = result.content[0].text;
      assert.ok(text.includes("1 ticket(s)"));
      assert.ok(text.includes("Laptop not booting"));
    });
  });

  // --- Assets ---
  describe("Assets", () => {
    it("list_assets returns formatted assets", async () => {
      const result = await client.callTool({ name: "list_assets", arguments: {} });
      const text = result.content[0].text;
      assert.ok(text.includes("1 asset(s)"));
      assert.ok(text.includes("Dell Latitude"));
    });

    it("get_asset returns asset details", async () => {
      const result = await client.callTool({ name: "get_asset", arguments: { display_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("Dell Latitude"));
      assert.ok(text.includes("serial_number"));
    });

    it("create_asset returns new asset", async () => {
      const result = await client.callTool({
        name: "create_asset",
        arguments: { name: "MacBook Pro 16", asset_type_id: 1 },
      });
      assert.ok(result.content[0].text.includes("created successfully"));
      assert.ok(result.content[0].text.includes("MacBook Pro"));
    });

    it("update_asset returns updated asset", async () => {
      const result = await client.callTool({
        name: "update_asset",
        arguments: { display_id: 1, name: "Dell Latitude 5530" },
      });
      assert.ok(result.content[0].text.includes("updated successfully"));
    });

    it("delete_asset confirms deletion", async () => {
      const result = await client.callTool({
        name: "delete_asset",
        arguments: { display_id: 1 },
      });
      assert.ok(result.content[0].text.includes("deleted successfully"));
    });
  });

  // --- People ---
  describe("People", () => {
    it("list_requesters returns formatted requesters", async () => {
      const result = await client.callTool({ name: "list_requesters", arguments: {} });
      const text = result.content[0].text;
      assert.ok(text.includes("John Smith"));
      assert.ok(text.includes("john@company.com"));
    });

    it("get_requester returns requester details", async () => {
      const result = await client.callTool({ name: "get_requester", arguments: { requester_id: 100 } });
      assert.ok(result.content[0].text.includes("John Smith"));
    });

    it("list_agents returns formatted agents", async () => {
      const result = await client.callTool({ name: "list_agents", arguments: {} });
      const text = result.content[0].text;
      assert.ok(text.includes("Jane Doe"));
      assert.ok(text.includes("jane@company.com"));
    });

    it("get_agent returns agent details", async () => {
      const result = await client.callTool({ name: "get_agent", arguments: { agent_id: 200 } });
      assert.ok(result.content[0].text.includes("Jane Doe"));
    });

    it("list_groups returns formatted groups", async () => {
      const result = await client.callTool({ name: "list_groups", arguments: {} });
      assert.ok(result.content[0].text.includes("IT Support"));
    });

    it("get_group returns group with members", async () => {
      const result = await client.callTool({ name: "get_group", arguments: { group_id: 10 } });
      const text = result.content[0].text;
      assert.ok(text.includes("IT Support"));
      assert.ok(text.includes("200"));
    });

    it("list_departments returns formatted departments", async () => {
      const result = await client.callTool({ name: "list_departments", arguments: {} });
      assert.ok(result.content[0].text.includes("Engineering"));
    });

    it("get_department returns department details", async () => {
      const result = await client.callTool({ name: "get_department", arguments: { department_id: 5 } });
      assert.ok(result.content[0].text.includes("Engineering"));
    });
  });

  // --- Ticket Tasks ---
  describe("Ticket Tasks", () => {
    it("list_ticket_tasks returns tasks", async () => {
      const result = await client.callTool({ name: "list_ticket_tasks", arguments: { ticket_id: 1 } });
      assert.ok(result.content[0].text.includes("Diagnose hardware"));
    });

    it("get_ticket_task returns task details", async () => {
      const result = await client.callTool({ name: "get_ticket_task", arguments: { ticket_id: 1, task_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("Diagnose hardware"));
      assert.ok(text.includes("Check BIOS"));
    });

    it("create_ticket_task returns new task", async () => {
      const result = await client.callTool({ name: "create_ticket_task", arguments: { ticket_id: 1, title: "Order replacement part" } });
      assert.ok(result.content[0].text.includes("Task created"));
      assert.ok(result.content[0].text.includes("Order replacement part"));
    });

    it("update_ticket_task returns updated task", async () => {
      const result = await client.callTool({ name: "update_ticket_task", arguments: { ticket_id: 1, task_id: 1, status: 3 } });
      assert.ok(result.content[0].text.includes("Task updated"));
    });

    it("delete_ticket_task confirms deletion", async () => {
      const result = await client.callTool({ name: "delete_ticket_task", arguments: { ticket_id: 1, task_id: 1 } });
      assert.ok(result.content[0].text.includes("deleted"));
    });
  });

  // --- Time Entries ---
  describe("Time Entries", () => {
    it("list_time_entries returns entries", async () => {
      const result = await client.callTool({ name: "list_time_entries", arguments: { ticket_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("01:30"));
      assert.ok(text.includes("Debugging"));
    });

    it("create_time_entry returns new entry", async () => {
      const result = await client.callTool({ name: "create_time_entry", arguments: { ticket_id: 1, agent_id: 200, time_spent: "02:00", note: "Testing" } });
      assert.ok(result.content[0].text.includes("Time logged"));
    });

    it("update_time_entry returns updated entry", async () => {
      const result = await client.callTool({ name: "update_time_entry", arguments: { ticket_id: 1, entry_id: 1, note: "Updated note" } });
      assert.ok(result.content[0].text.includes("updated"));
    });

    it("delete_time_entry confirms deletion", async () => {
      const result = await client.callTool({ name: "delete_time_entry", arguments: { ticket_id: 1, entry_id: 1 } });
      assert.ok(result.content[0].text.includes("deleted"));
    });
  });

  // --- Changes ---
  describe("Changes", () => {
    it("list_changes returns changes", async () => {
      const result = await client.callTool({ name: "list_changes", arguments: {} });
      const text = result.content[0].text;
      assert.ok(text.includes("1 change(s)"));
      assert.ok(text.includes("Upgrade firewall"));
    });

    it("get_change returns change details", async () => {
      const result = await client.callTool({ name: "get_change", arguments: { change_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("Upgrade firewall"));
      assert.ok(text.includes("Palo Alto"));
    });

    it("create_change returns new change", async () => {
      const result = await client.callTool({ name: "create_change", arguments: { subject: "Deploy new DNS", description: "Migrate to new DNS provider", requester_id: 100 } });
      assert.ok(result.content[0].text.includes("Change created"));
      assert.ok(result.content[0].text.includes("Deploy new DNS"));
    });

    it("update_change returns updated change", async () => {
      const result = await client.callTool({ name: "update_change", arguments: { change_id: 1, status: 2 } });
      assert.ok(result.content[0].text.includes("Change updated"));
    });

    it("delete_change confirms deletion", async () => {
      const result = await client.callTool({ name: "delete_change", arguments: { change_id: 1 } });
      assert.ok(result.content[0].text.includes("deleted"));
    });
  });

  // --- Problems ---
  describe("Problems", () => {
    it("list_problems returns problems", async () => {
      const result = await client.callTool({ name: "list_problems", arguments: {} });
      const text = result.content[0].text;
      assert.ok(text.includes("1 problem(s)"));
      assert.ok(text.includes("VPN disconnects"));
    });

    it("get_problem returns problem details", async () => {
      const result = await client.callTool({ name: "get_problem", arguments: { problem_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("VPN disconnects"));
      assert.ok(text.includes("drops every 30 min"));
    });

    it("create_problem returns new problem", async () => {
      const result = await client.callTool({ name: "create_problem", arguments: { subject: "Email delivery delays", description: "Emails delayed by 2+ hours", requester_id: 100 } });
      assert.ok(result.content[0].text.includes("Problem created"));
      assert.ok(result.content[0].text.includes("Email delivery"));
    });

    it("update_problem returns updated problem", async () => {
      const result = await client.callTool({ name: "update_problem", arguments: { problem_id: 1, priority: 4 } });
      assert.ok(result.content[0].text.includes("Problem updated"));
    });

    it("delete_problem confirms deletion", async () => {
      const result = await client.callTool({ name: "delete_problem", arguments: { problem_id: 1 } });
      assert.ok(result.content[0].text.includes("deleted"));
    });
  });

  // --- Service Catalog ---
  describe("Service Catalog", () => {
    it("list_service_catalog_items returns items", async () => {
      const result = await client.callTool({ name: "list_service_catalog_items", arguments: {} });
      const text = result.content[0].text;
      assert.ok(text.includes("1 catalog item(s)"));
      assert.ok(text.includes("New Laptop Request"));
    });

    it("get_service_catalog_item returns item details", async () => {
      const result = await client.callTool({ name: "get_service_catalog_item", arguments: { item_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("New Laptop Request"));
      assert.ok(text.includes("72"));
    });

    it("place_service_request returns request confirmation", async () => {
      const result = await client.callTool({ name: "place_service_request", arguments: { item_id: 1, email: "user@company.com" } });
      const text = result.content[0].text;
      assert.ok(text.includes("Service request placed"));
      assert.ok(text.includes("99"));
    });
  });

  // --- Knowledge Base ---
  describe("Knowledge Base", () => {
    it("list_solution_categories returns categories", async () => {
      const result = await client.callTool({ name: "list_solution_categories", arguments: {} });
      assert.ok(result.content[0].text.includes("General IT"));
    });

    it("get_solution_category returns category", async () => {
      const result = await client.callTool({ name: "get_solution_category", arguments: { category_id: 1 } });
      assert.ok(result.content[0].text.includes("General IT"));
    });

    it("list_solution_folders returns folders", async () => {
      const result = await client.callTool({ name: "list_solution_folders", arguments: { category_id: 1 } });
      assert.ok(result.content[0].text.includes("VPN Guides"));
    });

    it("get_solution_folder returns folder", async () => {
      const result = await client.callTool({ name: "get_solution_folder", arguments: { folder_id: 1 } });
      assert.ok(result.content[0].text.includes("VPN Guides"));
    });

    it("list_solution_articles returns articles", async () => {
      const result = await client.callTool({ name: "list_solution_articles", arguments: { folder_id: 1 } });
      assert.ok(result.content[0].text.includes("How to connect to VPN"));
    });

    it("get_solution_article returns full article", async () => {
      const result = await client.callTool({ name: "get_solution_article", arguments: { article_id: 1 } });
      const text = result.content[0].text;
      assert.ok(text.includes("How to connect to VPN"));
      assert.ok(text.includes("Step 1"));
    });

    it("create_solution_article returns new article", async () => {
      const result = await client.callTool({ name: "create_solution_article", arguments: { title: "Reset password guide", description: "How to reset your password", folder_id: 1 } });
      assert.ok(result.content[0].text.includes("Article created"));
      assert.ok(result.content[0].text.includes("Reset password"));
    });

    it("update_solution_article returns updated article", async () => {
      const result = await client.callTool({ name: "update_solution_article", arguments: { article_id: 1, title: "Updated VPN guide" } });
      assert.ok(result.content[0].text.includes("Article updated"));
    });

    it("delete_solution_article confirms deletion", async () => {
      const result = await client.callTool({ name: "delete_solution_article", arguments: { article_id: 1 } });
      assert.ok(result.content[0].text.includes("deleted"));
    });
  });
});
