import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../auth/service/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrarProveedor } from '../../../domain/response/Proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.proveedor}`;
  
  constructor(private http: HttpClient, private auth: AuthService) { }
  
  getProveedores(): Observable<any[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/GetProveedores`, { headers });
  }
    registrarProveedor(Proveedor: RegistrarProveedor): Observable<string> {
    const headers = this.auth.getAuthHeaders();
    
    // Validaciones básicas antes de enviar
    if (!Proveedor.documento) {
        throw new Error('El documento es requerido');
    }
    
    // Procesar fecha de nacimiento correctamente
    let fechaNacimientoFormatted = null;
    if (Proveedor.fechaNacimiento) {
        if (Proveedor.fechaNacimiento instanceof Date) {
            fechaNacimientoFormatted = Proveedor.fechaNacimiento.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (typeof Proveedor.fechaNacimiento === 'string') {
            // Si es string, intentar convertir
            const fecha = new Date(Proveedor.fechaNacimiento);
            if (!isNaN(fecha.getTime())) {
                fechaNacimientoFormatted = fecha.toISOString().split('T')[0];
            }
        }
    }
    
    // El backend NO espera wrapper "request", envía directamente los datos
    const requestBody = {
        nombre: Proveedor.nombre?.trim() || '',
        tipoPersona: Proveedor.tipoPersona || '',
        tipoDocumento: Proveedor.tipoDocumento || '',
        documento: Proveedor.documento?.trim() || '',
        email: Proveedor.email?.trim() || '',
        celular: Proveedor.celular?.trim() || '',
        telefono: Proveedor.telefono?.trim() || '',
        direccion: Proveedor.direccion?.trim() || '',
        
        // Datos de PersonaNatural (solo si es persona natural)
        apellidos: Proveedor.tipoPersona === 'N' ? (Proveedor.apellidos?.trim() || '') : '',
        fechaNacimiento: Proveedor.tipoPersona === 'N' ? fechaNacimientoFormatted : null,
        genero: Proveedor.tipoPersona === 'N' ? (Proveedor.genero || '') : '',
        
        // Datos de PersonaEmpresa (solo si es empresa)
        razonSocial: Proveedor.tipoPersona === 'E' ? (Proveedor.razonSocial?.trim() || '') : '',
        idRepresentanteLegal: Proveedor.tipoPersona === 'E' ? (Proveedor.idRepresentanteLegal || null) : null,
        representanteLegalNombre: Proveedor.tipoPersona === 'E' ? (Proveedor.representanteLegalNombre?.trim() || '') : '',
        obligadaContabilidad: Proveedor.tipoPersona === 'E' ? (Proveedor.obligadaContabilidad || false) : false
    };

    console.log('📤 Request body para proveedor:', requestBody);

    return this.http.post(`${this.apiUrl}/RegistrarProveedor`, requestBody, { 
        headers,
        responseType: 'text' 
    });
  }
    restaurarProveedor(documento: string): Observable<string> {
    const headers = this.auth.getAuthHeaders();
    const requestBody = { documento: documento };
    return this.http.put(`${this.apiUrl}/RestaurarProveedor`, requestBody, { 
        headers,
        responseType: 'text' 
    });
  }
}