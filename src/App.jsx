import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FocusProvider } from "./context/FocusContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Live from "./pages/Live";
import History from "./pages/History";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import { useState } from "react";

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <p className="text-zinc-600 text-sm">Loading...</p>
      </div>
    );

  if (!user) return <Login onNewUser={() => setShowOnboarding(true)} />;

  if (showOnboarding)
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;

  return (
    <FocusProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Live />} />
          <Route path="/history" element={<History />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </FocusProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
