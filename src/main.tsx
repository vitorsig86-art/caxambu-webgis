import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { ExperienceRouter } from "./experiences/ExperienceRouter";
import "./theme.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExperienceRouter />
    <Analytics />
  </StrictMode>,
);
