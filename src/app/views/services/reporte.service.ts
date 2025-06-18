import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/service/auth.service'; // Ajusta el path según tu estructura

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.reporte}`;

  constructor(private http:HttpClient, private auth: AuthService) { }
  
  getReporteOrdenes(): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/Ordenes`, { headers });
  }

  getReporteKardex(fechaInicio?: Date | string, fechaFin?: Date | string): Observable<any> {
    let params = new HttpParams();
    if (fechaInicio) {
      const fechaInicioStr = fechaInicio instanceof Date 
        ? fechaInicio.toISOString().split('T')[0] 
        : fechaInicio;
      params = params.set('fechaInicio', fechaInicioStr);
    }
    if (fechaFin) {
      const fechaFinStr = fechaFin instanceof Date 
        ? fechaFin.toISOString().split('T')[0] 
        : fechaFin;
      params = params.set('fechaFin', fechaFinStr);
    }
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/Kardex`, { params, headers });
  }

  getTopItems(): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/TopItems`, { headers });
  }

  getUnidadTiempoByMecanico(): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/UnidadTiempoByMecanico`, { headers });
  }

  getVehiculosMatriculados(): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/VehiculosMatriculados`, { headers });
  }
}