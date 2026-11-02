import { NAVIGATION_ITEM_IDS, type NavigationItemId } from "@/lib/content-schema";

export function normalizeNavigationOrder(order?: readonly NavigationItemId[]): NavigationItemId[] {
  const seen = new Set<NavigationItemId>();
  const normalized = (order ?? []).filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return [...normalized, ...NAVIGATION_ITEM_IDS.filter((id) => !seen.has(id))];
}
