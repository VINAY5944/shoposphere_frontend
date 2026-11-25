import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

import App from "./App";
import { store } from "./app/store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster position="top-right" richColors />
    </Provider>
  </React.StrictMode>
);