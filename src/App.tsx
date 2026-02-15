import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisitorPage from "./pages/VisitorPage";
import AdminPage from "./pages/AdminPage";
import StatisticsPage from "./pages/StatisticsPage";
import ArchivedLeagues from "./pages/ArchivedLeagues";
import Cups from "./pages/Cups";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<VisitorPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/archived-leagues" element={<ArchivedLeagues />} />
          <Route path="/cups" element={<Cups />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
