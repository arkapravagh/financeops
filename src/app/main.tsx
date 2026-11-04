/**
 * Browser entry point (loaded by index.html).
 *
 * Mounts the app inside React StrictMode and the router, and loads the Geist font and global styles.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app.component";
import "@fontsource-variable/geist";
import "../styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
