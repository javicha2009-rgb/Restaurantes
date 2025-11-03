import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export interface QROptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface TableQRData {
  barId: string;
  tableId: string;
  tableName: string;
  tableNumber: string;
  qrValue: string;
  createdAt: Date;
}

export class QRUtils {
  private static readonly DEFAULT_OPTIONS: QROptions = {
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1a1a2e',
      light: '#ffffff'
    }
  };

  /**
   * Genera un valor único para el código QR
   */
  static generateQRValue(): string {
    return uuidv4();
  }

  /**
   * Genera la URL del menú para una mesa específica
   */
  static generateMenuUrl(barId: string, qrValue: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/bar/${barId}?qr=${qrValue}`;
  }

  /**
   * Genera un código QR como Data URL
   */
  static async generateQRDataURL(
    url: string, 
    options: QROptions = {}
  ): Promise<string> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      return await QRCode.toDataURL(url, mergedOptions);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Genera un código QR como SVG string
   */
  static async generateQRSVG(
    url: string, 
    options: QROptions = {}
  ): Promise<string> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      return await QRCode.toString(url, { 
        ...mergedOptions, 
        type: 'svg' 
      });
    } catch (error) {
      console.error('Error generating QR SVG:', error);
      throw new Error('Failed to generate QR SVG');
    }
  }

  /**
   * Valida si una URL es válida para generar QR
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Genera datos completos para una mesa con QR
   */
  static generateTableQRData(
    barId: string,
    tableId: string,
    tableName: string,
    tableNumber: string
  ): TableQRData {
    return {
      barId,
      tableId,
      tableName,
      tableNumber,
      qrValue: this.generateQRValue(),
      createdAt: new Date()
    };
  }

  /**
   * Descarga un código QR como archivo PNG
   */
  static downloadQRCode(
    dataUrl: string, 
    filename: string = 'qr-code.png'
  ): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Copia una URL al portapapeles
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Genera múltiples códigos QR para varias mesas
   */
  static async generateBulkQRCodes(
    barId: string,
    tables: Array<{ id: string; name: string; number: string }>,
    options: QROptions = {}
  ): Promise<Array<{ tableData: TableQRData; qrDataUrl: string }>> {
    const results = [];

    for (const table of tables) {
      const tableData = this.generateTableQRData(
        barId,
        table.id,
        table.name,
        table.number
      );

      const menuUrl = this.generateMenuUrl(barId, tableData.qrValue);
      const qrDataUrl = await this.generateQRDataURL(menuUrl, options);

      results.push({ tableData, qrDataUrl });
    }

    return results;
  }

  /**
   * Extrae información del QR value
   */
  static parseQRValue(qrValue: string): { isValid: boolean; uuid?: string } {
    // Validar que sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(qrValue)) {
      return { isValid: true, uuid: qrValue };
    }

    return { isValid: false };
  }
}

export default QRUtils;