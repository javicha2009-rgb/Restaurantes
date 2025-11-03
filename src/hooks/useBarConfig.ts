import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BarConfig {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_active: boolean;
  table_count?: number;
}

interface UpdateBarConfigData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  cover_image_url?: string;
  table_count?: number;
}

export const useBarConfig = (barId: string) => {
  const [barConfig, setBarConfig] = useState<BarConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBarConfig = async () => {
    if (!barId) return;
    
    try {
      setIsLoading(true);
      
      // Obtener datos del bar
      const { data: barData, error: barError } = await supabase
        .from('bars')
        .select('*')
        .eq('id', barId)
        .single();

      if (barError) throw barError;

      // Contar las mesas del bar
      const { count: tableCount, error: tableError } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })
        .eq('bar_id', barId)
        .eq('is_active', true);

      if (tableError) throw tableError;

      setBarConfig({
        ...barData,
        table_count: tableCount || 0
      });
    } catch (error) {
      console.error('Error fetching bar config:', error);
      toast.error('Error al cargar la configuración del bar');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBarConfig = async (updateData: UpdateBarConfigData) => {
    if (!barId) return false;

    try {
      setIsUpdating(true);

      // Separar table_count de los otros datos
      const { table_count, ...barUpdateData } = updateData;

      // Actualizar datos del bar (excluyendo table_count)
      if (Object.keys(barUpdateData).length > 0) {
        const { error: barError } = await supabase
          .from('bars')
          .update(barUpdateData)
          .eq('id', barId);

        if (barError) throw barError;
      }

      // Si se especifica table_count, gestionar las mesas
      if (table_count !== undefined && barConfig) {
        const currentTableCount = barConfig.table_count || 0;
        
        if (table_count > currentTableCount) {
          // Crear nuevas mesas
          const newTables = [];
          for (let i = currentTableCount + 1; i <= table_count; i++) {
            newTables.push({
              bar_id: barId,
              table_name: `Mesa ${i}`,
              table_number: i,
              is_active: true,
              qr_code_value: `${barId}-mesa-${i}`
            });
          }
          
          if (newTables.length > 0) {
            const { error: insertError } = await supabase
              .from('tables')
              .insert(newTables);

            if (insertError) throw insertError;
          }
        } else if (table_count < currentTableCount) {
          // Desactivar mesas sobrantes (no eliminar para mantener historial)
          const { error: deactivateError } = await supabase
            .from('tables')
            .update({ is_active: false })
            .eq('bar_id', barId)
            .gt('table_number', table_count);

          if (deactivateError) throw deactivateError;
        }
      }

      toast.success('Configuración actualizada correctamente');
      await fetchBarConfig(); // Recargar datos
      return true;
    } catch (error) {
      console.error('Error updating bar config:', error);
      toast.error('Error al actualizar la configuración');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchBarConfig();
  }, [barId]);

  return {
    barConfig,
    isLoading,
    isUpdating,
    updateBarConfig,
    refetch: fetchBarConfig
  };
};