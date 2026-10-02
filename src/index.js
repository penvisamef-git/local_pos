import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./theme"; // last theme used on this computer, before the first paint
import App from "./App";
import CustomerDisplay from "./screens/CustomerDisplay";

ReactDOM.createRoot(document.getElementById("root")).render(window.location.pathname.startsWith("/display") ? <CustomerDisplay /> : <App />);
