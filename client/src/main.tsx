/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * main.tsx - Application entry point
 * 
 * This file serves as the entry point for the VUSD application.
 * Key responsibilities:
 * - Rendering the root React component to the DOM
 * - Setting up the Web3Provider context for blockchain connectivity
 * - Establishing the top-level component hierarchy
 * 
 * The application structure ensures that all components have access to
 * web3 functionality through React context.
 */

import { createRoot } from "react-dom/client";
import { Web3Provider } from "./components/web3/Web3Provider";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
