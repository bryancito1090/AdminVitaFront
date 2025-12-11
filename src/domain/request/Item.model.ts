export interface CreateUpdateItemRequest {
  idItem?: number; 
  idTipoItem: number;
  idMagnitud?: number | null;  
  nombre: string;
  descripcion: string;
  valorUnitario: number;
  stockMin: number;
  stockIdeal: number;
}