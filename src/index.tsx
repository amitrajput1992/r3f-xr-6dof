import React, { StrictMode } from "react";
import * as ReactDOMClient from "react-dom/client";
import React100VH from "react-div-100vh";

import App from "./App";

const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <StrictMode>
    <React100VH>
      <App />
    </React100VH>
  </StrictMode>
);
