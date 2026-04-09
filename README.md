# freshservice-mcp

An MCP (Model Context Protocol) server that connects AI assistants to your Freshservice ITSM instance. Manage tickets, assets, changes, problems, service catalog, knowledge base, and more through natural language.

## Features

**53 tools** across 9 categories:

| Category | Tools | Description |
|----------|-------|-------------|
| Tickets | 9 | List, get, create, update, delete, reply, add notes, conversations, search |
| Assets | 5 | List, get, create, update, delete |
| People | 8 | Requesters, agents, groups, departments (list + get) |
| Ticket Tasks | 5 | List, get, create, update, delete sub-tasks on tickets |
| Time Entries | 4 | List, create, update, delete time logs |
| Changes | 5 | List, get, create, update, delete change requests |
| Problems | 5 | List, get, create, update, delete problem records |
| Service Catalog | 3 | Browse catalog items, get details, place service requests |
| Knowledge Base | 9 | Categories, folders, articles (full CRUD) |

## Quick Start

### Prerequisites

- Node.js 18+
- A Freshservice account with API access
- Your Freshservice API key ([Profile icon > Profile Settings > API key on the right panel](https://support.freshservice.com/en/support/solutions/articles/50000000306))

### Install via npx (recommended)

No installation needed. Configure your MCP client to run:

```json
{
  "mcpServers": {
    "freshservice": {
      "command": "npx",
      "args": ["-y", "freshservice-mcp"],
      "env": {
        "FRESHSERVICE_DOMAIN": "yourcompany",
        "FRESHSERVICE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Install globally

```bash
npm install -g freshservice-mcp
```

Then configure your MCP client:

```json
{
  "mcpServers": {
    "freshservice": {
      "command": "freshservice-mcp",
      "env": {
        "FRESHSERVICE_DOMAIN": "yourcompany",
        "FRESHSERVICE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Install from source

```bash
git clone https://github.com/tannertm0/freshservice-mcp.git
cd freshservice-mcp
npm install
```

```json
{
  "mcpServers": {
    "freshservice": {
      "command": "node",
      "args": ["/path/to/freshservice-mcp/src/index.js"],
      "env": {
        "FRESHSERVICE_DOMAIN": "yourcompany",
        "FRESHSERVICE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `FRESHSERVICE_DOMAIN` | Yes | Your Freshservice subdomain (e.g. `yourcompany` for `yourcompany.freshservice.com`) |
| `FRESHSERVICE_API_KEY` | Yes | Your Freshservice API key |

## MCP Client Setup

**Claude Desktop** - Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

**Claude Code** - Run `claude mcp add freshservice -- npx -y freshservice-mcp` then set env vars

**Cursor / VS Code** - Add to your MCP settings following your editor's docs

## Available Tools

### Tickets
| Tool | Description |
|------|-------------|
| `list_tickets` | List tickets with filters (status, priority, requester, date) |
| `get_ticket` | Get full ticket details |
| `create_ticket` | Create a new ticket |
| `update_ticket` | Update ticket fields (status, priority, assignment, etc.) |
| `delete_ticket` | Delete a ticket (moves to trash) |
| `reply_to_ticket` | Send a reply on a ticket |
| `add_note_to_ticket` | Add a public or private note |
| `get_ticket_conversations` | View all replies and notes |
| `search_tickets` | Filter tickets with query syntax |

### Assets
| Tool | Description |
|------|-------------|
| `list_assets` | List all assets/CIs |
| `get_asset` | Get asset details with custom fields |
| `create_asset` | Register a new asset |
| `update_asset` | Update asset fields |
| `delete_asset` | Remove an asset |

### People & Organization
| Tool | Description |
|------|-------------|
| `list_requesters` / `get_requester` | End users |
| `list_agents` / `get_agent` | Support staff |
| `list_groups` / `get_group` | Agent groups with members |
| `list_departments` / `get_department` | Departments |

### Ticket Tasks
| Tool | Description |
|------|-------------|
| `list_ticket_tasks` | List sub-tasks on a ticket |
| `get_ticket_task` | Get task details |
| `create_ticket_task` | Add a task to a ticket |
| `update_ticket_task` | Update task status/assignment |
| `delete_ticket_task` | Remove a task |

### Time Entries
| Tool | Description |
|------|-------------|
| `list_time_entries` | View logged time on a ticket |
| `create_time_entry` | Log time spent |
| `update_time_entry` | Modify a time entry |
| `delete_time_entry` | Remove a time entry |

### Changes
| Tool | Description |
|------|-------------|
| `list_changes` | List change requests |
| `get_change` | Get change details (type, risk, schedule) |
| `create_change` | Create a change request |
| `update_change` | Update change fields |
| `delete_change` | Delete a change |

### Problems
| Tool | Description |
|------|-------------|
| `list_problems` | List problem records |
| `get_problem` | Get problem details |
| `create_problem` | Create a problem record |
| `update_problem` | Update problem fields |
| `delete_problem` | Delete a problem |

### Service Catalog
| Tool | Description |
|------|-------------|
| `list_service_catalog_items` | Browse available services |
| `get_service_catalog_item` | Get service details and required fields |
| `place_service_request` | Submit a service request |

### Knowledge Base
| Tool | Description |
|------|-------------|
| `list_solution_categories` / `get_solution_category` | Browse KB categories |
| `list_solution_folders` / `get_solution_folder` | Browse KB folders |
| `list_solution_articles` / `get_solution_article` | Read articles |
| `create_solution_article` | Write a new article |
| `update_solution_article` | Edit an article |
| `delete_solution_article` | Remove an article |

## Example Prompts

Once configured, you can ask your AI assistant things like:

- "Show me all open P1 tickets"
- "Create a ticket for the printer on 3rd floor being offline"
- "What assets are assigned to John Smith?"
- "Add a private note to ticket #5678 saying we're waiting on the vendor"
- "Create a change request for the firewall upgrade scheduled next Tuesday"
- "Search the knowledge base for VPN setup instructions"
- "Log 2 hours on ticket #1234 for debugging the network issue"
- "Show me all open problems and their impact levels"
- "Place a new laptop request from the service catalog"

## Search Query Syntax

The `search_tickets` tool uses Freshservice's filter query syntax:

```
"priority:4 AND status:2"          - Urgent + Open tickets
"group_id:12345"                   - Tickets assigned to a specific group
"agent_id:67890"                   - Tickets assigned to a specific agent
"created_at:>'2024-01-01'"         - Tickets created after a date
```

## Development

```bash
git clone https://github.com/tannertm0/freshservice-mcp.git
cd freshservice-mcp
npm install
npm test
```

## License

MIT
