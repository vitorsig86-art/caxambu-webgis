import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { ExperienceRouter } from "./experiences/ExperienceRouter";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExperienceRouter />
  </StrictMode>,
);
