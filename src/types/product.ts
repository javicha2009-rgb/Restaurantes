// Tipos para el sistema de estados de productos

export type ProductStatus = 'available' | 'temporarily_unavailable';

export interface ProductStatusOption {
  value: ProductStatus;
  label: string;
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const PRODUCT_STATUS_OPTIONS: ProductStatusOption[] = [
  {
    value: 'available',
    label: 'Disponible',
    description: 'El producto está disponible para pedidos',
    variant: 'default'
  },
  {
    value: 'temporarily_unavailable',
    label: 'No disponible temporalmente',
    description: 'El producto no está disponible temporalmente',
    variant: 'secondary'
  }
];

export const getProductStatusLabel = (status: ProductStatus): string => {
  const option = PRODUCT_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.label || status;
};

export const getProductStatusVariant = (status: ProductStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const option = PRODUCT_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.variant || 'outline';
};

// Función para determinar si un producto está disponible para pedidos
export const isProductAvailable = (status: ProductStatus): boolean => {
  return status === 'available';
};