// src/App.tsx
import { Routes, Route, Link, Navigate } from 'react-router-dom';
// import HomePage from '@/pages/HomePage';
import Guidelines from '@/pages/Guidelines';
import AdmissionRegistrationPage from '@/pages/AdmissionRegistrationPage';
import AllApplicationsPage from '@/pages/AllApplicationsPage';
// import DarkModeToggle from '@/components/DarkModeToggle';
import { useTheme } from '@/hooks/useTheme';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  // SidebarTrigger,
} from "@/components/ui/sidebar";
// import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import OrientationPage from './pages/OrientationPage';
import IHSLogo from './assets/IHS_logo.png'; // Adjust path if needed
import { Separator } from './components/ui/separator';
// import { Button } from './components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { NavUser } from './components/ui/nav-user';

// src/config/navigation.ts (or a similar path)

export interface NavItem {
  title: string;
  to: string; // Use 'to' for react-router Link
  requiresAdmissionsAgreed?: boolean; // Condition for visibility
  isExternal?: boolean; // If it's an external link
  icon?: React.ReactNode; // Optional icon for sidebar
  children?: NavItem[]; // For nested items (though your current AppSidebar doesn't show deep nesting directly)
}

export const mainNavigation: NavItem[] = [
  { title: "Guidelines", to: "/guidelines" },
  { title: "Admission", to: "/admission", requiresAdmissionsAgreed: true },
  { title: "All Applications", to: "/all-applications", requiresAdmissionsAgreed: true },
  { title: "Orientation", to: "/orientation", requiresAdmissionsAgreed: true }, // Assuming this also depends on agreement
];
// Example for your AppSidebar's grouped structure if needed:
export const sidebarNavigationData = [
  {
    groupTitle: "Application Process",
    items: [
      { title: "Guidelines", to: "/guidelines" },
      { title: "Orientation", to: "/orientation", requiresAdmissionsAgreed: true },
      { title: "Start Admission", to: "/admission", requiresAdmissionsAgreed: true },
    ]
  },
  {
    groupTitle: "Management",
    items: [
      { title: "View Applications", to: "/all-applications", requiresAdmissionsAgreed: true },
    ]
  }
  // Add more groups as needed
];

const SESSION_TOKEN_KEY = "oauth_token";
const USER_ID = "odoo_user_id";
// Key for storing the user ID
// const USER_ID_KEY = "app_odoo_user_id"; // We can add this later if needed

// Placeholder for your LoginPage component - we'll define it simply for now
// const LoginPagePlaceholder = ({ loginHandler }: { loginHandler: () => void; }) => (
//   <div className="flex flex-col items-center justify-center min-h-screen p-4">
//     <img src={IHSLogo} alt="Isha Home School Logo" className="h-20 md:h-24 w-auto object-contain mb-8" />
//     <h1 className="text-2xl font-semibold mb-6 text-center">Welcome to IHS Admissions Portal</h1>
//     <p className="text-muted-foreground mb-8 text-center max-w-md">
//       Please sign in to continue.
//     </p>
//     <Button onClick={loginHandler} size="lg">
//       Sign In with Isha SSO
//     </Button>
//   </div>
// );

function App() {
  useTheme();
  const [searchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const oauthToken = searchParams.get('oauth_token');
  const odooUserId = searchParams.get('odoo_user_id');
  const getItem = async (key: string): Promise<string | null> => localStorage.getItem(key);
  const setItem = async (key: string, value: string): Promise<void> => localStorage.setItem(key, value);
  const removeItem = async (key: string): Promise<void> => localStorage.removeItem(key);
  // --- Track admissionsAgreed in state so NavBar updates immediately ---
  const [admissionsAgreed, setAdmissionsAgreed] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("admissions_agreed") === "true"
  );

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoadingAuth(true);
      console.log("Checking initial login status from localStorage...");
      try {
        const storedToken = await getItem(SESSION_TOKEN_KEY);
        const user_id = await getItem(USER_ID);
        if (storedToken && user_id) {
          console.log("Token found in storage:", storedToken, user_id);
          setIsLoggedIn(true);
        } else {
          if (oauthToken && odooUserId) {
            console.log("OAuth token and user ID found in URL:", oauthToken, odooUserId);
            await setItem(SESSION_TOKEN_KEY, oauthToken);
            await setItem(USER_ID, odooUserId);
            setIsLoggedIn(true);
            setIsLoadingAuth(false);
            return;
          } else {
            console.log("No token found in storage.");
            setIsLoggedIn(false);
            handleSSOLogin(); // Redirect to SSO login
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false); // Default to logged out on error
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkLoginStatus();
  }, []);

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

  // Placeholder for login handler - will redirect to SSO
  const handleSSOLogin = () => {
    window.location.href = `${import.meta.env.VITE_QA_URL}/mobile-sso-signin`;
  };

  // Placeholder for logout handler
  const handleLogout = async () => {
    console.log("Logging out...");
    await removeItem(SESSION_TOKEN_KEY);
    await removeItem(USER_ID);
    setIsLoggedIn(false);
    // Optionally, redirect to login or guidelines page:
    window.location.href = "/guidelines";
    // setUserProfile(null);
    // navigate('/'); // Redirect after logout
  };

  // Loading state while checking auth status
  if (isLoadingAuth || isLoggedIn === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-foreground">Loading Application...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar navigationItems={mainNavigation} admissionsAgreed={admissionsAgreed} />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 z-40">
          {/* Left side of the header (e.g., Logo or Hamburger) */}
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="md:hidden flex items-center"> {/* Wrapper to control visibility of both */}
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 h-6" /> {/* Added mx-2 for spacing */}
            </div>
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
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-nowrap"> {/* Hide on small screens, show on md+ */}
              {mainNavigation.map((item) => {
                if (item.requiresAdmissionsAgreed && !admissionsAgreed) {
                  return null; // Don't render if condition not met
                }
                return (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
            {isLoggedIn && <div className='flex flex-shrink-0 items-center gap-1'> {/* Flex container for user and dark mode toggle */}
              {/* Add a Mobile Nav Menu/Drawer Trigger for smaller screens */}
              <NavUser handleLogout={handleLogout} user={{
                name: "shadcn",
                email: "m@example.com",
                avatar: "/avatars/shadcn.jpg",
              }} />
            </div>}
          </div>
        </header>
        <main className="flex-grow container mx-auto py-8 px-6">
          {/* <BrowserRouter> */}
          <Routes>
            <Route path="/" element={<Navigate to="/guidelines" replace />} />
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/admission" element={<AdmissionRegistrationPage />} />
            <Route path="/all-applications" element={<AllApplicationsPage />} />
            <Route path="/orientation" element={<OrientationPage />} />
          </Routes>
          {/* </BrowserRouter> */}
        </main>
        <footer className="container mx-auto py-4 px-6 text-center text-muted-foreground text-sm border-t">
          © {new Date().getFullYear()} My PWA Starter
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;