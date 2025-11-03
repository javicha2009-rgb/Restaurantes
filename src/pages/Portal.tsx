import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import { 
  UtensilsCrossed, 
  User, 
  Lock, 
  ArrowLeft,
  Zap,
  Shield,
  Clock
} from "lucide-react";

const Portal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      // Verificar credenciales hardcodeadas por defecto
      if (username === "Javi" && password === "Javi") {
        // Obtener o crear el bar de Javi desde la base de datos
        const { data: bar, error } = await supabase
          .from("bars")
          .select("*")
          .eq("name", "Bar de Javi")
          .single();

        if (error) {
          // Si no existe el bar, crearlo
          const { data: newBar, error: createError } = await supabase
            .from("bars")
            .insert([{
              name: "Bar de Javi",
              description: "Un bar moderno con la mejor tecnología",
              address: "Calle Principal 123, Madrid",
              phone: "+34 123 456 789",
              email: "javi@bar.com",
              is_active: true
            }])
            .select()
            .single();

          if (createError) throw createError;
          
          // Guardar información de la sesión
          sessionStorage.setItem("mesalink_logged_in", "true");
          sessionStorage.setItem("mesalink_bar_id", newBar.id);
          sessionStorage.setItem("mesalink_bar_name", newBar.name);
        } else {
          // Guardar información de la sesión
          sessionStorage.setItem("mesalink_logged_in", "true");
          sessionStorage.setItem("mesalink_bar_id", bar.id);
          sessionStorage.setItem("mesalink_bar_name", bar.name);
        }

        toast.success(`¡Bienvenido al Bar de Javi!`);
        navigate("/dashboard");
        return;
      }

      // Verificar credenciales creadas por el administrador
      const savedCredentials = localStorage.getItem('mesalink_bar_credentials');
      if (savedCredentials) {
        const credentials = JSON.parse(savedCredentials);
        const matchingCredential = credentials.find((cred: any) => 
          cred.username === username && cred.password === password
        );

        if (matchingCredential) {
          // Obtener información actualizada del bar desde Supabase
          const { data: bar, error } = await supabase
            .from("bars")
            .select("*")
            .eq("id", matchingCredential.bar_id)
            .single();

          if (error || !bar) {
            throw new Error("Bar no encontrado o inactivo");
          }

          if (!bar.is_active) {
            throw new Error("El bar no está activo");
          }

          // Guardar información de la sesión
          sessionStorage.setItem("mesalink_logged_in", "true");
          sessionStorage.setItem("mesalink_bar_id", bar.id);
          sessionStorage.setItem("mesalink_bar_name", bar.name);

          toast.success(`¡Bienvenido a ${bar.name}!`);
          navigate("/dashboard");
          return;
        }
      }

      // Si no se encontraron credenciales válidas
      throw new Error("Credenciales incorrectas");
    } catch (error: any) {
      toast.error("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Configuración Rápida",
      description: "Tu bar estará listo en menos de 10 minutos"
    },
    {
      icon: Shield,
      title: "Datos Seguros",
      description: "Encriptación de nivel bancario para tu información"
    },
    {
      icon: Clock,
      title: "Soporte 24/7",
      description: "Asistencia técnica cuando la necesites"
    }
  ];

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

        <div className="max-w-md mx-auto space-y-12">
          {/* Auth Form */}
          <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
                  <UtensilsCrossed className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-primary mb-2 tracking-tight">
                Portal de Gestión
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                Accede a tu panel de control personalizado
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="w-full">
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-bold text-primary mb-3 tracking-tight">Acceso Exclusivo</h3>
                  <p className="text-base text-gray-600 font-medium">Solo para bares autorizados con credenciales proporcionadas</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Usuario del Establecimiento
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Ingrese su usuario asignado"
                        className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Ingrese su contraseña asignada"
                        className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                        required
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
                          Iniciando sesión...
                        </div>
                      ) : (
                        "Acceder al Panel"
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    ¿No tienes credenciales? Contacta con nosotros para solicitar acceso a tu bar.
                  </p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Tus datos están protegidos con encriptación SSL</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Portal;
