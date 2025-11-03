import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseHelpers, Order } from '@/lib/supabase-helpers';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface OrderWithDetails extends Order {
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_price: number;
    subtotal: number;
    notes?: string;
  }>;
  tables?: {
    table_name: string;
    table_number: string;
  };
}

export interface CreateOrderData {
  tableQrValue: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    product_price: number;
  }>;
  notes?: string;
}

export const useOrders = (barId: string, options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  // ==================== QUERIES ====================

  /**
   * Obtiene todos los pedidos del bar
   */
  const {
    data: orders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', barId],
    queryFn: async (): Promise<OrderWithDetails[]> => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              product_name,
              quantity,
              product_price,
              subtotal,
              notes
            ),
            tables (
              table_name,
              table_number
            )
          `)
          .eq('bar_id', barId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching orders:', error);
          toast.error('Error al cargar pedidos');
          throw new Error('Error al cargar pedidos');
        }

        return data || [];
      } catch (error) {
        console.error('Error in orders query:', error);
        toast.error('Error al cargar pedidos');
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!barId,
    refetchInterval: 30000, // Refetch cada 30 segundos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  /**
   * Obtiene pedidos filtrados por estado
   */
  const getOrdersByStatus = (status: Order['status'] | null) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  // ==================== MUTATIONS ====================

  /**
   * Crear nuevo pedido
   */
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData): Promise<Order> => {
      const order = await SupabaseHelpers.createOrder(
        barId,
        orderData.tableQrValue,
        orderData.items,
        orderData.notes
      );

      if (!order) {
        throw new Error('Error al crear el pedido');
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', barId] });
      toast.success('Pedido creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Error al crear el pedido');
    }
  });

  /**
   * Actualizar estado del pedido
   */
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const success = await SupabaseHelpers.updateOrderStatus(orderId, status);
      
      if (!success) {
        throw new Error('Error al actualizar el estado del pedido');
      }

      return { orderId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders', barId] });
      
      const statusMessages = {
        pending: 'Pedido marcado como pendiente',
        preparing: 'Pedido en preparación',
        ready: 'Pedido listo para servir',
        served: 'Pedido servido',
        paid: 'Pedido pagado',
        cancelled: 'Pedido cancelado'
      };

      toast.success(statusMessages[data.status] || 'Estado actualizado');
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado del pedido');
    }
  });

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  useEffect(() => {
    if (!barId) return;

    // Suscripción a cambios en pedidos
    const ordersSubscription = supabase
      .channel(`orders_${barId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `bar_id=eq.${barId}`,
        },
        (payload) => {
          console.log('Order change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders', barId] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Nuevo pedido recibido', {
              description: `Pedido #${payload.new.order_number}`,
            });
          }
        }
      )
      .subscribe();

    // Suscripción a cambios en items de pedidos
    const orderItemsSubscription = supabase
      .channel(`order_items_${barId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', barId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(orderItemsSubscription);
    };
  }, [barId, queryClient]);

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Obtiene estadísticas de pedidos
   */
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      served: orders.filter(o => o.status === 'served').length,
      totalRevenue: orders
        .filter(o => o.status === 'paid')
        .reduce((sum, order) => sum + order.total, 0)
    };

    return stats;
  };

  /**
   * Obtiene el siguiente número de pedido
   */
  const getNextOrderNumber = () => {
    if (orders.length === 0) return 1;
    return Math.max(...orders.map(o => o.order_number)) + 1;
  };

  /**
   * Busca pedidos por número o mesa
   */
  const searchOrders = (query: string) => {
    const searchTerm = query.toLowerCase();
    return orders.filter(order => 
      order.order_number.toString().includes(searchTerm) ||
      order.tables?.table_name?.toLowerCase().includes(searchTerm) ||
      order.tables?.table_number?.toLowerCase().includes(searchTerm)
    );
  };

  return {
    // Data
    orders,
    isLoading,
    error,
    
    // Filtered data
    getOrdersByStatus,
    
    // Mutations
    createOrder: createOrderMutation.mutate,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
    
    // Helpers
    getOrderStats,
    getNextOrderNumber,
    searchOrders,
    refetch
  };
};

export default useOrders;