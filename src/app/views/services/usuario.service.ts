import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl: string = `${environment.domain}${environment.apiEndpoint}${environment.usuarios}`;

  constructor(private http: HttpClient ,private auth: AuthService) { }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetUsuarios`);
  }
  registrarUsuario(userData: any): Observable<string> {
    const headers = this.auth.getAuthHeaders();
    const requestBody = {
        nombre: userData.nombre,
        tipoPersona: userData.tipoPersona,
        tipoDocumento: userData.tipoDocumento,
        documento: userData.documento,
        email: userData.email,
        celular: userData.celular,
        telefono: userData.telefono || null,
        direccion: userData.direccion,
        apellidos: userData.apellidos || null,
        fechaNacimiento: userData.fechaNacimiento ? 
            (userData.fechaNacimiento instanceof Date 
                ? userData.fechaNacimiento.toISOString() 
                : userData.fechaNacimiento) 
            : null,
        genero: userData.genero || null,
        razonSocial: userData.razonSocial || null,
        idRepresentanteLegal: userData.idRepresentanteLegal || null,
        representanteLegalNombre: userData.representanteLegalNombre || null,
        obligadaContabilidad: userData.obligadaContabilidad !== undefined && userData.obligadaContabilidad !== null 
            ? userData.obligadaContabilidad 
            : null,
        contrasenia: userData.contrasenia
    };
    return this.http.post(`${this.apiUrl}/RegistrarUsuario`, requestBody, { 
        headers,
        responseType: 'text' 
    });
}
restaurarUsuario(documento: string): Observable<string> {
    const headers = this.auth.getAuthHeaders();
    const requestBody = { documento: documento };
    return this.http.put(`${this.apiUrl}/RestaurarUsuario`, requestBody, { 
        headers,
        responseType: 'text' 
    });
}
}
