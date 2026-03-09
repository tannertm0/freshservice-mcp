# Freshservice MCP Server

An MCP (Model Context Protocol) server that connects AI assistants like Claude to your Freshservice ITSM instance. Manage tickets, assets, requesters, agents, groups, and departments through natural language.

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Get Your Freshservice API Key

1. Log into Freshservice
2. Click your profile icon → **Profile Settings**
3. Your API key is on the right side panel

### 3. Configure in Claude Desktop

Add to your Claude Desktop config (`~/.claude.json` or Claude Desktop settings):

```json
{
  "mcpServers": {
    "freshservice": {
      "command": "node",
      "args": ["C:/path/to/freshservice-mcp/src/index.js"],
      "env": {
        "FRESHSERVICE_DOMAIN": "yourcompany",
        "FRESHSERVICE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace:
- `yourcompany` with your Freshservice subdomain (the part before `.freshservice.com`)
- `your-api-key-here` with your API key

## Available Tools

### Tickets
| Tool | Description |
|------|-------------|
| `list_tickets` | List tickets with filters (status, priority, requester, date) |
| `get_ticket` | Get full ticket details |
| `create_ticket` | Create a new ticket |
| `update_ticket` | Update ticket fields (status, priority, assignment, etc.) |
| `delete_ticket` | Delete a ticket |
| `reply_to_ticket` | Send a reply on a ticket |
| `add_note_to_ticket` | Add a public or private note |
| `get_ticket_conversations` | View all replies and notes |
| `search_tickets` | Filter tickets with query syntax |

### Assets
| Tool | Description |
|------|-------------|
| `list_assets` | List all assets/CIs |
| `get_asset` | Get asset details |
| `create_asset` | Create a new asset |
| `update_asset` | Update asset fields |
| `delete_asset` | Delete an asset |

### People & Organization
| Tool | Description |
|------|-------------|
| `list_requesters` | List end users |
| `get_requester` | Get requester details |
| `list_agents` | List support agents |
| `get_agent` | Get agent details |
| `list_groups` | List agent groups |
| `get_group` | Get group details and members |
| `list_departments` | List departments |
| `get_department` | Get department details |

## Example Prompts

Once configured, you can ask Claude things like:

- "Show me all open P1 tickets"
- "Create a ticket for the printer on 3rd floor being offline"
- "What assets are assigned to John Smith?"
- "Assign ticket #1234 to the network team"
- "Add a private note to ticket #5678 saying we're waiting on the vendor"
- "List all agents in the IT Support group"

## Search Query Syntax

The `search_tickets` tool uses Freshservice's filter query syntax:

```
"priority:4 AND status:2"          — Urgent + Open tickets
"group_id:12345"                   — Tickets assigned to a specific group
"agent_id:67890"                   — Tickets assigned to a specific agent
"created_at:>'2024-01-01'"         — Tickets created after a date
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FRESHSERVICE_DOMAIN` | Yes | Your Freshservice subdomain |
| `FRESHSERVICE_API_KEY` | Yes | Your Freshservice API key |

## License

MIT
