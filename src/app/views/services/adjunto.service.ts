import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../auth/service/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Adjunto } from '../../../domain/response/Adjunto.model';

@Injectable({
  providedIn: 'root'
})
export class AdjuntoService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.adjuntos}`;
  
  // URL base para las imágenes - preferiblemente desde environment
  private baseUrl = environment.domain || 'http://localhost:7267';

  constructor(private auth: AuthService, private http: HttpClient) { }

  // Obtener adjunto por ID
  getAdjuntoById(id: number): Observable<Adjunto> {
    return this.http.get<Adjunto>(`${this.apiUrl}/GetById/${id}`);
  }

  // Obtener adjuntos por vehículo
  getAdjuntosByVehiculo(idVehiculo: number): Observable<Adjunto[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<Adjunto[]>(`${this.apiUrl}/GetByIdVehiculo/${idVehiculo}`, { headers });
  }
  
   getAdjuntosByVehiculoMec(idVehiculo: number): Observable<Adjunto[]> {
    const headers = this.auth.getMecanicoAuthHeaders();
    return this.http.get<Adjunto[]>(`${this.apiUrl}/GetByIdVehiculo/${idVehiculo}`, { headers });
  }
  /**
   * Construye la URL completa para acceder a la imagen a partir de la ruta relativa
   * @param ruta La ruta relativa recibida del backend (ej: /Uploads/imagen.jpg)
   * @returns La URL completa para acceder a la imagen
   */
  getArchivoUrl(ruta: string): string {
    if (!ruta) {
      return '';
    }
    
    // Si la ruta ya es una URL completa, devolverla
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
      return ruta;
    }
    
    // Eliminar cualquier referencia a rutas del sistema (c:/, etc.)
    if (ruta.includes('://') || ruta.includes(':\\')) {
      // Extraer la parte de la ruta después de "Uploads"
      const uploadMatch = ruta.match(/Uploads[\/\\](.+)$/i); // Added case-insensitive flag
      if (uploadMatch && uploadMatch[1]) {
        // Usar solo la parte que incluye el nombre del archivo con la ruta Uploads
        return `${this.baseUrl}/api/archivos/Uploads/${uploadMatch[1]}`;
      }
      
      // Si no encuentra Uploads, extraer solo el nombre del archivo
      const matches = ruta.match(/[\/\\]?([^\/\\]+\.[a-zA-Z0-9]+)$/);
      if (matches && matches[1]) {
        return `${this.baseUrl}/api/archivos/Uploads/${matches[1]}`;
      }
    }
    
    // Si la ruta ya parece ser relativa (como "/Uploads/archivo.jpg")
    if (ruta.startsWith('/')) {
      return `${this.baseUrl}/api/archivos${ruta}`;
    }
    
    // For debugging
    console.log(`Generated URL for file path "${ruta}": ${this.baseUrl}/api/archivos/Uploads/${ruta}`);
    
    // Para otros casos, asumimos que es solo el nombre del archivo o una ruta relativa
    return `${this.baseUrl}/api/archivos/Uploads/${ruta}`;
  }
  // Mantener el método original getImagenUrl para compatibilidad
  getImagenUrl(ruta: string): string {
    return this.getArchivoUrl(ruta);
  }
  eliminarAdjuntoCompleto(idAdjunto: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/DeleteAdjuntoAndUpdateCompra/${idAdjunto}`);
  }
  createAdjunto(file: File, idVehiculo: number): Observable<any> {
    const formData = new FormData();
    formData.append('File', file, file.name);
    formData.append('IdVehiculo', idVehiculo.toString());

    // No es necesario establecer el Content-Type en los headers cuando se usa FormData
    // Angular/HttpClient lo establecerá automáticamente como multipart/form-data con el boundary correcto
    return this.http.post<any>(`${this.apiUrl}/CreateAdjunto`, formData);
  }
}