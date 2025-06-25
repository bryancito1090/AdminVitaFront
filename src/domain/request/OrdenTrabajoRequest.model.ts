export interface AgendarOrdenTrabajo {
    codigoUsuario?: string;
    idCliente: number;
    idVehiculo: number;
    idMecanico: number;
    detalle: string;
    prioridad: number;
    estado: number;
    fechaProgramada: string;
    observacion: string;
}

export interface ActualizarOrdenRequest {
    codigo: string;
    estado: number;
    prioridad?: number;
    idMecanico?: number;
    fechaProgramada: Date;
    observacion: string;
}
export interface AgendarOrdenMecanicoRequest {
    idUsuario: number;
    idCliente: number;
    idVehiculo: number;
    idMecanico: number;
    detalle: string;
    prioridad: number;
    estado: number;
    kilometraje: number;
    observacion: string;
    fechaProgramada: string;
    fechaCreacion: string;
  }