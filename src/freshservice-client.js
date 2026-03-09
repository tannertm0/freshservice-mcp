/**
 * Freshservice REST API v2 client.
 * Auth: API key as basic auth username, "X" as password.
 * Base URL: https://{domain}.freshservice.com/api/v2
 */

export class FreshserviceClient {
  #baseUrl;
  #headers;

  constructor(domain, apiKey) {
    if (!domain || !apiKey) {
      throw new Error(
        "Missing FRESHSERVICE_DOMAIN or FRESHSERVICE_API_KEY environment variables"
      );
    }
    this.#baseUrl = `https://${domain}.freshservice.com/api/v2`;
    this.#headers = {
      Authorization: `Basic ${Buffer.from(`${apiKey}:X`).toString("base64")}`,
      "Content-Type": "application/json",
    };
  }

  async request(method, path, body = null, queryParams = null) {
    let url = `${this.#baseUrl}${path}`;
    if (queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const options = {
      method,
      headers: this.#headers,
    };
    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Freshservice API error ${response.status}: ${errorBody}`
      );
    }

    if (response.status === 204) return null;

    return response.json();
  }

  // Tickets
  listTickets(params = {}) {
    return this.request("GET", "/tickets", null, params);
  }

  getTicket(id) {
    return this.request("GET", `/tickets/${id}`);
  }

  createTicket(data) {
    return this.request("POST", "/tickets", data);
  }

  updateTicket(id, data) {
    return this.request("PUT", `/tickets/${id}`, data);
  }

  deleteTicket(id) {
    return this.request("DELETE", `/tickets/${id}`);
  }

  getTicketConversations(id) {
    return this.request("GET", `/tickets/${id}/conversations`);
  }

  replyToTicket(id, body) {
    return this.request("POST", `/tickets/${id}/reply`, body);
  }

  addNoteToTicket(id, body) {
    return this.request("POST", `/tickets/${id}/notes`, body);
  }

  // Assets
  listAssets(params = {}) {
    return this.request("GET", "/assets", null, params);
  }

  getAsset(displayId) {
    return this.request("GET", `/assets/${displayId}`);
  }

  createAsset(data) {
    return this.request("POST", "/assets", data);
  }

  updateAsset(displayId, data) {
    return this.request("PUT", `/assets/${displayId}`, data);
  }

  deleteAsset(displayId) {
    return this.request("DELETE", `/assets/${displayId}`);
  }

  // Requesters
  listRequesters(params = {}) {
    return this.request("GET", "/requesters", null, params);
  }

  getRequester(id) {
    return this.request("GET", `/requesters/${id}`);
  }

  // Agents
  listAgents(params = {}) {
    return this.request("GET", "/agents", null, params);
  }

  getAgent(id) {
    return this.request("GET", `/agents/${id}`);
  }

  // Groups
  listGroups(params = {}) {
    return this.request("GET", "/groups", null, params);
  }

  getGroup(id) {
    return this.request("GET", `/groups/${id}`);
  }

  // Departments
  listDepartments(params = {}) {
    return this.request("GET", "/departments", null, params);
  }

  getDepartment(id) {
    return this.request("GET", `/departments/${id}`);
  }

  // Search (Freshservice filter endpoint)
  filterTickets(query) {
    return this.request("GET", "/tickets/filter", null, { query });
  }
}
