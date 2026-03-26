import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import AuthPage from "../pages/AuthPage.tsx";
import AuthCallback from "../pages/AuthCallback.tsx";
import AuthSuccess from "../pages/AuthSuccess.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
    </Routes>
  );
};

export default AppRoutes;