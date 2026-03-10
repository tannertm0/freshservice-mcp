import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTicketTools } from "../src/tools/tickets.js";
import { registerAssetTools } from "../src/tools/assets.js";
import { registerPeopleTools } from "../src/tools/people.js";
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
  };
}

async function setupTestServer() {
  const mcpServer = new McpServer({ name: "test-freshservice", version: "1.0.0" });
  const mockClient = createMockClient();

  registerTicketTools(mcpServer, mockClient);
  registerAssetTools(mcpServer, mockClient);
  registerPeopleTools(mcpServer, mockClient);

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
  it("should list all 22 tools", async () => {
    const { tools } = await client.listTools();
    assert.strictEqual(tools.length, 22);
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
});
