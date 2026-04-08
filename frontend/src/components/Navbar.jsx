import { useState, useEffect } from "react";
import { Scale, ShieldCheck, Link as LinkIcon, LogOut, Shield } from "lucide-react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/new-case", label: "New Case" },
  { to: "/cases", label: "My Cases" },
  { to: "/help", label: "Help" },
  { to: "/settings", label: "Settings" },
];

const Navbar = () => {
  const [lang, setLang] = useState("en");
  const [digiConnected, setDigiConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await api.checkAdminStatus();
        setIsAdmin(response.is_admin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    if (user) {
      checkAdmin();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Add admin link if user is admin
  const allNavLinks = isAdmin 
    ? [...navLinks, { to: "/admin", label: "Admin", icon: Shield }]
    : navLinks;

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary tracking-tight">Nyaya-Setu</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex rounded-full border border-border bg-secondary p-0.5 text-sm font-medium">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-3 py-1 rounded-full transition-colors ${
                lang === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              हिंदी
            </button>
          </div>

          {digiConnected ? (
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-success">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified: {user?.name || "User"}</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDigiConnected(true)}
              className="pulse-gentle gap-1.5"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Connect DigiLocker</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto px-4 md:px-6 -mb-px scrollbar-none">
        {allNavLinks.map((link) => {
          const isActive = location.pathname === link.to || 
            (link.to !== "/dashboard" && location.pathname.startsWith(link.to));
          const Icon = link.icon;
          
          return (
            <RouterNavLink
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {link.label}
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
