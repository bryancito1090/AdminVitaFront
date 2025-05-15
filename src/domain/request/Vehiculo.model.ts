export interface AddVehicleInstitucional {
    idTipoVehiculo: number;  
    marca: string;
    modelo: string;
    version: string;
    placa: string;
    anio: number;  // integer($int32)
    color: string;
    numeroChasis: string;
    numeroVehiculo: string;
    estado: number;  // integer($int32)
    ultimoAnioMatriculacion: number;  // integer($int32)
    ultimoAnioRTV: number;  // integer($int32)
    idLicencias: number[];  // array de números
    idCliente: number;  // integer($int32)
    archivos: any[];  // array (puedes definir el tipo si son archivos específicos)
}

export interface UpdateOptionsVehicle {
    idVehiculo: number;
    estado: number;
    ultimoAnioRTV: number;
    ultimoAnioMatriculacion: number;
    idPropietario?: number;
}
  
export interface AddVehicleNoInstitucional {
  idTipoVehiculo: number;
  marca: string;
  modelo: string;
  version?: string | null;       // Opcional
  placa: string;
  anio: number;
  color: string;
  numeroChasis?: string | null;  // Opcional
  numeroVehiculo?: string | null; // Opcional
  estado?: number | null;        // Opcional, con valor predeterminado 1  
  ultimoAnioMatriculacion?: number | null; // Opcional
  ultimoAnioRTV?: number | null; // Opcional
  idCliente: number;
  idLicencias: [];             // Null para no institucionales
  archivos: [];                // Null para no institucionales
}