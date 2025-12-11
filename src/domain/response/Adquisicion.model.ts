export interface CompraResponse {
    idCompra: number;
    numeroFactura: string;
    fechaRegistro: string;
    subtotal: number;
    iva: number;
    total: number;
    documento: string;
    nombre: string;
    apellidos?: string | null;
    razonSocial?: string | null; // Opcional, puede ser null
    cerrado: boolean;
  }
  
  export interface DetalleCompraResponse {
    idDetalleCompra: number;
    nombre: string;
    detalle: string;
    valorUnitario: number;
    nombreMagnitud?: string | null;
    cantidad: number;
    subtotal: number;
  }
  