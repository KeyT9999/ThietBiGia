import type { WorkProject } from "@/data/schema";

/** Older projects were already visible in the home carousel before this setting existed. */
export function getHome3DWorks(works: WorkProject[]) {
  return works.filter((work) => work.showOnHome3D !== false);
}
