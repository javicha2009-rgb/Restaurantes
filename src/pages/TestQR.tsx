import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { 
  QrCode, 
  ArrowLeft, 
  Smartphone, 
  Scan,
  Utensils
} from "lucide-react";

const TestQR = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4 animate-fade-in">
            <Scan className="mr-2 h-4 w-4" />
            Demostración del Sistema
          </Badge>
          <h1 className="mb-6 text-4xl lg:text-5xl font-bold text-glow animate-slide-up">
            Sistema de QR
            <br />
            <span className="text-foreground">
              para Bares
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Descubre cómo funciona nuestro sistema de pedidos con códigos QR. 
            Una solución completa para modernizar tu bar.
          </p>
        </div>

        {/* Demo Instructions */}
        <Card className="card-glass mb-12 animate-bounce-in max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-button">
              <Smartphone className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">¿Cómo funciona?</CardTitle>
            <CardDescription className="text-base">
              El proceso completo en 3 simples pasos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-button mx-auto">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <h3 className="font-semibold text-lg">Genera QR por Mesa</h3>
                <p className="text-muted-foreground">
                  Cada mesa de tu bar obtiene un código QR único que los clientes pueden escanear.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-button mx-auto">
                  <span className="text-primary-foreground font-bold">2</span>
                </div>
                <h3 className="font-semibold text-lg">Cliente Escanea</h3>
                <p className="text-muted-foreground">
                  Los clientes escanean el QR y acceden directamente al menú desde su móvil.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-button mx-auto">
                  <span className="text-primary-foreground font-bold">3</span>
                </div>
                <h3 className="font-semibold text-lg">Pedido Automático</h3>
                <p className="text-muted-foreground">
                  El pedido llega directamente a tu dashboard para preparar y servir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="card-glass animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-button mx-auto">
                <QrCode className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Sin Apps</h3>
              <p className="text-sm text-muted-foreground">
                Los clientes no necesitan descargar ninguna aplicación
              </p>
            </CardContent>
          </Card>

          <Card className="card-glass animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-button mx-auto">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Fácil de Usar</h3>
              <p className="text-sm text-muted-foreground">
                Interfaz intuitiva que cualquier cliente puede usar
              </p>
            </CardContent>
          </Card>

          <Card className="card-glass animate-fade-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-button mx-auto">
                <Utensils className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Gestión Completa</h3>
              <p className="text-sm text-muted-foreground">
                Dashboard completo para gestionar pedidos y menús
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="card-glass animate-fade-in max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-glow">
              ¿Listo para implementar en tu bar?
            </h3>
            <p className="text-muted-foreground mb-6">
              Únete a cientos de bares que ya han modernizado su servicio con nuestro sistema de QR.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-modern bg-gradient-primary hover:shadow-button">
                <Link to="/portal">
                  <Utensils className="mr-2 h-4 w-4" />
                  Crear Mi Bar
                </Link>
              </Button>
              <Button asChild variant="outline" className="btn-modern border-2">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestQR;
