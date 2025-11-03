import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Check, QrCode as QrCodeIcon } from "lucide-react";
import { toast } from "sonner";

interface QRGeneratorProps {
  barId: string;
  tableName: string;
  tableNumber: string;
  qrValue: string;
}

const QRGenerator = ({ barId, tableName, tableNumber, qrValue }: QRGeneratorProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const menuUrl = `${window.location.origin}/bar/${barId}?qr=${qrValue}`;

  useEffect(() => {
    generateQR();
  }, [qrValue]);

  const generateQR = async () => {
    try {
      setLoading(true);
      const qrOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M' as const
      };

      const dataUrl = await QRCode.toDataURL(menuUrl, qrOptions);
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Error al generar el código QR');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      toast.success('URL copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar la URL');
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `QR_${tableName}_${tableNumber}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Código QR descargado');
  };

  return (
    <Card className="card-glass">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-button">
          <QrCodeIcon className="h-8 w-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl">
          {tableName} - Mesa {tableNumber}
        </CardTitle>
        <Badge variant="secondary" className="mx-auto">
          Código QR Único
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative">
            {loading ? (
              <div className="flex h-[300px] w-[300px] items-center justify-center rounded-2xl bg-muted animate-pulse">
                <QrCodeIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-4 shadow-card">
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${tableName} - Mesa ${tableNumber}`}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* URL Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            URL del menú:
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 rounded-lg bg-muted p-3 text-sm font-mono break-all">
              {menuUrl}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={downloadQR}
            disabled={loading || !qrDataUrl}
            className="flex-1 btn-modern bg-gradient-primary hover:shadow-glow"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar QR
          </Button>
          <Button 
            variant="outline"
            onClick={copyToClipboard}
            className="flex-1 btn-modern border-2"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar URL
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <h4 className="font-medium mb-2">Instrucciones de uso:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Imprime este código QR y colócalo en la mesa</li>
            <li>• Los clientes escanean el código para acceder al menú</li>
            <li>• Los pedidos llegan directamente a tu dashboard</li>
            <li>• Cada mesa tiene su código único para identificar pedidos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRGenerator;