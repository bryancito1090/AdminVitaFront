export interface CreateTareaCommand {
  codigoOrdenTrabajo: string;
  detalle: string;
  idUsuario: number;
  estado: number;
  esManual: boolean;
  requiereRepuesto: boolean;
  requiereServicioExterno: boolean;
  requiereAutorizacion: boolean;
  tipoMantenimiento: boolean;
  duracion: number;
  repuestos: RepuestoTarea[];
  mecanicos: MecanicoTarea[];
}

export interface RepuestoTarea {
  idItem: number;
  cantidad: number;
}

export interface MecanicoTarea {
  idMecanico: number;
  duracionEstimada: number;
}

export interface CreateTareaResponse {
  idTareaOt: number;
  codigo: string;
  detalle: string;
  duracion: number;
  estado: number;
  mecanicos: MecanicoTareaResponse[];
  requiereServicioExterno: boolean;
  requiereRepuesto: boolean;
  idObservacion: number;
}

export interface MecanicoTareaResponse {
  idMecanico: number;
  nombre: string;
}
