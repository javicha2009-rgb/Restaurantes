import { z } from 'zod';

// ==================== USER VALIDATION ====================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  barName: z.string().min(2, 'El nombre del bar debe tener al menos 2 caracteres')
});

// ==================== BAR VALIDATION ====================

export const barSchema = z.object({
  name: z.string().min(2, 'El nombre del bar debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal(''))
});

export const updateBarSchema = barSchema.partial();

// ==================== TABLE VALIDATION ====================

export const tableSchema = z.object({
  tableName: z.string().min(1, 'El nombre de la mesa es requerido'),
  tableNumber: z.string().min(1, 'El número de mesa es requerido')
});

export const bulkTableSchema = z.object({
  tables: z.array(z.object({
    name: z.string().min(1, 'Nombre requerido'),
    number: z.string().min(1, 'Número requerido')
  })).min(1, 'Debe agregar al menos una mesa')
});

// ==================== PRODUCT VALIDATION ====================

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre del producto debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  categoryId: z.string().optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional().or(z.literal(''))
});

export const updateProductSchema = productSchema.partial();

// ==================== CATEGORY VALIDATION ====================

export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre de la categoría debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  displayOrder: z.number().min(0, 'El orden debe ser mayor o igual a 0').optional()
});

export const updateCategorySchema = categorySchema.partial();

// ==================== ORDER VALIDATION ====================

export const orderItemSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  productName: z.string().min(1, 'Nombre de producto requerido'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  productPrice: z.number().min(0, 'El precio debe ser mayor o igual a 0')
});

export const createOrderSchema = z.object({
  tableQrValue: z.string().uuid('Código QR inválido'),
  items: z.array(orderItemSchema).min(1, 'Debe agregar al menos un producto'),
  notes: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served', 'paid'])
});

// ==================== QR VALIDATION ====================

export const qrValidationSchema = z.object({
  qrValue: z.string().uuid('Código QR inválido'),
  barId: z.string().uuid('ID de bar inválido')
});

// ==================== SEARCH AND FILTER VALIDATION ====================

export const searchSchema = z.object({
  query: z.string().min(1, 'Término de búsqueda requerido').max(100, 'Búsqueda muy larga'),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional()
});

export const paginationSchema = z.object({
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.number().min(1).max(100, 'Límite máximo de 100 elementos').default(20)
});

// ==================== FILE UPLOAD VALIDATION ====================

export const imageUploadSchema = z.object({
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp'])
});

// ==================== VALIDATION HELPERS ====================

export class ValidationHelpers {
  /**
   * Valida un email
   */
  static isValidEmail(email: string): boolean {
    return z.string().email().safeParse(email).success;
  }

  /**
   * Valida un UUID
   */
  static isValidUUID(uuid: string): boolean {
    return z.string().uuid().safeParse(uuid).success;
  }

  /**
   * Valida un número de teléfono (formato básico)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Valida una URL
   */
  static isValidUrl(url: string): boolean {
    return z.string().url().safeParse(url).success;
  }

  /**
   * Sanitiza una cadena de texto
   */
  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Valida el tamaño de un archivo
   */
  static isValidFileSize(file: File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }

  /**
   * Valida el tipo de un archivo
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Valida una imagen
   */
  static validateImage(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!this.isValidFileSize(file, maxSize)) {
      return { isValid: false, error: 'El archivo es muy grande (máximo 5MB)' };
    }

    if (!this.isValidFileType(file, allowedTypes)) {
      return { isValid: false, error: 'Tipo de archivo no permitido (solo JPEG, PNG, WebP)' };
    }

    return { isValid: true };
  }

  /**
   * Valida un precio
   */
  static validatePrice(price: number): { isValid: boolean; error?: string } {
    if (price < 0) {
      return { isValid: false, error: 'El precio no puede ser negativo' };
    }

    if (price > 9999.99) {
      return { isValid: false, error: 'El precio es muy alto (máximo €9999.99)' };
    }

    // Validar que tenga máximo 2 decimales
    if (Math.round(price * 100) !== price * 100) {
      return { isValid: false, error: 'El precio puede tener máximo 2 decimales' };
    }

    return { isValid: true };
  }

  /**
   * Valida una cantidad
   */
  static validateQuantity(quantity: number): { isValid: boolean; error?: string } {
    if (!Number.isInteger(quantity)) {
      return { isValid: false, error: 'La cantidad debe ser un número entero' };
    }

    if (quantity < 1) {
      return { isValid: false, error: 'La cantidad debe ser mayor a 0' };
    }

    if (quantity > 100) {
      return { isValid: false, error: 'Cantidad máxima: 100' };
    }

    return { isValid: true };
  }
}

// ==================== TYPE EXPORTS ====================

export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type BarData = z.infer<typeof barSchema>;
export type TableData = z.infer<typeof tableSchema>;
export type ProductData = z.infer<typeof productSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
export type OrderData = z.infer<typeof createOrderSchema>;
export type OrderItemData = z.infer<typeof orderItemSchema>;
export type SearchData = z.infer<typeof searchSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;

export default ValidationHelpers;