import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, QrCode, Settings, Home, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Portal Bares", href: "/portal", icon: Users },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="nav-professional sticky top-0 z-50 w-full">
      <div className="container-professional flex h-16 items-center justify-between">
        {/* Logo - Left Side */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground">
            <QrCode className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-corporate">MesaLink</span>
            <span className="text-xs text-corporate-muted font-medium">Sistema de Gestión</span>
          </div>
        </Link>

        {/* Right Side - Navigation and CTA */}
        <div className="flex items-center gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                    isActive(item.href)
                      ? "text-primary font-semibold bg-muted"
                      : "text-corporate-muted hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Button asChild className="btn-professional">
              <Link to="/solicitardemostracion">
                <BarChart3 className="mr-2 h-4 w-4" />
                Solicitar Demo
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="btn-professional-sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-card">
              <div className="flex flex-col space-y-6 mt-8">
                {/* Mobile Logo */}
                <div className="flex items-center space-x-3 px-2">
                  <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-semibold text-corporate">MesaLink</span>
                    <span className="text-sm text-corporate-muted">Sistema de Gestión</span>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`nav-item flex items-center space-x-3 px-4 py-3 text-sm font-medium ${
                          isActive(item.href)
                            ? "text-primary font-semibold bg-muted"
                            : "text-corporate-muted hover:text-primary"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile CTA */}
                <div className="px-2 pt-4 border-t border-border">
                  <Button asChild className="w-full btn-professional">
                    <Link to="/solicitardemostracion" onClick={() => setIsOpen(false)}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Solicitar Demo
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;