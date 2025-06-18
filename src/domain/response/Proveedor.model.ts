export interface RegistrarProveedor {
    nombre: string;
    tipoPersona: string;
    tipoDocumento: string;
    documento: string;
    email: string;
    celular: string;
    telefono?: string;
    direccion: string;
    
    // Campos para PersonaNatural
    apellidos?: string;
    fechaNacimiento?: Date | string | null;
    genero?: string;
    
    // Campos para PersonaEmpresa
    razonSocial?: string;
    idRepresentanteLegal?: number | null;
    representanteLegalNombre?: string;
    obligadaContabilidad?: boolean;
}