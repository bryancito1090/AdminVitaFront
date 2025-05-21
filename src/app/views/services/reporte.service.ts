import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.reporte}`;

  constructor(private http:HttpClient) { }
  
   getReporteOrdenes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Ordenes`);
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
    return this.http.get<any>(`${this.apiUrl}/Kardex`, { params });
  }
getTopItems(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/TopItems`);
  }
getUnidadTiempoByMecanico(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/UnidadTiempoByMecanico`);
  }
  getVehiculosMatriculados(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/VehiculosMatriculados`);
  }
}
