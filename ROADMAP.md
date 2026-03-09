# Roadmap

## Current (v1.0)

- [x] Ticket management (list, get, create, update, delete, reply, notes, search)
- [x] Asset management (list, get, create, update, delete)
- [x] Requesters (list, get)
- [x] Agents (list, get)
- [x] Groups (list, get)
- [x] Departments (list, get)

## Phase 2 — Core ITSM Expansion

- [ ] **Service Catalog** — Browse catalog items, submit service requests
- [ ] **Change Management** — Create, approve, and track changes
- [ ] **Problem Management** — Link problems to incidents, track root cause analysis
- [ ] **Bulk Operations** — Batch close, reassign, and update tickets with pagination support

## Phase 3 — Smart Features

- [ ] **MCP Prompts** — Pre-built prompts for common workflows:
  - Daily standup summary (open tickets, SLA breaches, unassigned items)
  - New employee onboarding checklist
  - Weekly IT metrics report
- [ ] **MCP Resources** — Ambient context without explicit tool calls:
  - `freshservice://tickets/open` — current open tickets
  - `freshservice://groups` — team structure
  - `freshservice://sla/breaches` — SLA breach alerts
- [ ] **SLA Policies** — Surface approaching and breached SLAs
- [ ] **Workspace Support** — Multi-workspace filtering (IT, HR, Facilities)

## Phase 4 — Knowledge & Compliance

- [ ] **Knowledge Base** — Search and create solution articles
- [ ] **Announcements** — Post and manage company announcements
- [ ] **Audit Logs** — Track who changed what and when
- [ ] **Custom Fields Awareness** — Expose field definitions so AI understands your specific setup

## Contributing

Pick any unchecked item, open a PR, and reference this roadmap. Issues and feature requests welcome.
