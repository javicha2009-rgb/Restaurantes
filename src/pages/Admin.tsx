import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Shield, 
  User, 
  Lock, 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  LogOut,
  Settings,
  UtensilsCrossed,
  Package,
  Euro
} from "lucide-react";
import { 
  ProductStatus, 
  PRODUCT_STATUS_OPTIONS, 
  getProductStatusLabel, 
  getProductStatusVariant 
} from "@/types/product";


interface Bar {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

interface BarCredential {
  id: string;
  bar_id: string;
  username: string;
  password: string;
  created_at: string;
  bars: Bar;
}

interface Product {
  id: string;
  bar_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  status: 'available' | 'temporarily_unavailable';
}

interface Category {
  id: string;
  bar_id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bars, setBars] = useState<Bar[]>([]);
  const [credentials, setCredentials] = useState<BarCredential[]>([]);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Estados para formularios
  const [newBar, setNewBar] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: ""
  });

  // Estado para el diálogo de confirmación de eliminación de productos
  const [deleteProductConfirmation, setDeleteProductConfirmation] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: ""
  });

  // Estado para el diálogo de confirmación de eliminación de credenciales
  const [deleteCredentialConfirmation, setDeleteCredentialConfirmation] = useState<{
    isOpen: boolean;
    credentialId: string;
    credentialName: string;
  }>({
    isOpen: false,
    credentialId: "",
    credentialName: ""
  });

  // Estado para el diálogo de confirmación de eliminación de categorías
  const [deleteCategoryConfirmation, setDeleteCategoryConfirmation] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: "",
    categoryName: ""
  });

  // Estado para la categoría seleccionada en el desplegable
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [newCredential, setNewCredential] = useState({
    username: "",
    password: "",
    bar_id: ""
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    image_url: ""
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    display_order: 0
  });

  // Estado para el diálogo de confirmación de eliminación
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    barId: string;
    barName: string;
  }>({
    isOpen: false,
    barId: "",
    barName: ""
  });

  // Estado para almacenar credenciales temporalmente (simulando tabla bar_credentials)
  const [storedCredentials, setStoredCredentials] = useState<BarCredential[]>([]);

  useEffect(() => {
    checkAdminAuth();
    // Cargar credenciales desde localStorage al iniciar
    const savedCredentials = localStorage.getItem('mesalink_bar_credentials');
    if (savedCredentials) {
      setStoredCredentials(JSON.parse(savedCredentials));
    }
  }, []);

  // Log para debuggear el estado del diálogo
  useEffect(() => {
    console.log("🎭 Estado del diálogo:", deleteConfirmation);
  }, [deleteConfirmation]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBars();
      fetchCredentials();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedBar) {
      fetchProducts(selectedBar.id);
      fetchCategories(selectedBar.id);
    }
  }, [selectedBar]);

  const checkAdminAuth = () => {
    const adminAuth = sessionStorage.getItem("mesalink_admin_auth");
    if (adminAuth === "authenticated") {
      setIsAuthenticated(true);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      if (username === "Javi" && password === "Javi") {
        sessionStorage.setItem("mesalink_admin_auth", "authenticated");
        setIsAuthenticated(true);
        toast.success("¡Bienvenido al panel de administración!");
      } else {
        throw new Error("Credenciales incorrectas");
      }
    } catch (error) {
      toast.error("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("mesalink_admin_auth");
    setIsAuthenticated(false);
    navigate("/");
  };

  const fetchBars = async () => {
    try {
      console.log("🔄 Cargando bares desde Supabase...");
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("📊 Bares obtenidos:", data?.length || 0, "bares");
      setBars(data || []);
    } catch (error) {
      console.error("❌ Error fetching bars:", error);
      toast.error("Error al cargar bares");
    }
  };

  const fetchCredentials = async () => {
    try {
      // Obtener bares reales de Supabase para vincular con credenciales
      const { data: barsData } = await supabase
        .from("bars")
        .select("*");

      // Mapear credenciales almacenadas con datos reales de bares
      const mappedStoredCredentials = storedCredentials.map(cred => {
        const realBar = barsData?.find(bar => bar.id === cred.bar_id);
        return {
          ...cred,
          bars: realBar || cred.bars
        };
      });

      // Solo usar las credenciales almacenadas (sin credenciales por defecto)
      setCredentials(mappedStoredCredentials);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      toast.error("Error al cargar credenciales");
    }
  };

  const fetchProducts = async (barId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("bar_id", barId)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error al cargar productos");
    }
  };

  const fetchCategories = async (barId: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("bar_id", barId)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error al cargar categorías");
    }
  };

  const createBar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bars")
        .insert([newBar])
        .select()
        .single();

      if (error) throw error;

      toast.success("Bar creado exitosamente");
      setNewBar({ name: "", description: "", address: "", phone: "", email: "" });
      fetchBars();
    } catch (error) {
      console.error("Error creating bar:", error);
      toast.error("Error al crear el bar");
    } finally {
      setLoading(false);
    }
  };

  const deleteBar = (barId: string) => {
    console.log("🖱️ CLICK EN BOTÓN ELIMINAR - Bar ID:", barId);
    
    // Obtener el nombre del bar para el mensaje
    const barToDelete = bars.find(bar => bar.id === barId);
    const barName = barToDelete?.name || "este bar";

    console.log("📋 Bar encontrado:", barToDelete);

    // Abrir diálogo de confirmación personalizado
    setDeleteConfirmation({
      isOpen: true,
      barId: barId,
      barName: barName
    });
    
    console.log("💬 Diálogo de confirmación abierto");
  };

  const confirmDeleteBar = async () => {
    const { barId, barName } = deleteConfirmation;
    
    console.log("🗑️ Iniciando eliminación del bar:", { barId, barName });
    
    // Cerrar el diálogo primero
    setDeleteConfirmation({
      isOpen: false,
      barId: "",
      barName: ""
    });

    // Proceder con la eliminación completa
    setLoading(true);
    try {
      console.log("🏪 Eliminando bar directamente...");
      
      // Eliminar el bar directamente (Supabase debería manejar la cascada)
      const { error: barError } = await supabase
        .from("bars")
        .delete()
        .eq("id", barId);

      if (barError) {
        console.error("❌ Error eliminando bar:", barError);
        throw barError;
      } else {
        console.log("✅ Bar eliminado de la base de datos");
      }

      console.log("🧹 Limpiando interfaz...");
      // Si el bar eliminado era el seleccionado, limpiar la selección
      if (selectedBar?.id === barId) {
        setSelectedBar(null);
        setProducts([]);
        setCategories([]);
        console.log("✅ Selección limpiada");
      }

      // Eliminar credenciales del localStorage
      const savedCredentials = localStorage.getItem('mesalink_bar_credentials');
      if (savedCredentials) {
        const credentials = JSON.parse(savedCredentials);
        const filteredCredentials = credentials.filter((cred: any) => cred.bar_id !== barId);
        localStorage.setItem('mesalink_bar_credentials', JSON.stringify(filteredCredentials));
        setStoredCredentials(filteredCredentials);
        console.log("✅ Credenciales eliminadas del localStorage");
      }
      
      console.log("🔄 Actualizando listas...");
      // Actualizar todas las listas
      await fetchBars();
      await fetchCredentials();
      console.log("✅ Listas actualizadas");
      
      // Mostrar notificación de éxito
      toast.success(`"${barName}" ha sido eliminado exitosamente`);
      console.log("🎉 Eliminación completada exitosamente");
      
    } catch (error) {
      console.error("💥 Error durante la eliminación:", error);
      toast.error(`Error al eliminar el bar: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
      console.log("🏁 Proceso de eliminación finalizado");
    }
  };

  const cancelDeleteBar = () => {
    setDeleteConfirmation({
      isOpen: false,
      barId: "",
      barName: ""
    });
  };

  const createCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que el usuario no exista ya
      const existingCredential = [...credentials, ...storedCredentials].find(
        cred => cred.username === newCredential.username
      );
      
      if (existingCredential) {
        throw new Error("Ya existe un usuario con ese nombre");
      }

      // Obtener información del bar seleccionado
      const { data: barData, error: barError } = await supabase
        .from("bars")
        .select("*")
        .eq("id", newCredential.bar_id)
        .single();

      if (barError || !barData) {
        throw new Error("Bar no encontrado");
      }

      // Crear nueva credencial
      const newCredentialData: BarCredential = {
        id: `cred-${Date.now()}`,
        bar_id: newCredential.bar_id,
        username: newCredential.username,
        password: newCredential.password,
        created_at: new Date().toISOString(),
        bars: barData
      };

      // Guardar en estado y localStorage
      const updatedCredentials = [...storedCredentials, newCredentialData];
      setStoredCredentials(updatedCredentials);
      localStorage.setItem('mesalink_bar_credentials', JSON.stringify(updatedCredentials));

      toast.success("Credenciales creadas exitosamente");
      setNewCredential({ username: "", password: "", bar_id: "" });
      fetchCredentials();
    } catch (error: any) {
      console.error("Error creating credentials:", error);
      toast.error(error.message || "Error al crear las credenciales");
    } finally {
      setLoading(false);
    }
  };

  const deleteCredential = async (credentialId: string) => {
    const credential = credentials.find(cred => cred.id === credentialId);
    if (!credential) return;

    setDeleteCredentialConfirmation({
      isOpen: true,
      credentialId: credentialId,
      credentialName: credential.username
    });
  };

  const confirmDeleteCredential = async () => {
    try {
      // Filtrar la credencial a eliminar
      const updatedCredentials = storedCredentials.filter(cred => cred.id !== deleteCredentialConfirmation.credentialId);
      setStoredCredentials(updatedCredentials);
      localStorage.setItem('mesalink_bar_credentials', JSON.stringify(updatedCredentials));

      toast.success("Credenciales eliminadas exitosamente");
      fetchCredentials();
      
      // Cerrar el diálogo
      setDeleteCredentialConfirmation({
        isOpen: false,
        credentialId: "",
        credentialName: ""
      });
    } catch (error) {
      console.error("Error deleting credential:", error);
      toast.error("Error al eliminar las credenciales");
    }
  };

  const cancelDeleteCredential = () => {
    setDeleteCredentialConfirmation({
      isOpen: false,
      credentialId: "",
      credentialName: ""
    });
  };

  const deleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    setDeleteCategoryConfirmation({
      isOpen: true,
      categoryId: categoryId,
      categoryName: category.name
    });
  };

  const confirmDeleteCategory = async () => {
    if (!selectedBar) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteCategoryConfirmation.categoryId);

      if (error) throw error;

      toast.success("Categoría eliminada exitosamente");
      fetchCategories(selectedBar.id);
      
      // Limpiar la selección si se eliminó la categoría seleccionada
      if (selectedCategoryId === deleteCategoryConfirmation.categoryId) {
        setSelectedCategoryId("");
      }
      
      // Cerrar el diálogo
      setDeleteCategoryConfirmation({
        isOpen: false,
        categoryId: "",
        categoryName: ""
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error al eliminar la categoría");
    }
  };

  const cancelDeleteCategory = () => {
    setDeleteCategoryConfirmation({
      isOpen: false,
      categoryId: "",
      categoryName: ""
    });
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBar) {
      toast.error("Debe seleccionar una barra para crear un producto.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          ...newProduct,
          bar_id: selectedBar.id
        }])
        .select();

      if (error) throw error;

      toast.success("Producto creado exitosamente");
      setNewProduct({ name: "", description: "", price: 0, category_id: "", image_url: "" });
      fetchProducts(selectedBar.id);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!selectedBar) {
      toast.error("Debe seleccionar una barra.");
      return;
    }

    // Obtener el nombre del producto para el mensaje
    const productToDelete = products.find(product => product.id === productId);
    const productName = productToDelete?.name || "este producto";

    // Abrir diálogo de confirmación
    setDeleteProductConfirmation({
      isOpen: true,
      productId: productId,
      productName: productName
    });
  };

  const confirmDeleteProduct = async () => {
    const { productId, productName } = deleteProductConfirmation;
    
    // Cerrar el diálogo primero
    setDeleteProductConfirmation({
      isOpen: false,
      productId: "",
      productName: ""
    });

    if (!selectedBar) {
      toast.error("Debe seleccionar una barra.");
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast.success(`"${productName}" ha sido eliminado exitosamente`);
      fetchProducts(selectedBar.id);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar el producto");
    }
  };

  const cancelDeleteProduct = () => {
    setDeleteProductConfirmation({
      isOpen: false,
      productId: "",
      productName: ""
    });
  };

  const updateProductStatus = async (productId: string, newStatus: ProductStatus) => {
    if (!selectedBar) {
      toast.error("Debe seleccionar una barra.");
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("products")
        .update({ 
          status: newStatus,
          is_available: newStatus === 'available',
          updated_at: new Date().toISOString()
        })
        .eq("id", productId)
        .eq("bar_id", selectedBar.id);

      if (error) throw error;

      toast.success("Estado del producto actualizado exitosamente");
      fetchProducts(selectedBar.id);
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Error al actualizar el estado del producto");
    } finally {
      setLoading(false);
    }
  };

  // Alternative function to create category using direct REST API
  const createCategoryDirect = async (categoryData: any) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    console.log("🔧 [createCategoryDirect] Usando API REST directa para evitar RLS");
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
          // Try to bypass RLS with these headers
          'X-Client-Info': 'admin-panel',
          'Role': 'anon'
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🐛 [createCategoryDirect] Error HTTP:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ [createCategoryDirect] Categoría creada exitosamente:", data);
      return data;
    } catch (error) {
      console.error("❌ [createCategoryDirect] Error en API REST directa:", error);
      throw error;
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🐛 [createCategory] Iniciando creación de categoría.");
    if (!selectedBar) {
      console.error("🐛 [createCategory] No hay barra seleccionada. Abortando.");
      toast.error("Debe seleccionar una barra para crear una categoría.");
      return;
    }

    setLoading(true);
    console.log("🐛 [createCategory] selectedBar:", selectedBar);
    console.log("🐛 [createCategory] newCategory antes de insertar:", newCategory);

    const categoryData = {
      ...newCategory,
      bar_id: selectedBar.id,
      is_active: true,
      created_at: new Date().toISOString()
    };

    try {
      // First try the direct REST API approach
      console.log("🔄 [createCategory] Intentando método REST directo...");
      const data = await createCategoryDirect(categoryData);
      
      console.log("🐛 [createCategory] Categoría creada exitosamente:", data);
      toast.success("Categoría creada exitosamente");
      setNewCategory({ name: "", description: "", display_order: 0 });
      fetchCategories(selectedBar.id);
      console.log("🐛 [createCategory] Categorías actualizadas y formulario reseteado.");
    } catch (directError) {
      console.error("❌ [createCategory] Error con método directo:", directError);
      
      // Fallback to original Supabase client method
      console.log("🔄 [createCategory] Intentando método Supabase client...");
      try {
        const { data, error } = await supabase
          .from("categories")
          .insert([categoryData])
          .select();

        if (error) {
          console.error("🐛 [createCategory] Error de Supabase al crear categoría:", error);
          throw error;
        }

        console.log("🐛 [createCategory] Categoría creada exitosamente con client:", data);
        toast.success("Categoría creada exitosamente");
        setNewCategory({ name: "", description: "", display_order: 0 });
        fetchCategories(selectedBar.id);
        console.log("🐛 [createCategory] Categorías actualizadas y formulario reseteado.");
      } catch (clientError) {
        console.error("🐛 [createCategory] Error general al crear categoría:", clientError);
        toast.error("Error al crear la categoría. Verifica las políticas de RLS en Supabase.");
      }
    } finally {
      setLoading(false);
      console.log("🐛 [createCategory] Finalizando creación de categoría. Loading:", false);
    }
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
        </div>
        
        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary mb-2 tracking-tight">
              Panel de Administración
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 font-medium">
              Acceso exclusivo para administradores del sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Usuario Administrador
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Ingrese su usuario"
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
                    placeholder="Ingrese su contraseña"
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
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Sistema seguro de gestión empresarial
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground font-medium">Gestiona bares y configuraciones</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="bars" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bars">Gestión de Bares</TabsTrigger>
            <TabsTrigger value="credentials">Credenciales de Acceso</TabsTrigger>
            <TabsTrigger value="menu">Menú y Productos</TabsTrigger>
          </TabsList>

          <TabsContent value="bars" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario para crear bar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Nuevo Bar</CardTitle>
                  <CardDescription>Registra un nuevo bar en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createBar} className="space-y-4">
                    <div>
                      <Label htmlFor="bar-name" className="text-sm font-medium">Nombre del Bar *</Label>
                      <Input
                        id="bar-name"
                        value={newBar.name}
                        onChange={(e) => setNewBar({...newBar, name: e.target.value})}
                        placeholder="Ej: Bar Central"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bar-email" className="text-sm font-medium">Email de Contacto</Label>
                      <Input
                        id="bar-email"
                        type="email"
                        value={newBar.email}
                        onChange={(e) => setNewBar({...newBar, email: e.target.value})}
                        placeholder="contacto@bar.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bar-phone" className="text-sm font-medium">Teléfono</Label>
                      <Input
                        id="bar-phone"
                        value={newBar.phone}
                        onChange={(e) => setNewBar({...newBar, phone: e.target.value})}
                        placeholder="+34 123 456 789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bar-address" className="text-sm font-medium">Dirección</Label>
                      <Input
                        id="bar-address"
                        value={newBar.address}
                        onChange={(e) => setNewBar({...newBar, address: e.target.value})}
                        placeholder="Calle Principal 123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bar-description" className="text-sm font-medium">Descripción</Label>
                      <Textarea
                        id="bar-description"
                        value={newBar.description}
                        onChange={(e) => setNewBar({...newBar, description: e.target.value})}
                        placeholder="Descripción del bar..."
                        rows={3}
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Bar
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Lista de bares existentes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Bares Registrados</CardTitle>
                  <CardDescription>
                    Lista de todos los bares en el sistema ({bars.length} total{bars.length !== 1 ? 'es' : ''})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bars.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay bares registrados aún</p>
                        <p className="text-sm">Usa el formulario de la izquierda para añadir el primer bar</p>
                      </div>
                    ) : (
                      bars.map((bar) => (
                        <div 
                          key={bar.id} 
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedBar?.id === bar.id 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedBar(bar)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold font-display text-lg">{bar.name}</h3>
                                {selectedBar?.id === bar.id && (
                                  <Badge variant="default" className="text-xs">
                                    Seleccionado
                                  </Badge>
                                )}
                              </div>
                              {bar.description && (
                                <p className="text-sm text-muted-foreground mb-2">{bar.description}</p>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                {bar.email && (
                                  <div className="flex items-center gap-1">
                                    <span>📧</span>
                                    <span>{bar.email}</span>
                                  </div>
                                )}
                                {bar.phone && (
                                  <div className="flex items-center gap-1">
                                    <span>📞</span>
                                    <span>{bar.phone}</span>
                                  </div>
                                )}
                                {bar.address && (
                                  <div className="flex items-center gap-1 sm:col-span-2">
                                    <span>📍</span>
                                    <span>{bar.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <Badge variant={bar.is_active ? "default" : "secondary"}>
                                 {bar.is_active ? "Activo" : "Inactivo"}
                               </Badge>
                               <div className="flex gap-2">
                                 {selectedBar?.id === bar.id && (
                                   <Button 
                                     variant="outline" 
                                     size="sm"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       const menuTab = document.querySelector('[value="menu"]') as HTMLElement;
                                       if (menuTab) menuTab.click();
                                     }}
                                   >
                                     <UtensilsCrossed className="h-4 w-4 mr-1" />
                                     Gestionar Menú
                                   </Button>
                                 )}
                                 <Button 
                                   variant="destructive" 
                                   size="sm"
                                   onClick={() => {
                                     console.log("🔥 BOTÓN ELIMINAR CLICKEADO!");
                                     deleteBar(bar.id);
                                   }}
                                   disabled={loading}
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </div>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedBar && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Bar seleccionado: <strong>{selectedBar.name}</strong></span>
                    </div>
                    <span>•</span>
                    <span>Ahora puedes gestionar sus credenciales y menú</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Crear Credenciales</CardTitle>
                <CardDescription>Asigna credenciales de acceso a un bar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createCredential} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="credential-bar">Bar</Label>
                      <select
                        id="credential-bar"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={newCredential.bar_id}
                        onChange={(e) => setNewCredential({...newCredential, bar_id: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar bar</option>
                        {bars.map((bar) => (
                          <option key={bar.id} value={bar.id}>{bar.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="credential-username">Usuario</Label>
                      <Input
                        id="credential-username"
                        value={newCredential.username}
                        onChange={(e) => setNewCredential({...newCredential, username: e.target.value})}
                        placeholder="Usuario"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="credential-password">Contraseña</Label>
                      <Input
                        id="credential-password"
                        value={newCredential.password}
                        onChange={(e) => setNewCredential({...newCredential, password: e.target.value})}
                        placeholder="Contraseña"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Credenciales
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Credenciales Existentes</CardTitle>
                <CardDescription>Lista de todas las credenciales de acceso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {credentials.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay credenciales creadas aún</p>
                      <p className="text-sm">Usa el formulario de arriba para crear las primeras credenciales</p>
                    </div>
                  ) : (
                    credentials.map((credential) => (
                      <div key={credential.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold font-display">{credential.bars.name}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>👤 {credential.username}</span>
                            <span className="flex items-center gap-1">
                              🔑 
                              {showPassword[credential.id] ? credential.password : "••••••••"}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePasswordVisibility(credential.id)}
                              >
                                {showPassword[credential.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCredential(credential.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            {selectedBar ? (
              <div className="space-y-6">
                {/* Header del bar seleccionado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Gestión del Menú - {selectedBar.name}
                    </CardTitle>
                    <CardDescription>
                      Administra las categorías y productos del menú de este bar
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sección de Categorías */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display text-lg">Categorías del Menú</CardTitle>
                      <CardDescription>Organiza tus productos en categorías</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Formulario para crear categoría */}
                      <form onSubmit={createCategory} className="space-y-3">
                        <div>
                          <Label htmlFor="category-name" className="text-sm font-medium">Nueva Categoría</Label>
                          <Input
                            id="category-name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                            placeholder="Ej: Bebidas, Tapas, Postres..."
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category-description" className="text-sm font-medium">Descripción</Label>
                          <Input
                            id="category-description"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                            placeholder="Descripción breve de la categoría"
                          />
                        </div>
                        <Button type="submit" disabled={loading} size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir Categoría
                        </Button>
                      </form>

                      {/* Desplegable de categorías existentes */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Categorías Existentes</h4>
                        {categories.length > 0 ? (
                          <div className="space-y-2">
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría para ver detalles" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name} - {category.is_active ? "Activa" : "Inactiva"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Mostrar detalles de la categoría seleccionada */}
                            {selectedCategoryId && (() => {
                              const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                              return selectedCategory ? (
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">{selectedCategory.name}</h5>
                                    <p className="text-xs text-muted-foreground">{selectedCategory.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={selectedCategory.is_active ? "default" : "secondary"} className="text-xs">
                                      {selectedCategory.is_active ? "Activa" : "Inactiva"}
                                    </Badge>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteCategory(selectedCategory.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No hay categorías creadas</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sección de Productos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display text-lg">Productos del Menú</CardTitle>
                      <CardDescription>Añade y gestiona los productos de tu carta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Formulario para crear producto */}
                      <form onSubmit={createProduct} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="product-name" className="text-sm font-medium">Nombre del Producto</Label>
                            <Input
                              id="product-name"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                              placeholder="Ej: Cerveza Estrella"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="product-price" className="text-sm font-medium">Precio (€)</Label>
                            <Input
                              id="product-price"
                              type="number"
                              step="0.01"
                              value={newProduct.price || ""}
                              onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="product-category" className="text-sm font-medium">Categoría</Label>
                          <select
                            id="product-category"
                            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            value={newProduct.category_id}
                            onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                          >
                            <option value="">Sin categoría</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="product-description" className="text-sm font-medium">Descripción</Label>
                          <Textarea
                            id="product-description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            placeholder="Descripción del producto"
                            rows={2}
                          />
                        </div>
                        <Button type="submit" disabled={loading} size="sm" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir Producto
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista completa de productos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Productos Actuales</CardTitle>
                    <CardDescription>Vista completa de todos los productos del menú</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No hay productos añadidos aún</p>
                          <p className="text-sm">Usa el formulario de arriba para añadir productos</p>
                        </div>
                      ) : (
                        products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-4">
                              {product.image_url && (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold font-display">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {categories.find(c => c.id === product.category_id) && (
                                    <Badge variant="outline" className="text-xs">
                                      {categories.find(c => c.id === product.category_id)?.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono">
                                <Euro className="h-3 w-3 mr-1" />
                                {product.price.toFixed(2)}
                              </Badge>
                              <Select
                                value={product.status || 'available'}
                                onValueChange={(value: ProductStatus) => updateProductStatus(product.id, value)}
                                disabled={loading}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue>
                                    <Badge variant={getProductStatusVariant(product.status || 'available')}>
                                      {getProductStatusLabel(product.status || 'available')}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={option.variant} className="text-xs">
                                          {option.label}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {option.description}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteProduct(product.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground mb-6 opacity-50" />
                  <h3 className="text-xl font-semibold font-display mb-3">Selecciona un Bar</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Para gestionar el menú y productos, primero selecciona un bar desde la pestaña "Gestión de Bares"
                  </p>
                  <Button variant="outline" onClick={() => {
                     const barsTab = document.querySelector('[value="bars"]') as HTMLElement;
                     if (barsTab) barsTab.click();
                   }}>
                     <Store className="mr-2 h-4 w-4" />
                     Ir a Gestión de Bares
                   </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de confirmación para eliminar bar */}
      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => {
        console.log("🔄 Dialog onOpenChange:", open);
        if (!open) cancelDeleteBar();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar bar?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar "{deleteConfirmation.barName}"? 
              Esta acción no se puede deshacer y eliminará también todos sus productos, 
              categorías y credenciales asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelDeleteBar}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteBar}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar producto */}
      <Dialog open={deleteProductConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) cancelDeleteProduct();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar "{deleteProductConfirmation.productName}"? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelDeleteProduct}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteProduct}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar credencial */}
      <Dialog open={deleteCredentialConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) cancelDeleteCredential();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar credenciales?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar las credenciales de "{deleteCredentialConfirmation.credentialName}"? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelDeleteCredential}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteCredential}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar categoría */}
      <Dialog open={deleteCategoryConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) cancelDeleteCategory();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar categoría?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la categoría "{deleteCategoryConfirmation.categoryName}"? 
              Esta acción no se puede deshacer y puede afectar a los productos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelDeleteCategory}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteCategory}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;