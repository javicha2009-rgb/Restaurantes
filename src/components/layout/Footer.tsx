import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="container-professional">
        <div className="py-8">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            {/* Company Info */}
            <div>
              <h3 className="font-semibold text-corporate mb-3">Mesa Link Order</h3>
              <p className="text-corporate-muted leading-relaxed">
                Solución profesional para la gestión de pedidos en establecimientos de hostelería.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-corporate mb-3">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-corporate-muted hover:text-primary transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/portal" className="text-corporate-muted hover:text-primary transition-colors">
                    Portal
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-corporate-muted hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-corporate mb-3">Contacto</h3>
              <div className="space-y-2 text-corporate-muted">
                <p>soporte@mesalinkorder.com</p>
                <p>+34 900 123 456</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border mt-8 pt-6 text-center">
            <p className="text-corporate-muted text-sm">
              © {currentYear} Mesa Link Order. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;