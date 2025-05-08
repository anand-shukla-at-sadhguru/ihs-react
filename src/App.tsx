// src/App.tsx
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import AdmissionRegistrationPage from '@/pages/AdmissionRegistrationPage';
import AllApplicationsPage from '@/pages/AllApplicationsPage';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useTheme } from '@/hooks/useTheme';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

function App() {
  useTheme();

  return (
    <Router>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav className="flex gap-4">
              <Link to="/" className="text-lg font-semibold hover:text-primary">Home</Link>
              <Link to="/about" className="text-lg font-semibold hover:text-primary">About</Link>
              <Link to="/admission" className="text-lg font-semibold hover:text-primary">Admission</Link>
              <Link to="/all-applications" className="text-lg font-semibold hover:text-primary">All Applications</Link>
            </nav>
            <div className="ml-auto">
              <DarkModeToggle />
            </div>
          </header>
          <main className="flex-grow container mx-auto py-8 px-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admission" element={<AdmissionRegistrationPage />} />
              <Route path="/all-applications" element={<AllApplicationsPage />} />
            </Routes>
          </main>
          <footer className="container mx-auto py-4 px-6 text-center text-muted-foreground text-sm border-t">
            © {new Date().getFullYear()} My PWA Starter
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </Router>
  );
}

export default App;