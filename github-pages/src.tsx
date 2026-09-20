import React from "react";
import { createRoot } from "react-dom/client";
import TradeFlowApp from "../app/tradeflow-app";
import "../app/globals.css";
import "./static-api";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><TradeFlowApp /></React.StrictMode>,
);
