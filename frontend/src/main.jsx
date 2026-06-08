import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AnimationTestPage from "./pages/AnimationTestPage";

const isAnimationTestRoute = window.location.pathname === "/test-animations";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAnimationTestRoute ? <AnimationTestPage /> : <App />}
  </React.StrictMode>
);