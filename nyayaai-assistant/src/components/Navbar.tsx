import { useState } from "react";
import { Scale, ShieldCheck, Link } from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/case", label: "New Case" },
  { to: "/cases", label: "My Cases" },
  { to: "/help", label: "Help" },
  { to: "/settings", label: "Settings" },
];

const Navbar = () => {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [digiConnected, setDigiConnected] = useState(false);
  const location = useLocation();

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
              <span>Aadhaar Verified: Rajesh K.</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDigiConnected(true)}
              className="pulse-gentle gap-1.5"
            >
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Connect DigiLocker</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto px-4 md:px-6 -mb-px scrollbar-none">
        {navLinks.map((link) => {
          const isActive = link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to);
          return (
            <RouterNavLink
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {link.label}
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
