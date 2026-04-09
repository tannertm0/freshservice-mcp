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

  // Ticket Tasks
  listTicketTasks(ticketId) {
    return this.request("GET", `/tickets/${ticketId}/tasks`);
  }

  getTicketTask(ticketId, taskId) {
    return this.request("GET", `/tickets/${ticketId}/tasks/${taskId}`);
  }

  createTicketTask(ticketId, data) {
    return this.request("POST", `/tickets/${ticketId}/tasks`, data);
  }

  updateTicketTask(ticketId, taskId, data) {
    return this.request("PUT", `/tickets/${ticketId}/tasks/${taskId}`, data);
  }

  deleteTicketTask(ticketId, taskId) {
    return this.request("DELETE", `/tickets/${ticketId}/tasks/${taskId}`);
  }

  // Time Entries
  listTimeEntries(ticketId) {
    return this.request("GET", `/tickets/${ticketId}/time_entries`);
  }

  createTimeEntry(ticketId, data) {
    return this.request("POST", `/tickets/${ticketId}/time_entries`, data);
  }

  updateTimeEntry(ticketId, entryId, data) {
    return this.request("PUT", `/tickets/${ticketId}/time_entries/${entryId}`, data);
  }

  deleteTimeEntry(ticketId, entryId) {
    return this.request("DELETE", `/tickets/${ticketId}/time_entries/${entryId}`);
  }

  // Changes
  listChanges(params = {}) {
    return this.request("GET", "/changes", null, params);
  }

  getChange(id) {
    return this.request("GET", `/changes/${id}`);
  }

  createChange(data) {
    return this.request("POST", "/changes", data);
  }

  updateChange(id, data) {
    return this.request("PUT", `/changes/${id}`, data);
  }

  deleteChange(id) {
    return this.request("DELETE", `/changes/${id}`);
  }

  // Problems
  listProblems(params = {}) {
    return this.request("GET", "/problems", null, params);
  }

  getProblem(id) {
    return this.request("GET", `/problems/${id}`);
  }

  createProblem(data) {
    return this.request("POST", "/problems", data);
  }

  updateProblem(id, data) {
    return this.request("PUT", `/problems/${id}`, data);
  }

  deleteProblem(id) {
    return this.request("DELETE", `/problems/${id}`);
  }

  // Service Catalog
  listServiceCatalogItems(params = {}) {
    return this.request("GET", "/service_catalog/items", null, params);
  }

  getServiceCatalogItem(id) {
    return this.request("GET", `/service_catalog/items/${id}`);
  }

  placeServiceRequest(itemId, data) {
    return this.request("POST", `/service_catalog/items/${itemId}/place_request`, data);
  }

  // Knowledge Base (Solutions)
  listSolutionCategories(params = {}) {
    return this.request("GET", "/solutions/categories", null, params);
  }

  getSolutionCategory(id) {
    return this.request("GET", `/solutions/categories/${id}`);
  }

  listSolutionFolders(categoryId, params = {}) {
    return this.request("GET", `/solutions/categories/${categoryId}/folders`, null, params);
  }

  getSolutionFolder(id) {
    return this.request("GET", `/solutions/folders/${id}`);
  }

  listSolutionArticles(folderId, params = {}) {
    return this.request("GET", `/solutions/folders/${folderId}/articles`, null, params);
  }

  getSolutionArticle(id) {
    return this.request("GET", `/solutions/articles/${id}`);
  }

  createSolutionArticle(data) {
    return this.request("POST", "/solutions/articles", data);
  }

  updateSolutionArticle(id, data) {
    return this.request("PUT", `/solutions/articles/${id}`, data);
  }

  deleteSolutionArticle(id) {
    return this.request("DELETE", `/solutions/articles/${id}`);
  }

  // Search (Freshservice filter endpoint)
  filterTickets(query) {
    return this.request("GET", "/tickets/filter", null, { query });
  }
}
