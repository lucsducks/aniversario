import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CameraFilter from "./components/CameraFilter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/camera-filter" element={<CameraFilter />} />
      </Routes>
    </Router>
  );
}

export default App;
