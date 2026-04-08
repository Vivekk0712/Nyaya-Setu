import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import CaseHistory from "./pages/CaseHistory";
import Settings from "./pages/Settings";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/case" element={<Index />} />
            <Route path="/cases" element={<CaseHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
