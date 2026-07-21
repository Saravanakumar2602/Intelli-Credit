import { api } from "./api";
import type { SearchHit, SearchQuery, SavedSearch } from "./search.service";

export const searchService = {
  async search(q: SearchQuery): Promise<SearchHit[]> {
    const { data } = await api.get(
      `/search/?q=${encodeURIComponent(q.q)}&status=${q.status || ""}`,
    );
    const results = data.results || [];
    
    // Map database search result schema to UI SearchHit types
    return results.map((item: any) => ({
      id: String(item.id),
      entity: "application" as const,
      title: item.company_name,
      subtitle: `${item.sector} sector • INR ${Number(item.amount).toLocaleString()}`,
      href: `/applications/${item.id}`,
      updated_at: item.created_at,
      meta: {
        status: item.status,
        sector: item.sector,
      },
    }));
  },

  async listSaved(): Promise<SavedSearch[]> {
    try {
      return JSON.parse(localStorage.getItem("ic.saved-searches") || "[]");
    } catch {
      return [];
    }
  },

  async save(name: string, q: SearchQuery): Promise<SavedSearch> {
    const item: SavedSearch = {
      id: `saved-${Date.now()}`,
      name,
      query: q,
      created_at: new Date().toISOString(),
    };
    try {
      const list = await this.listSaved();
      list.push(item);
      localStorage.setItem("ic.saved-searches", JSON.stringify(list));
    } catch {
      // Ignore write errors
    }
    return item;
  },
};

// Client-side helpers for recent searches (local persistence only).
const RECENT_KEY = "intelli-credit.recent-search-terms";
export function readRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 8);
  } catch {
    return [];
  }
}
export function pushRecentSearch(q: string) {
  if (!q.trim()) return;
  try {
    const next = [q, ...readRecentSearches().filter((r) => r !== q)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
