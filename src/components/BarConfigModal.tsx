import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Settings, Store, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { useBarConfig } from '@/hooks/useBarConfig';

interface BarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  barId: string;
}

export const BarConfigModal: React.FC<BarConfigModalProps> = ({
  isOpen,
  onClose,
  barId
}) => {
  const { barConfig, isLoading, isUpdating, updateBarConfig } = useBarConfig(barId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    table_count: 0
  });

  // Actualizar formulario cuando se carga la configuración del bar
  useEffect(() => {
    if (barConfig) {
      setFormData({
        name: barConfig.name || '',
        description: barConfig.description || '',
        address: barConfig.address || '',
        phone: barConfig.phone || '',
        email: barConfig.email || '',
        table_count: barConfig.table_count || 0
      });
    }
  }, [barConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateBarConfig(formData);
    if (success) {
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Bar
          </DialogTitle>
          <DialogDescription>
            Configura los datos de tu bar y el número de mesas disponibles.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando configuración...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica del bar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Store className="h-4 w-4" />
                Información del Bar
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Bar *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Bar Central"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descripción de tu bar..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="h-4 w-4" />
                Información de Contacto
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contacto@bar.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+34 123 456 789"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Calle Principal 123, Ciudad"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Configuración de mesas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Hash className="h-4 w-4" />
                Configuración de Mesas
              </div>
              
              <div>
                <Label htmlFor="table_count">Número de Mesas</Label>
                <Input
                  id="table_count"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.table_count}
                  onChange={(e) => handleInputChange('table_count', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {barConfig?.table_count !== undefined && (
                    <>Actualmente tienes {barConfig.table_count} mesa{barConfig.table_count !== 1 ? 's' : ''} configurada{barConfig.table_count !== 1 ? 's' : ''}.</>
                  )}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};