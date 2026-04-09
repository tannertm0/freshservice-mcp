import { z } from "zod";

const ARTICLE_STATUS_MAP = { 1: "Draft", 2: "Published" };

function formatCategory(c) {
  return `#${c.id} — ${c.name} | Description: ${c.description || "N/A"}`;
}

function formatFolder(f) {
  return [
    `#${f.id} — ${f.name}`,
    `  Category: ${f.category_id || "N/A"} | Visibility: ${f.visibility || "N/A"}`,
    `  Description: ${f.description || "N/A"}`,
  ].join("\n");
}

function formatArticle(a) {
  return [
    `#${a.id} — ${a.title}`,
    `  Status: ${ARTICLE_STATUS_MAP[a.status] || a.status} | Folder: ${a.folder_id || "N/A"}`,
    `  Views: ${a.thumbs_up ?? "N/A"} up / ${a.thumbs_down ?? "N/A"} down`,
    `  Created: ${a.created_at} | Updated: ${a.updated_at}`,
  ].join("\n");
}

export function registerKnowledgeBaseTools(server, client) {
  server.tool(
    "list_solution_categories",
    "List knowledge base categories in Freshservice",
    {
      page: z.number().optional(),
      per_page: z.number().max(100).optional(),
    },
    async (args) => {
      const result = await client.listSolutionCategories(args);
      const items = result.categories || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No solution categories found." }] };
      }
      return {
        content: [{ type: "text", text: `Found ${items.length} category(ies):\n\n${items.map(formatCategory).join("\n")}` }],
      };
    }
  );

  server.tool(
    "get_solution_category",
    "Get details of a knowledge base category",
    {
      category_id: z.number().describe("The category ID"),
    },
    async ({ category_id }) => {
      const result = await client.getSolutionCategory(category_id);
      return { content: [{ type: "text", text: formatCategory(result.category) }] };
    }
  );

  server.tool(
    "list_solution_folders",
    "List folders in a knowledge base category",
    {
      category_id: z.number().describe("The category ID"),
      page: z.number().optional(),
      per_page: z.number().max(100).optional(),
    },
    async ({ category_id, ...params }) => {
      const result = await client.listSolutionFolders(category_id, params);
      const items = result.folders || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No folders found in this category." }] };
      }
      return {
        content: [{ type: "text", text: `Found ${items.length} folder(s):\n\n${items.map(formatFolder).join("\n\n")}` }],
      };
    }
  );

  server.tool(
    "get_solution_folder",
    "Get details of a knowledge base folder",
    {
      folder_id: z.number().describe("The folder ID"),
    },
    async ({ folder_id }) => {
      const result = await client.getSolutionFolder(folder_id);
      return { content: [{ type: "text", text: formatFolder(result.folder) }] };
    }
  );

  server.tool(
    "list_solution_articles",
    "List articles in a knowledge base folder",
    {
      folder_id: z.number().describe("The folder ID"),
      page: z.number().optional(),
      per_page: z.number().max(100).optional(),
    },
    async ({ folder_id, ...params }) => {
      const result = await client.listSolutionArticles(folder_id, params);
      const items = result.articles || [];
      if (items.length === 0) {
        return { content: [{ type: "text", text: "No articles found in this folder." }] };
      }
      const text = items.map(formatArticle).join("\n\n");
      return {
        content: [{ type: "text", text: `Found ${items.length} article(s):\n\n${text}` }],
      };
    }
  );

  server.tool(
    "get_solution_article",
    "Get a knowledge base article with full content",
    {
      article_id: z.number().describe("The article ID"),
    },
    async ({ article_id }) => {
      const result = await client.getSolutionArticle(article_id);
      const a = result.article;
      const text = [
        formatArticle(a),
        `\n--- Content ---\n${a.description_text || a.description || "N/A"}`,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "create_solution_article",
    "Create a new knowledge base article",
    {
      title: z.string().describe("Article title"),
      description: z.string().describe("Article content (HTML supported)"),
      folder_id: z.number().describe("Folder ID to create article in"),
      status: z.number().min(1).max(2).optional().describe("1=Draft, 2=Published"),
      tags: z.array(z.string()).optional().describe("Article tags"),
    },
    async (args) => {
      const result = await client.createSolutionArticle(args);
      const a = result.article;
      return {
        content: [{ type: "text", text: `Article created!\n\n${formatArticle(a)}` }],
      };
    }
  );

  server.tool(
    "update_solution_article",
    "Update an existing knowledge base article",
    {
      article_id: z.number().describe("The article ID to update"),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.number().min(1).max(2).optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ article_id, ...updates }) => {
      const result = await client.updateSolutionArticle(article_id, updates);
      const a = result.article;
      return {
        content: [{ type: "text", text: `Article updated!\n\n${formatArticle(a)}` }],
      };
    }
  );

  server.tool(
    "delete_solution_article",
    "Delete a knowledge base article",
    {
      article_id: z.number().describe("The article ID to delete"),
    },
    async ({ article_id }) => {
      await client.deleteSolutionArticle(article_id);
      return {
        content: [{ type: "text", text: `Article #${article_id} deleted successfully.` }],
      };
    }
  );
}
