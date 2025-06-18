import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/service/auth.service';
import { ManoDeObra, RegistrarMecanico, SupervisorInputSelect } from '../../../domain/response/Mecanico.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MecanicoService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.mecanico}`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  getSupervisores(): Observable<SupervisorInputSelect[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<SupervisorInputSelect[]>(`${this.apiUrl}/GetSupervisores`, { headers });
  }
getSupervisoresMec(): Observable<SupervisorInputSelect[]> {
    const headers = this.auth.getMecanicoAuthHeaders();
    return this.http.get<SupervisorInputSelect[]>(`${this.apiUrl}/GetSupervisores`, { headers });
  }
  getManoObraOT(code: string): Observable<ManoDeObra[]>{
    const headers = this.auth.getAuthHeaders();
    return this.http.get<ManoDeObra[]>(`${environment.domain}${environment.apiEndpoint}${environment.ordenesTrabajo}/ObtenerManoDeObra/${code}`,{ headers })
  }
  getMecanicos(): Observable<any[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/GetMecanicos`, { headers });
  }
registrarMecanico(Mecanico: RegistrarMecanico): Observable<string> {
    const headers = this.auth.getAuthHeaders();
    // Validaciones básicas antes de enviar
    if (!Mecanico.documento) {
        throw new Error('El documento es requerido');
    }
    if (!Mecanico.pin) {
        throw new Error('El PIN es requerido');
    }
    if (!Mecanico.especialidad) {
        throw new Error('La especialidad es requerida');
    }
    
    // Procesar fecha de nacimiento correctamente
    let fechaNacimientoFormatted = null;
    if (Mecanico.fechaNacimiento) {
        if (Mecanico.fechaNacimiento instanceof Date) {
            fechaNacimientoFormatted = Mecanico.fechaNacimiento.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (typeof Mecanico.fechaNacimiento === 'string') {
            // Si es string, intentar convertir
            const fecha = new Date(Mecanico.fechaNacimiento);
            if (!isNaN(fecha.getTime())) {
                fechaNacimientoFormatted = fecha.toISOString().split('T')[0];
            }
        }
    }
    
    // El backend NO espera wrapper "request", envía directamente los datos
    const requestBody = {
        nombre: Mecanico.nombre?.trim() || '',
        tipoPersona: Mecanico.tipoPersona || '',
        tipoDocumento: Mecanico.tipoDocumento || '',
        documento: Mecanico.documento?.trim() || '',
        email: Mecanico.email?.trim() || '',
        celular: Mecanico.celular?.trim() || '',
        telefono: Mecanico.telefono?.trim() || '',
        direccion: Mecanico.direccion?.trim() || '',
        
        // Datos de PersonaNatural (solo si es persona natural)
        apellidos: Mecanico.tipoPersona === 'N' ? (Mecanico.apellidos?.trim() || '') : '',
        fechaNacimiento: Mecanico.tipoPersona === 'N' ? fechaNacimientoFormatted : null,
        genero: Mecanico.tipoPersona === 'N' ? (Mecanico.genero || '') : '',
        
        // Datos de PersonaEmpresa (solo si es empresa)
        razonSocial: Mecanico.tipoPersona === 'E' ? (Mecanico.razonSocial?.trim() || '') : '',
        idRepresentanteLegal: Mecanico.tipoPersona === 'E' ? (Mecanico.idRepresentanteLegal || null) : null,
        representanteLegalNombre: Mecanico.tipoPersona === 'E' ? (Mecanico.representanteLegalNombre?.trim() || '') : '',
        obligadaContabilidad: Mecanico.tipoPersona === 'E' ? (Mecanico.obligadaContabilidad || false) : false,
        
        // Datos específicos de mecánico
        pin: Mecanico.pin?.trim() || '',
        especialidad: Mecanico.especialidad?.trim() || '',
        esSupervisor: Boolean(Mecanico.esSupervisor),
        // No enviar esPasante ya que el backend lo calcula automáticamente
    };

    return this.http.post(`${this.apiUrl}/RegistrarMecanico`, requestBody, { 
        headers,
        responseType: 'text' 
    });
}
restaurarMecanico(documento: string): Observable<string> {
    const headers = this.auth.getAuthHeaders();
    const requestBody = { documento: documento };
    return this.http.put(`${this.apiUrl}/RestaurarMecanico`, requestBody, { 
        headers,
        responseType: 'text' 
    });
  }
}
