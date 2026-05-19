import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import BuilderPage from "./pages/BuildPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/builder" element={<BuilderPage />} />
    </Routes>
  );
}