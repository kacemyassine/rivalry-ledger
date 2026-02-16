import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AuthService from "@/services/AuthService";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  const handleLogin = () => {
    const success = AuthService.login(password);

    if (success) {
      setIsAuthenticated(true);
      setOpenDialog(false);
      setPassword("");
      setError("");
      navigate("/admin");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between bg-[hsl(210_50%_8%)] text-white">
      {/* Left Side */}
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-lg">
          Home
        </Link>
      </div>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-4">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                if (isAuthenticated) {
                  navigate("/admin");
                }
              }}
              className="ml-2 bg-gradient-to-r from-[hsl(180_70%_45%)] to-[hsl(45_85%_55%)] text-[hsl(210_50%_8%)] hover:shadow-lg hover:shadow-[hsl(180_80%_50%)]/50 transition-all duration-300 font-semibold"
            >
              {isAuthenticated ? "🔓 Admin" : "🔒 Admin"}
            </Button>
          </DialogTrigger>

          {!isAuthenticated && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Admin Password</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4 mt-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="px-4 py-2 border rounded-md text-black"
                />

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button onClick={handleLogin}>
                  Login
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[hsl(210_50%_8%)] flex flex-col items-center gap-4 py-6 md:hidden">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-bold"
          >
            Home
          </Link>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate("/admin");
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-40 bg-gradient-to-r from-[hsl(180_70%_45%)] to-[hsl(45_85%_55%)] text-[hsl(210_50%_8%)] font-semibold"
              >
                {isAuthenticated ? "🔓 Admin" : "🔒 Admin"}
              </Button>
            </DialogTrigger>

            {!isAuthenticated && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Admin Password</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="px-4 py-2 border rounded-md text-black"
                  />

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button onClick={handleLogin}>
                    Login
                  </Button>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
