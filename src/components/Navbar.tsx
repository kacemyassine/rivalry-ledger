import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  Archive,
  BarChart2,
  Trophy,
  Lock,
  Unlock,
} from "lucide-react";
import { AuthService } from "@/lib/authService";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
    const listener = (state: boolean) => setIsAuthenticated(state);
    AuthService.addListener(listener);
    return () => AuthService.removeListener(listener);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleAdminAccess = () => {
    try {
      if (AuthService.authenticate(password)) {
        navigate("/admin");
        setOpenDialog(false);
        setPassword("");
        setError("");
      } else {
        setError("Incorrect password");
        setPassword("");
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
      setPassword("");
    }
  };

  const handleAdminClick = () => {
    setMobileMenuOpen(false);
    if (isAuthenticated) navigate("/admin");
    else setOpenDialog(true);
  };

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Archived", path: "/archived-leagues", icon: Archive },
    { label: "Statistics", path: "/statistics", icon: BarChart2 },
    { label: "Cups", path: "/cups", icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Global Dialog — works on both mobile and desktop */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-[90vw] max-w-[400px] bg-[#0d1133] border border-yellow-400/20 shadow-2xl z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-xl text-yellow-300 text-center">
              Admin Access
            </DialogTitle>
            <DialogDescription className="text-yellow-200/40 text-sm text-center">
              Enter your password to continue
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="text-center text-4xl">🗝️</div>
            <Input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyPress={(e) => e.key === "Enter" && handleAdminAccess()}
              autoFocus
              className="bg-[#0a0e2a] border-yellow-400/20 text-yellow-100 placeholder:text-yellow-200/20 focus:border-yellow-400/50 py-5 text-center text-lg tracking-widest"
            />
            {error && (
              <p
                data-testId="password-error"
                className="text-red-400 text-sm text-center"
              >
                {error}
              </p>
            )}
            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  setPassword("");
                  setError("");
                }}
                className="flex-1 border-yellow-400/20 text-yellow-200/50 hover:bg-yellow-400/10 hover:text-yellow-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminAccess}
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold"
              >
                Enter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating pill navbar */}
      <div
        data-navbar
        className="fixed top-4 left-0 w-full z-[999] px-4 flex justify-center pointer-events-none"
      >
        <nav
          className={`pointer-events-auto w-full max-w-4xl transition-all duration-500 ${
            scrolled
              ? "bg-[#0a0e2a]/80 backdrop-blur-xl shadow-2xl shadow-yellow-400/10"
              : "bg-[#0a0e2a]/60 backdrop-blur-md"
          } rounded-2xl border border-yellow-400/15`}
        >
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent rounded-full" />

          <div className="flex items-center justify-between px-5 h-14">
            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center gap-2 group shrink-0"
              data-testid="navbar-logo"
            >
              <img
                src="images/rivalry-ledger-logo.webp"
                alt="Rivalry Ledger logo"
                className="w-8 h-8"
              />
              <span className="font-bold text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 whitespace-nowrap">
                Rivalry Ledger
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  aria-current={isActive(path) ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? "text-yellow-300 bg-yellow-400/15"
                      : "text-yellow-100/50 hover:text-yellow-200 hover:bg-yellow-400/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {isActive(path) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Desktop Admin button */}
            <div className="hidden md:flex items-center shrink-0">
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-400/25 text-yellow-300/70 hover:text-yellow-300 hover:border-yellow-400/50 hover:bg-yellow-400/10 text-sm font-medium transition-all duration-200"
              >
                {isAuthenticated ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" /> Admin
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Admin
                  </>
                )}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testId="mobile-hamburger"
              className="md:hidden p-2 text-yellow-300/70 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div data-testId="mobile-menu" className="md:hidden border-t border-yellow-400/10 px-4 py-3 flex flex-col gap-1">
              {navItems.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  aria-current={isActive(path) ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(path)
                      ? "text-yellow-300 bg-yellow-400/15"
                      : "text-yellow-100/50 hover:text-yellow-200 hover:bg-yellow-400/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-yellow-300/60 hover:text-yellow-300 hover:bg-yellow-400/10 transition-all border-t border-yellow-400/10 mt-1 pt-4"
              >
                {isAuthenticated ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Admin
              </button>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
