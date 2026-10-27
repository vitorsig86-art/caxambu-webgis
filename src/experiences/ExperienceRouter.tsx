import { lazy, Suspense, useState } from "react";
import { App } from "../App";

const CommunityExperience = lazy(() => import("./CommunityExperience"));

export function ExperienceRouter() {
  const [community] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("experience");
    return requested === "community" || (requested !== "technical" && window.matchMedia("(max-width: 760px)").matches);
  });
  return community ? <Suspense fallback={<div role="status" style={{ padding: 24, background: "#f6f5ee", height: "100%" }}>Abrindo Caxambu Bairro Vivo…</div>}><CommunityExperience /></Suspense> : <App />;
}
