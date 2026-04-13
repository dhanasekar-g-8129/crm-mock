import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AgentConfig from "./pages/agent-config/AgentConfig";

function Router() {
  const [path, setPath] = useState(window.location.hash);

  useEffect(() => {
    const onHash = () => setPath(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const configMatch = path.match(/^#\/agent-config\/(.+)$/);
  if (configMatch) return <AgentConfig agentId={configMatch[1]} />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
