export interface ObservacionT {
    idObservacion: number;
    detalle: string;
}
export interface CreateObservacionRequest {
  IdTareaOt: number;
  IdUsuario: number;
  Detalle: string;
  IdAdjunto?: number | null;
}