import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../auth/service/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.persona}`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  actualizarPersonaCompleta(persona: any): Observable<any> {
    const headers = this.auth.getAuthHeaders();

    // Format the date properly
    let fechaNacimientoFormatted = null;
    if (persona.fechaNacimiento) {
        if (typeof persona.fechaNacimiento === 'string') {
            // If it's already in YYYY-MM-DD format, use it directly
            if (/^\d{4}-\d{2}-\d{2}$/.test(persona.fechaNacimiento)) {
                fechaNacimientoFormatted = persona.fechaNacimiento;
            } else {
                // Try to parse other formats
                const fecha = new Date(persona.fechaNacimiento);
                if (!isNaN(fecha.getTime())) {
                    fechaNacimientoFormatted = fecha.toISOString().split('T')[0];
                }
            }
        }
    }

    const requestBody = {
        documento: persona.documento.trim(),
        nombre: persona.nombre.trim(),
        email: persona.email.trim(),
        celular: persona.celular.trim(),
        telefono: persona.telefono ? persona.telefono.trim() : null,
        direccion: persona.direccion.trim(),
        // Natural person data
        apellidos: persona.tipoPersona === 'N' ? (persona.apellidos ? persona.apellidos.trim() : '') : '',
        fechaNacimiento: persona.tipoPersona === 'N' ? fechaNacimientoFormatted : null,
        genero: persona.tipoPersona === 'N' ? (persona.genero || '') : '',
        // Company data
        razonSocial: persona.tipoPersona === 'E' ? (persona.razonSocial ? persona.razonSocial.trim() : '') : '',
        representanteLegal: persona.tipoPersona === 'E' ? (persona.representanteLegal ? persona.representanteLegal.trim() : '') : '',
        obligadaContabilidad: persona.tipoPersona === 'E' ? persona.obligadaContabilidad : false,
        // Mechanic data
        pin: persona.pin ? persona.pin.trim() : null,
        esSupervisor: persona.esSupervisor,
        especialidad: persona.especialidad ? persona.especialidad.trim() : null
    };

    return this.http.put(`${this.apiUrl}/ActualizarPersonaCompleta`, requestBody, { headers });
}
}