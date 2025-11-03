import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  QrCode, 
  Smartphone, 
  Clock, 
  CreditCard, 
  BarChart3, 
  Users, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: QrCode,
      title: "Códigos QR por Mesa",
      description: "Cada mesa tiene su propio código QR único para pedidos instantáneos"
    },
    {
      icon: Smartphone,
      title: "Pedidos Móviles",
      description: "Los clientes piden directamente desde su móvil sin apps adicionales"
    },
    {
      icon: Clock,
      title: "Tiempo Real",
      description: "Gestión de pedidos y comandas en tiempo real para máxima eficiencia"
    },
    {
      icon: CreditCard,
      title: "Pagos Integrados",
      description: "Sistema de pagos completo con múltiples métodos de pago"
    },
    {
      icon: BarChart3,
      title: "Analytics Avanzados",
      description: "Estadísticas detalladas de ventas, productos más vendidos y tendencias"
    },
    {
      icon: Users,
      title: "Gestión de Personal",
      description: "Control de accesos y roles para tu equipo de trabajo"
    }
  ];

  const benefits = [
    "Reduce tiempo de espera hasta 70%",
    "Aumenta ventas promedio 25%",
    "Elimina errores en pedidos",
    "Mejora experiencia del cliente",
    "Optimiza gestión de personal",
    "Datos en tiempo real"
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="section-professional bg-background">
        <div className="container-professional">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-8 bg-muted text-corporate border border-border px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              Solución Empresarial para Hostelería
            </Badge>
            
            <h1 className="mb-8 text-4xl md:text-5xl font-semibold tracking-tight text-corporate leading-tight">
              Sistema Profesional de Gestión de Pedidos para Establecimientos
            </h1>
            
            <p className="mb-12 text-xl text-corporate-muted max-w-3xl mx-auto leading-relaxed">
              Optimice la operación de su establecimiento con nuestra plataforma integral de gestión de pedidos mediante códigos QR. Solución robusta y escalable para empresas del sector hostelero.
            </p>
            
            <div className="flex justify-center">
              <Button size="lg" asChild className="btn-professional text-lg px-10 py-4">
                <Link to="/solicitardemostracion">
                  <Users className="mr-2 h-5 w-5" />
                  Solicitar Demostración
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-professional bg-primary text-primary-foreground">
        <div className="container-professional">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
              Soluciones Empresariales Avanzadas
            </h2>
          </div>
          
          <div className="grid-professional md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 bg-white/20 text-white">
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="mb-4 text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-white/90 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-professional bg-background">
        <div className="container-professional">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-corporate mb-6">
              Beneficios Empresariales Comprobados
            </h2>
            <p className="text-xl text-corporate-muted max-w-3xl mx-auto leading-relaxed">
              Nuestros clientes han experimentado mejoras significativas en sus métricas operacionales tras implementar nuestra solución.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">+40%</div>
              <div className="text-corporate-muted font-medium">Incremento en Ventas</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">-70%</div>
              <div className="text-corporate-muted font-medium">Tiempo de Espera</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-corporate-muted font-medium">Disponibilidad</div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-corporate font-medium">{benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-professional bg-primary text-primary-foreground">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
              Implemente la Solución en su Establecimiento
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Contacte con nuestro equipo comercial para una demostración personalizada y evaluación de su caso de uso específico.
            </p>
            <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100 text-lg px-10 py-4">
              <Link to="/solicitardemostracion">
                <Users className="mr-2 h-5 w-5" />
                Contactar Equipo Comercial
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
