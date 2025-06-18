import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/service/auth.service';
import { environment } from '../../../environments/environment.development';
import { ExpandInfoOT, OrdenTrabajo, ordenTrabajoListResponse } from '../../../domain/response/OrdenTrabajoResponse.model';
import { ActualizarOrdenRequest, AgendarOrdenMecanicoRequest, AgendarOrdenTrabajo } from '../../../domain/request/OrdenTrabajoRequest.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenTrabajoService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.ordenesTrabajo}`;

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  getOrdenesTrabajoListado(): Observable<ordenTrabajoListResponse> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<ordenTrabajoListResponse>(`${this.apiUrl}/GetOrdenes`, { headers });
  }

 getOrdenTrabajoCodigo(code: string): Observable<any> {
   const headers = this.auth.getMecanicoAuthHeaders();
    return this.http.get(`${this.apiUrl}/${code}`, { headers });
 }

  updateOrdenTrabajo(data: ActualizarOrdenRequest): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/ActualizarOrden`, data, { headers });
  }

  createOrdenTrabajo(data: AgendarOrdenTrabajo): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/AgendarOrden`, data, { headers });
  }

  getResumen(code: string):Observable<ExpandInfoOT> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<ExpandInfoOT>(`${this.apiUrl}/ObtenerResumen/${code}`, { headers });
  }
  exportAllToExcel(): Observable<Blob> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/ExportToExcel`, { headers, responseType: 'blob' });
  }
  agendarOrdenMecanico(data: AgendarOrdenMecanicoRequest): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/AgendarOrdenMecanico`, data, { headers });
  }

}
