import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseHelpers, Table } from '@/lib/supabase-helpers';
import { QRUtils } from '@/lib/qr-utils';
import { toast } from 'sonner';

export interface TableWithQR extends Table {
  qr_data_url?: string;
  menu_url?: string;
}

export interface CreateTableData {
  tableName: string;
  tableNumber: string;
}

export interface BulkCreateTablesData {
  tables: Array<{
    name: string;
    number: string;
  }>;
}

export const useTables = (barId: string, options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  // ==================== QUERIES ====================

  /**
   * Obtiene todas las mesas del bar
   */
  const {
    data: tables = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tables', barId],
    queryFn: async (): Promise<TableWithQR[]> => {
      try {
        const tablesData = await SupabaseHelpers.getTables(barId);
        
        // Generar URLs de menú para cada mesa
        const tablesWithUrls = tablesData.map(table => ({
          ...table,
          menu_url: QRUtils.generateMenuUrl(barId, table.qr_code_value)
        }));

        return tablesWithUrls;
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast.error('Error al cargar las mesas');
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!barId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ==================== MUTATIONS ====================

  /**
   * Crear nueva mesa
   */
  const createTableMutation = useMutation({
    mutationFn: async (tableData: CreateTableData): Promise<Table> => {
      const table = await SupabaseHelpers.createTable(
        barId,
        tableData.tableName,
        tableData.tableNumber
      );

      if (!table) {
        throw new Error('Error al crear la mesa');
      }

      return table;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', barId] });
      toast.success('Mesa creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating table:', error);
      toast.error('Error al crear la mesa');
    }
  });

  /**
   * Crear múltiples mesas
   */
  const createBulkTablesMutation = useMutation({
    mutationFn: async (data: BulkCreateTablesData): Promise<Table[]> => {
      const createdTables: Table[] = [];

      for (const tableData of data.tables) {
        const table = await SupabaseHelpers.createTable(
          barId,
          tableData.name,
          tableData.number
        );

        if (table) {
          createdTables.push(table);
        }
      }

      if (createdTables.length === 0) {
        throw new Error('No se pudo crear ninguna mesa');
      }

      return createdTables;
    },
    onSuccess: (createdTables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', barId] });
      toast.success(`${createdTables.length} mesas creadas exitosamente`);
    },
    onError: (error) => {
      console.error('Error creating tables:', error);
      toast.error('Error al crear las mesas');
    }
  });

  /**
   * Actualizar mesa
   */
  const updateTableMutation = useMutation({
    mutationFn: async ({ 
      tableId, 
      tableName, 
      tableNumber 
    }: { 
      tableId: string; 
      tableName: string; 
      tableNumber: string; 
    }): Promise<Table> => {
      const { data, error } = await supabase
        .from('tables')
        .update({
          table_name: tableName,
          table_number: tableNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .eq('bar_id', barId)
        .select()
        .single();

      if (error) {
        console.error('Error updating table:', error);
        throw new Error('Error al actualizar la mesa');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', barId] });
      toast.success('Mesa actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating table:', error);
      toast.error('Error al actualizar la mesa');
    }
  });

  /**
   * Eliminar mesa (marcar como inactiva)
   */
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string): Promise<void> => {
      const { error } = await supabase
        .from('tables')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .eq('bar_id', barId);

      if (error) {
        console.error('Error deleting table:', error);
        throw new Error('Error al eliminar la mesa');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', barId] });
      toast.success('Mesa eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting table:', error);
      toast.error('Error al eliminar la mesa');
    }
  });

  /**
   * Regenerar código QR de una mesa
   */
  const regenerateQRMutation = useMutation({
    mutationFn: async (tableId: string): Promise<Table> => {
      const newQRValue = QRUtils.generateQRValue();

      const { data, error } = await supabase
        .from('tables')
        .update({
          qr_code_value: newQRValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .eq('bar_id', barId)
        .select()
        .single();

      if (error) {
        console.error('Error regenerating QR:', error);
        throw new Error('Error al regenerar el código QR');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', barId] });
      toast.success('Código QR regenerado exitosamente');
    },
    onError: (error) => {
      console.error('Error regenerating QR:', error);
      toast.error('Error al regenerar el código QR');
    }
  });

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Genera código QR para una mesa específica
   */
  const generateQRForTable = async (table: Table): Promise<string> => {
    const menuUrl = QRUtils.generateMenuUrl(barId, table.qr_code_value);
    return await QRUtils.generateQRDataURL(menuUrl);
  };

  /**
   * Genera códigos QR para todas las mesas
   */
  const generateAllQRCodes = async (): Promise<TableWithQR[]> => {
    const tablesWithQR: TableWithQR[] = [];

    for (const table of tables) {
      try {
        const qrDataUrl = await generateQRForTable(table);
        tablesWithQR.push({
          ...table,
          qr_data_url: qrDataUrl
        });
      } catch (error) {
        console.error(`Error generating QR for table ${table.id}:`, error);
        tablesWithQR.push(table);
      }
    }

    return tablesWithQR;
  };

  /**
   * Valida código QR
   */
  const validateQRCode = async (qrValue: string): Promise<Table | null> => {
    return await SupabaseHelpers.validateQRCode(qrValue, barId);
  };

  /**
   * Busca mesas por nombre o número
   */
  const searchTables = (query: string) => {
    const searchTerm = query.toLowerCase();
    return tables.filter(table => 
      table.table_name.toLowerCase().includes(searchTerm) ||
      table.table_number.toLowerCase().includes(searchTerm)
    );
  };

  /**
   * Obtiene mesa por ID
   */
  const getTableById = (tableId: string) => {
    return tables.find(table => table.id === tableId);
  };

  /**
   * Obtiene mesa por número
   */
  const getTableByNumber = (tableNumber: string) => {
    return tables.find(table => table.table_number === tableNumber);
  };

  /**
   * Verifica si un número de mesa ya existe
   */
  const tableNumberExists = (tableNumber: string, excludeId?: string) => {
    return tables.some(table => 
      table.table_number === tableNumber && 
      table.id !== excludeId
    );
  };

  /**
   * Obtiene estadísticas de mesas
   */
  const getTableStats = () => {
    return {
      total: tables.length,
      active: tables.filter(t => t.is_active).length,
      inactive: tables.filter(t => !t.is_active).length
    };
  };

  /**
   * Descarga QR de una mesa
   */
  const downloadTableQR = async (table: Table) => {
    try {
      const qrDataUrl = await generateQRForTable(table);
      const filename = `QR_${table.table_name}_${table.table_number}.png`;
      QRUtils.downloadQRCode(qrDataUrl, filename);
      toast.success('Código QR descargado');
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast.error('Error al descargar el código QR');
    }
  };

  /**
   * Descarga todos los códigos QR
   */
  const downloadAllQRCodes = async () => {
    try {
      const tablesWithQR = await generateAllQRCodes();
      
      for (const table of tablesWithQR) {
        if (table.qr_data_url) {
          const filename = `QR_${table.table_name}_${table.table_number}.png`;
          QRUtils.downloadQRCode(table.qr_data_url, filename);
          
          // Pequeña pausa entre descargas para evitar problemas del navegador
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast.success('Todos los códigos QR descargados');
    } catch (error) {
      console.error('Error downloading all QR codes:', error);
      toast.error('Error al descargar los códigos QR');
    }
  };

  return {
    // Data
    tables,
    isLoading,
    error,
    
    // Mutations
    createTable: createTableMutation.mutate,
    createBulkTables: createBulkTablesMutation.mutate,
    updateTable: updateTableMutation.mutate,
    deleteTable: deleteTableMutation.mutate,
    regenerateQR: regenerateQRMutation.mutate,
    
    // Loading states
    isCreatingTable: createTableMutation.isPending,
    isCreatingBulkTables: createBulkTablesMutation.isPending,
    isUpdatingTable: updateTableMutation.isPending,
    isDeletingTable: deleteTableMutation.isPending,
    isRegeneratingQR: regenerateQRMutation.isPending,
    
    // Helpers
    generateQRForTable,
    generateAllQRCodes,
    validateQRCode,
    searchTables,
    getTableById,
    getTableByNumber,
    tableNumberExists,
    getTableStats,
    downloadTableQR,
    downloadAllQRCodes,
    
    // Refetch
    refetch
  };
};

export default useTables;