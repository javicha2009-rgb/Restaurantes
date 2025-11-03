import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseHelpers, Product, Category } from '@/lib/supabase-helpers';
import { toast } from 'sonner';
import { ProductStatus, isProductAvailable } from '@/types/product';

export interface ProductWithCategory extends Product {
  categories?: {
    name: string;
    id: string;
  };
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface UpdateProductStatusData {
  id: string;
  status: ProductStatus;
}

export const useProducts = (barId: string, options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  // ==================== QUERIES ====================

  /**
   * Obtiene todos los productos del bar
   */
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products', barId],
    queryFn: async (): Promise<ProductWithCategory[]> => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .eq('bar_id', barId)
          .order('name');

        if (error) {
          console.error('Error fetching products:', error);
          toast.error('Error al cargar productos');
          throw new Error('Error al cargar productos');
        }

        return data || [];
      } catch (error) {
        console.error('Error in products query:', error);
        toast.error('Error al cargar productos');
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!barId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  /**
   * Obtiene todas las categorías del bar
   */
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories', barId],
    queryFn: async (): Promise<Category[]> => {
      try {
        return await SupabaseHelpers.getCategories(barId);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error al cargar categorías');
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!barId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ==================== MUTATIONS ====================

  /**
   * Crear nuevo producto
   */
  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductData): Promise<Product> => {
      const product = await SupabaseHelpers.createProduct({
        bar_id: barId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category_id: productData.categoryId,
        image_url: productData.imageUrl,
      });

      if (!product) {
        throw new Error('Error al crear el producto');
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', barId] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    }
  });

  /**
   * Actualizar producto
   */
  const updateProductMutation = useMutation({
    mutationFn: async (productData: UpdateProductData): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category_id: productData.categoryId,
          image_url: productData.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', productData.id)
        .eq('bar_id', barId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw new Error('Error al actualizar el producto');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', barId] });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    }
  });

  /**
   * Eliminar producto (marcar como no disponible)
   */
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_available: false,
          status: 'temporarily_unavailable',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('bar_id', barId);

      if (error) {
        console.error('Error deleting product:', error);
        throw new Error('Error al eliminar el producto');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', barId] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  });

  /**
   * Actualizar estado de producto
   */
  const updateProductStatusMutation = useMutation({
    mutationFn: async (statusData: UpdateProductStatusData): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          status: statusData.status,
          is_available: isProductAvailable(statusData.status),
          updated_at: new Date().toISOString()
        })
        .eq('id', statusData.id)
        .eq('bar_id', barId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product status:', error);
        throw new Error('Error al actualizar el estado del producto');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', barId] });
      toast.success('Estado del producto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating product status:', error);
      toast.error('Error al actualizar el estado del producto');
    }
  });

  /**
   * Crear nueva categoría
   */
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description?: string }): Promise<Category> => {
      const category = await SupabaseHelpers.createCategory({
        bar_id: barId,
        name: categoryData.name,
        description: categoryData.description,
        display_order: categories.length
      });

      if (!category) {
        throw new Error('Error al crear la categoría');
      }

      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', barId] });
      toast.success('Categoría creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Error al crear la categoría');
    }
  });

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Obtiene productos por categoría
   */
  const getProductsByCategory = (categoryId: string | null) => {
    if (!categoryId) return products;
    return products.filter(product => product.category_id === categoryId);
  };

  /**
   * Obtiene productos disponibles
   */
  const getAvailableProducts = () => {
    return products.filter(product => product.is_available);
  };

  /**
   * Busca productos por nombre o descripción
   */
  const searchProducts = (query: string) => {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
  };

  /**
   * Filtra productos por rango de precio
   */
  const filterProductsByPrice = (minPrice?: number, maxPrice?: number) => {
    return products.filter(product => {
      if (minPrice !== undefined && product.price < minPrice) return false;
      if (maxPrice !== undefined && product.price > maxPrice) return false;
      return true;
    });
  };

  /**
   * Obtiene estadísticas de productos
   */
  const getProductStats = () => {
    const availableProducts = getAvailableProducts();
    
    return {
      total: products.length,
      available: availableProducts.length,
      unavailable: products.length - availableProducts.length,
      categories: categories.length,
      averagePrice: availableProducts.length > 0 
        ? availableProducts.reduce((sum, p) => sum + p.price, 0) / availableProducts.length 
        : 0,
      priceRange: {
        min: availableProducts.length > 0 ? Math.min(...availableProducts.map(p => p.price)) : 0,
        max: availableProducts.length > 0 ? Math.max(...availableProducts.map(p => p.price)) : 0
      }
    };
  };

  /**
   * Obtiene productos más caros
   */
  const getExpensiveProducts = (limit: number = 5) => {
    return [...getAvailableProducts()]
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);
  };

  /**
   * Obtiene productos más baratos
   */
  const getCheapestProducts = (limit: number = 5) => {
    return [...getAvailableProducts()]
      .sort((a, b) => a.price - b.price)
      .slice(0, limit);
  };

  /**
   * Valida si un producto existe
   */
  const productExists = (name: string, excludeId?: string) => {
    return products.some(product => 
      product.name.toLowerCase() === name.toLowerCase() && 
      product.id !== excludeId
    );
  };

  /**
   * Obtiene producto por ID
   */
  const getProductById = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  return {
    // Data
    products,
    categories,
    isLoading: isLoadingProducts || isLoadingCategories,
    error: productsError || categoriesError,
    
    // Filtered data
    getProductsByCategory,
    getAvailableProducts,
    searchProducts,
    filterProductsByPrice,
    
    // Mutations
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    updateProductStatus: updateProductStatusMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    createCategory: createCategoryMutation.mutate,
    
    // Loading states
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isUpdatingProductStatus: updateProductStatusMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
    isCreatingCategory: createCategoryMutation.isPending,
    
    // Helpers
    getProductStats,
    getExpensiveProducts,
    getCheapestProducts,
    productExists,
    getProductById,
    
    // Refetch
    refetchProducts,
    refetchCategories
  };
};

export default useProducts;