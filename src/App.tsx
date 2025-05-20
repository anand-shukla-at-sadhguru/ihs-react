// src/App.tsx
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
// import HomePage from '@/pages/HomePage';
import Guidelines from '@/pages/Guidelines';
import AdmissionRegistrationPage from '@/pages/AdmissionRegistrationPage';
import AllApplicationsPage from '@/pages/AllApplicationsPage';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useTheme } from '@/hooks/useTheme';
// import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  // SidebarTrigger,
} from "@/components/ui/sidebar";
// import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import OrientationPage from './pages/OrientationPage';
import IHSLogo from './assets/IHS_logo.png'; // Adjust path if needed

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
        {/* <AppSidebar /> */}
        <SidebarInset>
          <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 z-40">
            {/* Left side of the header (e.g., Logo or Hamburger) */}
            <div className="flex items-center gap-2">
              {/* <SidebarTrigger className="-ml-1" /> */}
              {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
              {/* Logo */}
              <Link to="/guidelines" className="flex items-center"> {/* Use a relevant link for the logo, or "/" for home */}
                <img
                  src={IHSLogo}
                  alt="Isha Home School Logo"
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right side of the header - Nav links and DarkModeToggle */}
            <div className="flex items-center gap-4 md:gap-6"> {/* Outer container for right-aligned items */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-base font-medium"> {/* Hide on small screens, show on md+ */}
                <Link to="/guidelines" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guidelines
                </Link>
                {admissionsAgreed && (
                  <>
                    <Link to="/admission" className="text-muted-foreground hover:text-foreground transition-colors">
                      Admission
                    </Link>
                    <Link to="/all-applications" className="text-muted-foreground hover:text-foreground transition-colors">
                      All Applications
                    </Link>
                    <Link to="/orientation" className="text-muted-foreground hover:text-foreground transition-colors">
                      Orientation
                    </Link>
                  </>
                )}
              </nav>
              <DarkModeToggle />
              {/* Add a Mobile Nav Menu/Drawer Trigger for smaller screens */}
              <div className="md:hidden">
                {/* Replace with your actual mobile menu trigger, e.g., a Hamburger icon button */}
                {/* <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
            </Button> */}
              </div>
            </div>
          </header>
          <main className="flex-grow container mx-auto py-8 px-6">
            <Routes>
              {/* <Route path="/" element={<HomePage />} /> */}
              <Route path="/" element={<Navigate to="/guidelines" replace />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/admission" element={<AdmissionRegistrationPage />} />
              <Route path="/all-applications" element={<AllApplicationsPage />} />
              <Route path="/orientation" element={<OrientationPage />} />
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