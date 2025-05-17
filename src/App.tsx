// src/App.tsx
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import HomePage from '@/pages/HomePage';
import Guidelines from '@/pages/Guidelines';
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
import { useEffect, useState } from "react";

function App() {
  useTheme();

  // --- Track admissionsAgreed in state so NavBar updates immediately ---
  const [admissionsAgreed, setAdmissionsAgreed] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("admissions_agreed") === "true"
  );

  useEffect(() => {
    // Listen for changes from other tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === "admissions_agreed") {
        setAdmissionsAgreed(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);

    // Listen for changes in this tab (in case setItem is called directly)
    const origSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value, ...rest) {
      origSetItem.apply(this, [key, value, ...rest]);
      if (key === "admissions_agreed") {
        setAdmissionsAgreed(value === "true");
      }
    };

    return () => {
      window.removeEventListener("storage", onStorage);
      localStorage.setItem = origSetItem;
    };
  }, []);

  return (
    <Router>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4 z-40">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav className="flex gap-4">
              {/* <Link to="/" className="text-lg font-semibold hover:text-primary">Home</Link> */}
              <Link to="/guidelines" className="text-lg font-semibold hover:text-primary">Guidelines</Link>
              {admissionsAgreed && (
                <>
                  <Link to="/admission" className="text-lg font-semibold hover:text-primary">Admission</Link>
                  <Link to="/all-applications" className="text-lg font-semibold hover:text-primary">All Applications</Link>
                </>
              )}
            </nav>
            <div className="ml-auto">
              <DarkModeToggle />
            </div>
          </header>
          <main className="flex-grow container mx-auto py-8 px-6">
            <Routes>
              {/* <Route path="/" element={<HomePage />} /> */}
              <Route path="/guidelines" element={<Guidelines />} />
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