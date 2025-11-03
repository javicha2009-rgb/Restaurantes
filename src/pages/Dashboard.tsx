import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LogOut, QrCode, UtensilsCrossed, Table, Package, Search, TrendingUp, Clock, CheckCircle, Settings, Users, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useOrders, OrderWithDetails } from "@/hooks/useOrders";
import { useTables } from "@/hooks/useTables";
import { useProducts } from "@/hooks/useProducts";
import { BarConfigModal } from "@/components/BarConfigModal";
import { TableQRModal } from "@/components/TableQRModal";
import { ProductStatus, PRODUCT_STATUS_OPTIONS, getProductStatusLabel, getProductStatusVariant } from "@/types/product";
import { Table as TableType } from "@/lib/supabase-helpers";
import { convertBarIdToUUID } from "@/lib/id-utils";
import Footer from "@/components/layout/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const [barId, setBarId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Hooks personalizados - solo se ejecutan si tenemos un barId válido
  const { 
    orders, 
    isLoading: isLoadingOrders, 
    updateOrderStatus: updateOrderStatusMutation, 
    getOrdersByStatus,
    getOrderStats,
    searchOrders
  } = useOrders(barId || "", { enabled: !!barId });

  const { 
    tables, 
    isLoading: isLoadingTables,
    getTableStats 
  } = useTables(barId || "", { enabled: !!barId });

  const { 
    products, 
    isLoading: isLoadingProducts,
    getProductStats,
    updateProductStatus,
    isUpdatingProductStatus
  } = useProducts(barId || "", { enabled: !!barId });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Verificar autenticación basada en sessionStorage
      const isLoggedIn = sessionStorage.getItem("mesalink_logged_in");
      const barId = sessionStorage.getItem("mesalink_bar_id");
      const barName = sessionStorage.getItem("mesalink_bar_name");
      
      if (!isLoggedIn || !barId) {
        navigate("/portal");
        return;
      }

      // Usar el bar ID de la sesión y convertirlo a UUID
      const barUUID = convertBarIdToUUID(barId);
      setBarId(barUUID);
      
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/portal");
    }
  };

  const handleLogout = async () => {
    // Limpiar toda la información de la sesión
    sessionStorage.removeItem("mesalink_logged_in");
    sessionStorage.removeItem("mesalink_bar_id");
    sessionStorage.removeItem("mesalink_bar_name");
    navigate("/portal");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      preparing: "default",
      ready: "default",
      served: "default",
      paid: "default",
    };

    const labels: Record<string, string> = {
      pending: "Pendiente",
      preparing: "En preparación",
      ready: "Listo",
      served: "Servido",
      paid: "Pagado",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Obtener estadísticas
  const orderStats = getOrderStats();
  const tableStats = getTableStats();
  const productStats = getProductStats();

  // Filtrar pedidos por búsqueda
  const filteredOrders = searchQuery 
    ? searchOrders(searchQuery)
    : orders;

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateOrderStatusMutation({ 
      orderId, 
      status: status as 'pending' | 'preparing' | 'ready' | 'served' | 'paid'
    });
  };

  const handleUpdateProductStatus = async (productId: string, newStatus: ProductStatus) => {
    try {
      await updateProductStatus({ id: productId, status: newStatus });
      toast.success(`Estado del producto actualizado a ${getProductStatusLabel(newStatus)}`);
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Error al actualizar el estado del producto");
    }
  };

  const loading = isLoadingOrders || isLoadingTables || isLoadingProducts;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="nav-professional">
        <div className="container-professional flex items-center justify-between py-6">
          <div className="flex items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground rounded-lg shadow-sm">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-corporate">Panel de Control</h1>
              <p className="text-sm text-corporate-muted">Gestiona tus pedidos y operaciones</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowConfigModal(true)} className="btn-professional">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
            <Button variant="outline" onClick={handleLogout} className="btn-professional">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="bg-muted border-b border-border">
        <div className="container-professional section-professional">
          <div className="grid-professional sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-corporate p-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-lg">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-corporate-muted uppercase tracking-wide">Pedidos Pendientes</p>
                  <p className="text-3xl font-bold text-corporate mt-1">{orderStats.pending}</p>
                </div>
              </div>
            </div>
            
            <div className="card-corporate p-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-green-100 text-green-600 rounded-lg">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-corporate-muted uppercase tracking-wide">Pedidos Listos</p>
                  <p className="text-3xl font-bold text-corporate mt-1">{orderStats.ready}</p>
                </div>
              </div>
            </div>

            <div className="card-corporate p-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-lg">
                  <Table className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-corporate-muted uppercase tracking-wide">Mesas Activas</p>
                  <p className="text-3xl font-bold text-corporate mt-1">{tableStats.active}</p>
                </div>
              </div>
            </div>

            <div className="card-corporate p-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-lg">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-corporate-muted uppercase tracking-wide">Ingresos Hoy</p>
                  <p className="text-3xl font-bold text-corporate mt-1">€{orderStats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border-b border-border">
        <div className="container-professional py-8">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-professional pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-professional section-professional flex-1">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted p-2 rounded-lg mb-8">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3">
              Pendientes ({orderStats.pending})
            </TabsTrigger>
            <TabsTrigger value="preparing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3">
              En preparación ({orderStats.preparing})
            </TabsTrigger>
            <TabsTrigger value="ready" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3">
              Listos ({orderStats.ready})
            </TabsTrigger>
            <TabsTrigger value="by-table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3">
              Por Mesa
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3">
              Productos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <OrdersList
              orders={filteredOrders}
              loading={loading}
              onUpdateStatus={handleUpdateOrderStatus}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="pending">
            <OrdersList
              orders={getOrdersByStatus("pending")}
              loading={loading}
              onUpdateStatus={handleUpdateOrderStatus}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="preparing">
            <OrdersList
              orders={getOrdersByStatus("preparing")}
              loading={loading}
              onUpdateStatus={handleUpdateOrderStatus}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="ready">
            <OrdersList
              orders={getOrdersByStatus("ready")}
              loading={loading}
              onUpdateStatus={handleUpdateOrderStatus}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="by-table">
            <OrdersByTable
              orders={filteredOrders}
              tables={tables}
              loading={loading}
              onUpdateStatus={handleUpdateOrderStatus}
              getStatusBadge={getStatusBadge}
              setSelectedTableForQR={setSelectedTableForQR}
              setShowQRModal={setShowQRModal}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductsList
              products={products}
              loading={isLoadingProducts}
              onUpdateStatus={handleUpdateProductStatus}
              isUpdating={isUpdatingProductStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <BarConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        barId={barId || ""}
      />
      
      <TableQRModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedTableForQR(null);
        }}
        table={selectedTableForQR}
        barName={sessionStorage.getItem("mesalink_bar_name")}
      />
      
      <Footer />
    </div>
  );
};

const OrdersList = ({
  orders,
  loading,
  onUpdateStatus,
  getStatusBadge,
}: {
  orders: OrderWithDetails[];
  loading: boolean;
  onUpdateStatus: (orderId: string, status: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No hay pedidos en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden transition-all hover:shadow-glow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  Pedido #{order.order_number}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {order.tables?.table_name || `Mesa ${order.tables?.table_number}`}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {order.order_items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="text-muted-foreground">
                    €{item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              {order.status === "pending" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onUpdateStatus(order.id, "preparing")}
                >
                  Preparar
                </Button>
              )}
              {order.status === "preparing" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onUpdateStatus(order.id, "ready")}
                >
                  Marcar listo
                </Button>
              )}
              {order.status === "ready" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onUpdateStatus(order.id, "served")}
                >
                  Servido
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ProductsList = ({
  products,
  loading,
  onUpdateStatus,
  isUpdating,
}: {
  products: any[];
  loading: boolean;
  onUpdateStatus: (productId: string, status: ProductStatus) => void;
  isUpdating: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.category?.name || 'Sin categoría'}
                </p>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">${product.price}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={getProductStatusVariant(product.status)}>
                  {getProductStatusLabel(product.status)}
                </Badge>
              </div>
              <Select
                value={product.status}
                onValueChange={(value: ProductStatus) => onUpdateStatus(product.id, value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Componente para mostrar pedidos organizados por mesa
const OrdersByTable = ({
  orders,
  tables,
  loading,
  onUpdateStatus,
  getStatusBadge,
  setSelectedTableForQR,
  setShowQRModal,
}: {
  orders: OrderWithDetails[];
  tables: TableType[];
  loading: boolean;
  onUpdateStatus: (orderId: string, status: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  setSelectedTableForQR: (table: TableType) => void;
  setShowQRModal: (show: boolean) => void;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando pedidos por mesa...</p>
        </div>
      </div>
    );
  }

  // Agrupar pedidos por mesa
  const ordersByTable = orders.reduce((acc, order) => {
    const tableKey = order.tables?.table_number || 'sin-mesa';
    if (!acc[tableKey]) {
      // Crear un objeto TableType completo
      const tableData: TableType = order.tables ? {
        id: 'temp-table-id',
        bar_id: '',
        table_name: order.tables.table_name || 'Sin Mesa',
        table_number: order.tables.table_number,
        qr_code_value: 'temp-qr',
        is_active: true,
        created_at: new Date().toISOString()
      } : {
        id: 'no-table-id',
        bar_id: '',
        table_name: 'Sin Mesa', 
        table_number: '0', 
        qr_code_value: 'no-qr',
        is_active: true, 
        created_at: new Date().toISOString()
      };

      acc[tableKey] = {
        table: tableData,
        orders: []
      };
    }
    acc[tableKey].orders.push(order);
    return acc;
  }, {} as Record<string, { table: TableType; orders: OrderWithDetails[] }>);

  // Añadir mesas sin pedidos
  tables.forEach(table => {
    if (!ordersByTable[table.table_number]) {
      ordersByTable[table.table_number] = {
        table,
        orders: []
      };
    }
  });

  const sortedTables = Object.values(ordersByTable).sort((a, b) => 
    (parseInt(a.table.table_number) || 0) - (parseInt(b.table.table_number) || 0)
  );

  if (sortedTables.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay mesas configuradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedTables.map(({ table, orders: tableOrders }) => (
        <Card key={table.table_number || 'sin-mesa'} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {table.table_name || `Mesa ${table.table_number}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tableOrders.length} pedido{tableOrders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTableForQR(table);
                    setShowQRModal(true);
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR
                </Button>
                {tableOrders.length > 0 && (
                  <Badge variant="outline">
                    Total: €{tableOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>

            {tableOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay pedidos para esta mesa</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tableOrders.map((order) => (
                  <Card key={order.id} className="border-2 border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Pedido #{order.order_number}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {order.order_items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="text-muted-foreground">
                              €{item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between border-t border-border pt-2 font-semibold text-sm mb-3">
                        <span>Total</span>
                        <span>€{order.total.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => onUpdateStatus(order.id, "preparing")}
                          >
                            Preparar
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => onUpdateStatus(order.id, "ready")}
                          >
                            Listo
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => onUpdateStatus(order.id, "served")}
                          >
                            Servido
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
