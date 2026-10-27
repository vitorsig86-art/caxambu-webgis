// Experience policy stays outside the cartographic project configuration.
// ExperienceRouter selects the community shell before creating a Viewer.
export interface TechnicalExperience {
  id: "technical";
  allow2D: boolean;
}

export function resolveTechnicalExperience(search: string): TechnicalExperience {
  return { id: "technical", allow2D: new URLSearchParams(search).get("sceneModes") === "on" };
}
