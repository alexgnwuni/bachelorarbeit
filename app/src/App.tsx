import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Introduction from "./pages/Introduction";
import { TooltipProvider } from "@/components/ui/tooltip";
import Study from "./pages/Study";
import Results from "./pages/Results";

const queryClient = new QueryClient();

// TooltipProvider noch in Zukunft richtig verwenden für entsprechende Tipps

const App = () => (
  <QueryClientProvider client={queryClient}>   
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/study" element={<Study />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
