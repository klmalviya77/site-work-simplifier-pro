
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "next-themes";

// Pages
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CreateEstimatePage from "./pages/CreateEstimatePage";
import SummaryPage from "./pages/SummaryPage";
import SavedEstimatesPage from "./pages/SavedEstimatesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import SplashScreen from "./components/SplashScreen";
import MaterialGuidePage from "./pages/MaterialGuidePage";
import CalculatorPage from "./pages/CalculatorPage";

const queryClient = new QueryClient();

// Route guard for protected routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/create-estimate" element={
          <ProtectedRoute>
            <CreateEstimatePage />
          </ProtectedRoute>
        } />
        
        <Route path="/summary" element={
          <ProtectedRoute>
            <SummaryPage />
          </ProtectedRoute>
        } />
        
        <Route path="/saved" element={
          <ProtectedRoute>
            <SavedEstimatesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/guide" element={
          <ProtectedRoute>
            <MaterialGuidePage />
          </ProtectedRoute>
        } />
        
        <Route path="/calculator" element={
          <ProtectedRoute>
            <CalculatorPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
