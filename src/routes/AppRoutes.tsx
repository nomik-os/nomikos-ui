import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import AuthPage from "../pages/AuthPage.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

export default AppRoutes;