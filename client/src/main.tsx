/**
 * Copyright 2025 Hemi Labs. All rights reserved.
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
