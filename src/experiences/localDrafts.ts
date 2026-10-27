export const draftCategories = ["Natureza e ambiente", "Cuidado com o bairro", "Ideia para a comunidade"] as const;
export interface LocalDraft {
  id: string;
  title: string;
  description: string;
  category: typeof draftCategories[number];
  createdAt: string;
  location?: [number, number];
}
const key = "caxambu-bairro-vivo:drafts:v1";

export function readDrafts(): LocalDraft[] {
  // Fail visibly instead of overwriting unreadable or unavailable storage.
  const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
  if (!Array.isArray(value) || value.some(draft => !draft || typeof draft !== "object"
    || typeof draft.id !== "string" || typeof draft.title !== "string" || typeof draft.description !== "string"
    || !draftCategories.includes(draft.category) || typeof draft.createdAt !== "string"
    || !Number.isFinite(Date.parse(draft.createdAt))
    || (draft.location !== undefined && (!Array.isArray(draft.location) || draft.location.length !== 2
      || !draft.location.every(Number.isFinite) || Math.abs(draft.location[0]) > 180 || Math.abs(draft.location[1]) > 90)))) {
    throw new Error("Não foi possível ler os rascunhos deste aparelho.");
  }
  return value;
}

export function writeDrafts(drafts: LocalDraft[]): void {
  localStorage.setItem(key, JSON.stringify(drafts));
}
