export interface SupervisorInputSelect {
    idMecanico: number;
    nombre: string;
}

export interface GetMecanicoT {
    idMecanico: number;
    nombreCompleto: string;
}

export interface ManoDeObra {
    codigo: string;
    nombreCompleto: string;
    esSupervisor: boolean;
    codigoTarea: string;
    especialidad: string;
    duracion: number;
}
    export interface RegistrarMecanico {
    nombre: string;
    tipoPersona: string; // "N" natural, "E" empresa, "EX" extranjero
    tipoDocumento: string; // "C" cédula, "R" RUC, "P" pasaporte
    documento: string;
    email: string;
    celular: string;
    telefono?: string;
    direccion: string;
    
    // Datos de PersonaNatural
    apellidos?: string;
    fechaNacimiento?: Date;
    genero?: string; // "M", "F"
    
    // Datos de PersonaEmpresa
    razonSocial?: string;
    idRepresentanteLegal?: number;
    representanteLegalNombre?: string;
    obligadaContabilidad?: boolean;
    
    // Datos de mecánico
    pin: string;
    especialidad: string;
    esSupervisor?: boolean;
    esPasante?: boolean;
    }