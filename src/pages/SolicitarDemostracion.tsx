import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import { 
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle
} from "lucide-react";
import { enviarSolicitudDemo, enviarEmailDirecto, guardarSolicitudLocal, type SolicitudData, type ResultadoEnvio } from "@/lib/email-service";

const SolicitarDemostracion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const solicitudData: SolicitudData = {
      nombreBar: formData.get("nombreBar") as string,
      nombreContacto: formData.get("nombreContacto") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      ubicacion: formData.get("ubicacion") as string,
      mensaje: (formData.get("mensaje") as string) || 'Sin mensaje adicional'
    };

    try {
      // Intentar enviar por Formspree
      const resultado = await enviarSolicitudDemo(solicitudData);
      
      if (resultado.success) {
        // Guardar también localmente como respaldo
        guardarSolicitudLocal(solicitudData);
        
        setSubmitted(true);
        toast.success("¡Solicitud enviada correctamente! Nos pondremos en contacto contigo pronto.");
      } else {
        // Si falla Formspree, intentar con mailto
        console.warn('Formspree falló, intentando con mailto:', resultado.error);
        enviarEmailDirecto(solicitudData);
        
        // Guardar localmente
        guardarSolicitudLocal(solicitudData);
        
        setSubmitted(true);
        toast.success("Solicitud procesada. Se ha abierto tu cliente de email para completar el envío.");
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      
      // Como último recurso, usar mailto
      try {
        enviarEmailDirecto(solicitudData);
        guardarSolicitudLocal(solicitudData);
        
        setSubmitted(true);
        toast.success("Se ha abierto tu cliente de email para enviar la solicitud.");
      } catch (mailtoError) {
        console.error('Error con mailto:', mailtoError);
        toast.error("Error al enviar la solicitud. Por favor, contacta directamente a javijg2009@gmail.com");
      }
    } finally {
        setLoading(false);
      }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
        </div>
        
        <Header />
        
        <div className="container mx-auto px-4 py-12 flex-1 relative z-10">
          <div className="max-w-md mx-auto">
            <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Solicitud Enviada!</h2>
                <p className="text-gray-600 mb-8">
                  Hemos recibido tu solicitud de demostración. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.
                </p>
                <div className="space-y-4">
                  <Button
                    onClick={() => navigate("/")}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    Volver al Inicio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      window.location.reload();
                    }}
                    className="w-full"
                  >
                    Enviar Otra Solicitud
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12 flex-1 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10 border-white/20">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Form Card */}
          <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-primary mb-2 tracking-tight">
                Solicitar Demostración
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                Implementa MesaLink en tu bar y revoluciona la experiencia de tus clientes
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-primary mb-3 tracking-tight">¿Listo para Digitalizar tu Bar?</h3>
                <p className="text-base text-gray-600 font-medium">
                  Completa el formulario y nuestro equipo te contactará para programar una demostración personalizada
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="nombreBar" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Nombre del Bar/Restaurante
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                      <Input
                        id="nombreBar"
                        name="nombreBar"
                        type="text"
                        placeholder="Ej: Bar Central"
                        className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="nombreContacto" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Nombre de Contacto
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                      <Input
                        id="nombreContacto"
                        name="nombreContacto"
                        type="text"
                        placeholder="Tu nombre completo"
                        className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Email de Contacto
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="telefono" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                      <Input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        placeholder="+34 123 456 789"
                        className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="ubicacion" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Ubicación del Establecimiento
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                    <Input
                      id="ubicacion"
                      name="ubicacion"
                      type="text"
                      placeholder="Ciudad, País"
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="mensaje" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Mensaje Adicional (Opcional)
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-primary/70" />
                    <Textarea
                      id="mensaje"
                      name="mensaje"
                      placeholder="Cuéntanos sobre tu bar, número de mesas, expectativas, etc."
                      className="pl-12 pt-4 min-h-[120px] text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enviando solicitud...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Solicitar Demostración
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-sm text-gray-600 text-center font-medium">
                  <strong>Respuesta garantizada en 24 horas.</strong> Nuestro equipo comercial se pondrá en contacto contigo para programar una demostración personalizada.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SolicitarDemostracion;