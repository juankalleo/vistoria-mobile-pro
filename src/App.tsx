import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { HomeScreen } from "./screens/HomeScreen";
import { FormScreen } from "./screens/FormScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { VerifyOTPScreen } from "./screens/VerifyOTPScreen";
import { AdminPanel } from "./screens/AdminPanel";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./store/useAuthStore";

const queryClient = new QueryClient();

// Componente para proteger rotas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, sessionLoading } = useAuthStore();
  
  if (sessionLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

// Componente para proteger rotas admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, sessionLoading } = useAuthStore();
  
  if (sessionLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
}

const App = () => {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    // Verificar sessão ao carregar a app
    checkSession();
  }, []);  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Autenticação */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/verify-otp" element={<VerifyOTPScreen />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />

            {/* App Principal */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomeScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/vistoria"
              element={
                <PrivateRoute>
                  <FormScreen />
                </PrivateRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
