export interface CrearSolicitudRepuestoRequest {
  idTareaOt: number;
  idUsuario: number;
  idAdjunto?: number;
  detalle: string;
}


export interface SolicitudRepuestoDetalleResponse {
  codigo: string;
  detalle: string;
  nombreCompleto: string;
  codigoTarea: string;
  fechaRegistro: Date;
  fechaAprobacion: Date | null;
  idAdjunto: number;
  aprobado: boolean | null;
}