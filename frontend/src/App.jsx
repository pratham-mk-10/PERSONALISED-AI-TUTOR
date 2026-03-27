import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import SessionPage from "./components/session/SessionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/session" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;