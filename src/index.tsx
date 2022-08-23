import React, { StrictMode } from "react";
import * as ReactDOMClient from "react-dom/client";
import React100VH from "react-div-100vh";
import "./styles.css";

import App from "./App";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <StrictMode>
    <React100VH>
      <App />
    </React100VH>
  </StrictMode>
);
