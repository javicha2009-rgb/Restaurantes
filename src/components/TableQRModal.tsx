import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, QrCode, Download, Printer, Users } from 'lucide-react';
import { toast } from 'sonner';

interface TableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    id: string;
    table_name: string;
    table_number: number;
    bar_id: string;
  } | null;
  barName?: string;
}

export const TableQRModal: React.FC<TableQRModalProps> = ({
  isOpen,
  onClose,
  table,
  barName = 'Bar'
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    if (!table) return;

    try {
      setIsGenerating(true);
      
      // URL del menú para esta mesa específica
      const menuUrl = `${window.location.origin}/menu/${table.bar_id}?table=${table.table_number}`;
      
      // Generar QR code
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Error al generar el código QR');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl || !table) return;

    const link = document.createElement('a');
    link.download = `mesa-${table.table_number}-qr.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Código QR descargado correctamente');
  };

  const printQR = () => {
    if (!qrDataUrl || !table) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${table.table_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #000;
              padding: 30px;
              border-radius: 10px;
              background: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .bar-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .table-name {
              font-size: 20px;
              margin-bottom: 20px;
              color: #666;
            }
            .qr-image {
              margin: 20px 0;
            }
            .instructions {
              font-size: 14px;
              color: #888;
              margin-top: 15px;
              max-width: 300px;
            }
            @media print {
              body { margin: 0; }
              .qr-container { 
                border: 2px solid #000; 
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="bar-name">${barName}</div>
            <div class="table-name">${table.table_name}</div>
            <div class="qr-image">
              <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>
            <div class="instructions">
              Escanea este código QR con tu móvil para ver el menú y hacer tu pedido
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Esperar a que la imagen se cargue antes de imprimir
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    toast.success('Enviando a impresora...');
  };

  useEffect(() => {
    if (isOpen && table) {
      generateQR();
    } else {
      setQrDataUrl('');
    }
  }, [isOpen, table]);

  if (!table) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Código QR - {table.table_name}
          </DialogTitle>
          <DialogDescription>
            Código QR para que los clientes accedan al menú desde esta mesa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{table.table_name}</h3>
                  <p className="text-sm text-muted-foreground">Mesa #{table.table_number}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {barName}
                </Badge>
              </div>

              {isGenerating ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Generando código QR...</span>
                </div>
              ) : qrDataUrl ? (
                <div className="text-center">
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Los clientes pueden escanear este código para acceder al menú
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Error al generar el código QR</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {qrDataUrl && (
            <>
              <Button variant="outline" onClick={downloadQR}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button onClick={printQR}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};