import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Plus, Minus, Receipt, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isProductAvailable } from "@/types/product";
import { SupabaseHelpers } from "@/lib/supabase-helpers";
import { convertBarIdToUUID, convertTableIdToUUID } from "@/lib/id-utils";
import Footer from "@/components/layout/Footer";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  status: 'available' | 'temporarily_unavailable';
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

const BarMenu = () => {
  const { barId: rawBarId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get("table");
  
  // Convert simple IDs to UUIDs for database compatibility
  const barId = convertBarIdToUUID(rawBarId);
  const tableUUID = convertTableIdToUUID(tableId);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barName, setBarName] = useState("");
  const [tableName, setTableName] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isRequestingBill, setIsRequestingBill] = useState(false);

  useEffect(() => {
    if (!barId) {
      navigate("/");
      return;
    }
    
    loadBarData();
    loadProducts();
    loadCategories();
  }, [barId, navigate]);

  const loadBarData = async () => {
    try {
      const { data: bar } = await supabase
        .from("bars")
        .select("name")
        .eq("id", barId)
        .single();
      
      if (bar) {
        setBarName(bar.name);
      }

      if (tableUUID) {
        const { data: table } = await supabase
          .from("tables")
          .select("table_name")
          .eq("id", tableUUID)
          .single();
        
        if (table) {
          setTableName(table.table_name);
        }
      }
    } catch (error) {
      console.error("Error loading bar data:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("bar_id", barId)
        .eq("is_available", true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Error al cargar los productos");
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("bar_id", barId);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} añadido al pedido`);
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity <= 0 
            ? null 
            : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const productsByCategory = (categoryId: string) => {
    return products.filter(product => product.category_id === categoryId);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      const orderData = {
        bar_id: barId,
        table_id: tableUUID,
        status: 'pending' as const,
        total_amount: getCartTotal(),
        notes: null
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        notes: null
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setCart([]);
      toast.success("¡Pedido enviado correctamente!");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Error al enviar el pedido");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const requestBill = async () => {
    if (!tableUUID) {
      toast.error("No se puede solicitar la cuenta sin mesa asignada");
      return;
    }

    setIsRequestingBill(true);
    try {
      await SupabaseHelpers.requestBill(tableUUID, barId);
      toast.success("¡Cuenta solicitada! El personal será notificado.");
    } catch (error) {
      console.error("Error requesting bill:", error);
      toast.error("Error al solicitar la cuenta");
    } finally {
      setIsRequestingBill(false);
    }
  };

  if (!barId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Bar no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="nav-professional">
        <div className="container-professional flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-corporate">{barName}</h1>
            {tableName && (
              <p className="text-sm text-corporate-muted">{tableName}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={requestBill}
              disabled={isRequestingBill}
              className="btn-professional"
            >
              <Receipt className="mr-2 h-5 w-5" />
              {isRequestingBill ? "Solicitando..." : "Pedir cuenta"}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="btn-professional relative">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Pedido
                  {getCartItemCount() > 0 && (
                    <Badge className="absolute -right-2 -top-2 h-6 w-6 p-0 bg-destructive text-destructive-foreground">
                      {getCartItemCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="text-corporate">Tu pedido</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {cart.length === 0 ? (
                    <p className="py-8 text-center text-corporate-muted">
                      Tu pedido está vacío
                    </p>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 border border-border bg-card">
                          <div className="flex-1">
                            <p className="font-medium text-corporate">{item.name}</p>
                            <p className="text-sm text-corporate-muted">
                              €{item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="btn-professional-sm"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium text-corporate">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="btn-professional-sm"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="w-20 text-right font-semibold text-corporate">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-corporate p-3 bg-muted">
                        <span>Total</span>
                        <span>€{getCartTotal().toFixed(2)}</span>
                      </div>
                      <Button 
                        size="lg" 
                        className="w-full btn-professional"
                        onClick={submitOrder}
                        disabled={isSubmittingOrder || cart.length === 0}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmittingOrder ? "Enviando..." : "Enviar pedido"}
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Menu */}
      <div className="container-professional section-professional flex-1">
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <Alert className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este bar aún no ha configurado su carta. Por favor, contacta con el personal.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Tabs defaultValue={categories[0]?.id || "all"} className="w-full">
            <TabsList className="mb-8 w-full justify-center bg-muted p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Todos
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid-professional sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid-professional sm:grid-cols-2 lg:grid-cols-3">
                  {productsByCategory(category.id).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

const ProductCard = ({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) => {
  return (
    <Card className="card-corporate overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-3xl font-bold text-primary">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-semibold text-corporate text-lg">{product.name}</h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
            €{product.price.toFixed(2)}
          </Badge>
        </div>
        {product.description && (
          <p className="mb-4 line-clamp-2 text-sm text-corporate-muted leading-relaxed">
            {product.description}
          </p>
        )}
        <Button
          onClick={() => onAdd(product)}
          className="w-full btn-professional"
          disabled={!isProductAvailable(product.status)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Añadir al pedido
        </Button>
      </CardContent>
    </Card>
  );
};

export default BarMenu;
