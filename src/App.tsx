
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

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
import MaterialGuideDetailPage from "./pages/MaterialGuideDetailPage";
import CalculatorPage from "./pages/CalculatorPage";

// Route guard for protected routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    // Show a better loading state with skeleton UI
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-mistryblue-500 text-white p-4 shadow-md">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex-grow p-4 max-w-lg mx-auto w-full">
          <Skeleton className="h-12 w-full mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [splashTimeout, setSplashTimeout] = useState<NodeJS.Timeout | null>(null);
  const { isLoading } = useAuth();
  
  // Ensure splash screen doesn't get stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Max 3 seconds for splash screen
    
    setSplashTimeout(timer);
    
    return () => {
      if (splashTimeout) clearTimeout(splashTimeout);
    };
  }, []);
  
  // Handle splash screen completion
  const handleSplashComplete = () => {
    if (splashTimeout) clearTimeout(splashTimeout);
    setShowSplash(false);
  };
  
  // Don't render routes until authentication is initialized
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
  return (
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
  );
};

function App() {
  // Create a client with better error handling
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 10000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
