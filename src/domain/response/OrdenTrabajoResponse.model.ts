export interface ordenTrabajoListResponse {
    ordenes: ordenTrabajoList [];
}
export interface ordenTrabajoList {
    codigo: string;
    detalle: string;
    estado: number;
    fechaProgramada: string;
    nombreCli: string;
    nombreSup: string;
    placa: string;
    prioridad: number;
}
export interface OrdenTrabajo {
    codigo: string;
    detalle: string;
    prioridad: number;
    estado: number;
    fechaCreada: Date;
    fechaProgramada: Date;
    fechaFinalizacion: Date;
    observacion: string;
    codigoVehiculo: string;
    kilometraje: number;
    numeroVehiculo: number;
    anio: Date;
    estadoVehiculo: string;
    propietario: string;
    placa: string;
    nombreCliente: string;
    celular: string;
    correo: string;
    direccion: string;
    supervisor: string;
    idSupervisor: number;
}
export interface ExpandInfoOT {
    totalTareas: number;
    totalRepuestos: number;
    totalMecanicos: number;
    totalTrabajosExternos: number;
    totalObservaciones: number;
    totalSolicitudes: number;
}
