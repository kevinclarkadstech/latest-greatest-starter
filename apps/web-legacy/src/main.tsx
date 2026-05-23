import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createInMemoryCache } from "./dependencies/cache/in-memory-cache";
export const testCache = createInMemoryCache();
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
