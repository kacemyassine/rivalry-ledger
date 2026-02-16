import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Menu, X } from "lucide-react";
import { AuthService } from "@/lib/authService";

const Navbar = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Subscribe to AuthService updates
  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());

    const listener = (state: boolean) => {
      setIsAuthenticated(state);
    };
    AuthService.addListener(listener);

    return () => {
      AuthService.removeListener(listener);
    };
  }, []);

  const handleAdminAccess = () => {
    if (AuthService.authenticate(password)) {
      navigate("/admin");
      setOpenDialog(false);
      setPassword("");
      setError("");
    } else {
      setError("❌ Incorrect password");
      setPassword("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdminAccess();
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate("/admin");
    } else {
      setOpenDialog(true);
    }
  };

  const navItems = [
    { label: "🏠 Home", onClick: () => { navigate("/"); setMobileMenuOpen(false); } },
    { label: "📦 Archived Leagues", onClick: () => { navigate("/archived-leagues"); setMobileMenuOpen(false); } },
    { label: "📊 Statistics", onClick: () => { navigate("/statistics"); setMobileMenuOpen(false); } },
    { label: "🏆 Cups", onClick: () => { navigate("/cups"); setMobileMenuOpen(false); } },
  ];

  return (
    <nav className="relative w-full bg-gradient-to-b from-[hsl(210_60%_6%)] via-[hsl(200_50%_12%)] to-[hsl(210_45%_12%)] border-b border-[hsl(200_40%_25%)] shadow-2xl shadow-[hsl(180_80%_50%)]/10">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div onClick={() => navigate("/")} className="cursor-pointer flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[hsl(180_80%_50%)] via-[hsl(45_85%_55%)] to-[hsl(180_80%_50%)] bg-clip-text text-transparent hover:scale-105 transition-transform">
              ⚽ COSMUS LEAGUE 🏆
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                onClick={item.onClick}
                className="text-[hsl(180_30%_95%)] hover:text-[hsl(45_85%_55%)] hover:bg-[hsl(200_40%_20%)] transition-all duration-300 whitespace-nowrap font-body text-sm lg:text-base"
              >
                {item.label}
              </Button>
            ))}

            {/* Admin Button ALWAYS visible */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAdminClick}
                  className="ml-2 bg-gradient-to-r from-[hsl(180_70%_45%)] to-[hsl(45_85%_55%)] text-[hsl(210_50%_8%)] hover:shadow-lg hover:shadow-[hsl(180_80%_50%)]/50 transition-all duration-300 font-body font-semibold"
                >
                  {isAuthenticated ? "🔓 Admin" : "🔒 Admin"}
                </Button>
              </DialogTrigger>

              {!isAuthenticated && (
                <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-[hsl(210_45%_12%)] to-[hsl(210_50%_8%)] border border-[hsl(180_80%_50%)]/30 shadow-2xl shadow-[hsl(180_80%_50%)]/20">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-[hsl(180_30%_95%)] text-center">
                      🔐 Admin Access 🔐
                    </DialogTitle>
                    <DialogDescription className="text-[hsl(180_20%_65%)] text-base text-center">
                      🌊 Enter your secret password to access the Atlantis Command Center
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-6">
                    <div className="flex items-center justify-center text-5xl mb-4">🗝️</div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-[hsl(180_30%_95%)] text-center">
                        🔑 Enter Security Code:
                      </label>
                      <Input
                        type="password"
                        placeholder="••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        className="bg-[hsl(210_40%_20%)] border-[hsl(180_80%_50%)]/40 text-[hsl(180_30%_95%)] placeholder:text-[hsl(180_20%_65%)] placeholder:text-lg focus:border-[hsl(180_80%_50%)] focus:ring-[hsl(180_80%_50%)]/50 py-6 text-center text-xl tracking-widest"
                      />
                      {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
                    </div>
                    <div className="text-center text-sm text-[hsl(180_20%_65%)]">💡 Need the password? Contact the Atlantis Council</div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => { setOpenDialog(false); setPassword(""); setError(""); }}
                      className="border-[hsl(200_40%_25%)] text-[hsl(180_30%_95%)] hover:bg-[hsl(200_40%_20%)] font-semibold"
                    >
                      ❌ Cancel
                    </Button>
                    <Button
                      onClick={handleAdminAccess}
                      className="bg-gradient-to-r from-[hsl(180_70%_45%)] to-[hsl(45_85%_55%)] text-[hsl(210_50%_8%)] font-semibold"
                    >
                      ✅ Access
                    </Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[hsl(180_30%_95%)] hover:bg-[hsl(200_40%_20%)] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
