import { supabase } from '@/integrations/supabase/client';
import { QRUtils, TableQRData } from './qr-utils';

export interface Bar {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  bar_id: string;
  table_name: string;
  table_number: string;
  qr_code_value: string;
  qr_print_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  bar_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  status: 'available' | 'temporarily_unavailable';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  bar_id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  bar_id: string;
  table_qr_value: string;
  order_number: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  created_at: string;
}

// Función helper para manejar timeouts y reintentos
const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

// Función helper para reintentos con backoff exponencial
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export class SupabaseHelpers {
  // ==================== BAR OPERATIONS ====================
  
  /**
   * Obtiene información de un bar por ID
   */
  static async getBar(barId: string): Promise<Bar | null> {
    const { data, error } = await supabase
      .from('bars')
      .select('*')
      .eq('id', barId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching bar:', error);
      return null;
    }

    return data;
  }

  /**
   * Crea un nuevo bar
   */
  static async createBar(barData: Partial<Bar>): Promise<Bar | null> {
    const { data, error } = await supabase
      .from('bars')
      .insert({
        name: barData.name,
        description: barData.description,
        address: barData.address,
        phone: barData.phone,
        email: barData.email,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bar:', error);
      return null;
    }

    return data;
  }

  // ==================== TABLE OPERATIONS ====================

  /**
   * Obtiene todas las mesas de un bar
   */
  static async getTables(barId: string): Promise<Table[]> {
    if (!barId) {
      throw new Error('Bar ID is required');
    }

    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('bar_id', barId)
      .eq('is_active', true)
      .order('table_number');

    if (error) {
      console.error('Error fetching tables:', error);
      throw new Error(`Failed to fetch tables: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Crea una nueva mesa con código QR
   */
  static async createTable(
    barId: string,
    tableName: string,
    tableNumber: string
  ): Promise<Table | null> {
    const qrValue = QRUtils.generateQRValue();

    const { data, error } = await supabase
      .from('tables')
      .insert({
        bar_id: barId,
        table_name: tableName,
        table_number: tableNumber,
        qr_code_value: qrValue,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating table:', error);
      return null;
    }

    return data;
  }

  /**
   * Valida un código QR y obtiene información de la mesa
   */
  static async validateQRCode(qrValue: string, barId: string): Promise<Table | null> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('qr_code_value', qrValue)
      .eq('bar_id', barId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error validating QR code:', error);
      return null;
    }

    return data;
  }

  // ==================== PRODUCT OPERATIONS ====================

  /**
   * Obtiene todos los productos de un bar
   */
  static async getProducts(barId: string): Promise<Product[]> {
    if (!barId) {
      throw new Error('Bar ID is required');
    }

    return withRetry(async () => {
      const result = await withTimeout(
        Promise.resolve(
          supabase
            .from('products')
            .select('*')
            .eq('bar_id', barId)
            .eq('is_available', true)
            .order('name')
        ),
        15000
      );

      if (result.error) {
        console.error('Error fetching products:', result.error);
        throw new Error(`Failed to fetch products: ${result.error.message}`);
      }

      return result.data || [];
    }, 3, 1000);
  }

  /**
   * Obtiene productos por categoría
   */
  static async getProductsByCategory(barId: string, categoryId: string): Promise<Product[]> {
    if (!barId) {
      throw new Error('Bar ID is required');
    }
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    return withRetry(async () => {
      const result = await withTimeout(
        Promise.resolve(
          supabase
            .from('products')
            .select('*')
            .eq('bar_id', barId)
            .eq('category_id', categoryId)
            .eq('is_available', true)
            .order('name')
        ),
        15000
      );

      if (result.error) {
        console.error('Error fetching products by category:', result.error);
        throw new Error(`Failed to fetch products by category: ${result.error.message}`);
      }

      return result.data || [];
    }, 3, 1000);
  }

  /**
   * Crea un nuevo producto
   */
  static async createProduct(productData: Partial<Product>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        bar_id: productData.bar_id,
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url,
        is_available: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    return data;
  }

  // ==================== CATEGORY OPERATIONS ====================

  /**
   * Obtiene todas las categorías de un bar
   */
  static async getCategories(barId: string): Promise<Category[]> {
    if (!barId) {
      throw new Error('Bar ID is required');
    }

    return withRetry(async () => {
      const result = await withTimeout(
        Promise.resolve(
          supabase
            .from('categories')
            .select('*')
            .eq('bar_id', barId)
            .eq('is_active', true)
            .order('display_order')
        ),
        15000
      );

      if (result.error) {
        console.error('Error fetching categories:', result.error);
        throw new Error(`Failed to fetch categories: ${result.error.message}`);
      }

      return result.data || [];
    }, 3, 1000);
  }

  /**
   * Crea una nueva categoría
   */
  static async createCategory(categoryData: Partial<Category>): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        bar_id: categoryData.bar_id,
        name: categoryData.name,
        description: categoryData.description,
        display_order: categoryData.display_order || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }

    return data;
  }

  // ==================== ORDER OPERATIONS ====================

  /**
   * Obtiene pedidos de un bar
   */
  static async getOrders(barId: string, limit: number = 50): Promise<Order[]> {
    if (!barId) {
      throw new Error('Bar ID is required');
    }

    return withRetry(async () => {
      const result = await withTimeout(
        Promise.resolve(
          supabase
            .from('orders')
            .select(`
              *,
              order_items (
                *
              ),
              tables (
                table_name,
                table_number
              )
            `)
            .eq('bar_id', barId)
            .order('created_at', { ascending: false })
            .limit(limit)
        ),
        20000 // 20 segundos para queries más complejas
      );

      if (result.error) {
        console.error('Error fetching orders:', result.error);
        throw new Error(`Failed to fetch orders: ${result.error.message}`);
      }

      return result.data || [];
    }, 3, 1000);
  }

  /**
   * Crea un nuevo pedido
   */
  static async createOrder(
    barId: string,
    tableQrValue: string,
    items: Array<{ product_id: string; product_name: string; quantity: number; product_price: number }>,
    notes?: string
  ): Promise<Order | null> {
    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.product_price), 0);

    // Generar número de pedido
    const { data: lastOrder } = await supabase
      .from('orders')
      .select('order_number')
      .eq('bar_id', barId)
      .order('order_number', { ascending: false })
      .limit(1)
      .single();

    const orderNumber = (lastOrder?.order_number || 0) + 1;

    // Crear pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        bar_id: barId,
        table_qr_value: tableQrValue,
        order_number: orderNumber,
        status: 'pending',
        total: total,
        notes: notes
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return null;
    }

    // Crear items del pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      subtotal: item.quantity * item.product_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return null;
    }

    return order;
  }

  /**
   * Actualiza el estado de un pedido
   */
  static async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getCurrentUserProfile(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Verifica si el usuario es propietario de un bar
   */
  static async isBarOwner(userId: string, barId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('bar_id')
      .eq('id', userId)
      .eq('bar_id', barId)
      .single();

    return !error && data !== null;
  }

  /**
   * Solicita la cuenta para una mesa
   */
  static async requestBill(tableQrValue: string, barId: string): Promise<boolean> {
    try {
      // Actualizar las órdenes de la mesa para marcar que se ha solicitado la cuenta
      const { error } = await supabase
        .from('orders')
        .update({
          notes: 'CUENTA SOLICITADA - ' + (new Date().toLocaleString()),
          updated_at: new Date().toISOString()
        })
        .eq('table_qr_value', tableQrValue)
        .eq('bar_id', barId)
        .in('status', ['pending', 'preparing', 'ready']);

      if (error) {
        console.error('Error requesting bill:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting bill:', error);
      return false;
    }
  }
}

export default SupabaseHelpers;