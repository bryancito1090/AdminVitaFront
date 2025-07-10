import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ObservacionesOTDetalle, TareaDetalle, TrabajoExternoDetalle } from '../../../domain/response/Tarea.model';
import { CreateObservacionRequest } from '../../../domain/response/Observacion.model';
import { AuthService } from '../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private apiURL = `${environment.domain}${environment.apiEndpoint}${environment.tarea}`;

  constructor(private http: HttpClient, private auth: AuthService) { }

getTareasByOT(code: string): Observable<TareaDetalle[]> {
  const headers = this.auth.getAuthHeaders();
  const params = new HttpParams().set('Codigo', code);
  return this.http.get<TareaDetalle[]>(`${this.apiURL}/GetTareaDetalle`, { params, headers });
}
  getTareasByOTMec(code: string): Observable<TareaDetalle[]> {
  const headers = this.auth.getMecanicoAuthHeaders();
  const params = new HttpParams().set('Codigo', code);
  return this.http.get<TareaDetalle[]>(`${this.apiURL}/GetTareaDetalle`, { params, headers });
}

  getTareaExternaByOT(code: string): Observable<TrabajoExternoDetalle[]> {
    const headers = this.auth.getAuthHeaders();
    const params = new HttpParams().set('codigo', code);
    return this.http.get<TrabajoExternoDetalle[]>(`${this.apiURL}/GetTareaExterna`, { headers, params });
  }
  getObservacionesTarea(code:string): Observable<ObservacionesOTDetalle[]>{
    const headers = this.auth.getAuthHeaders();
    return this.http.get<ObservacionesOTDetalle[]>(`${environment.domain}${environment.apiEndpoint}/Observacion/ObtenerObservaciones/${code}`, {headers})
  }
  createTarea(data: any, token: any): Observable<any> {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(`${this.apiURL}/CreateTarea`, data, { headers });
  }
  
  actualizarTarea(data: { idTareaOt: number; estado?: number | null; duracion?: number | null }): Observable<any> {
    const headers = this.auth.getMecanicoAuthHeaders();
    return this.http.put(`${this.apiURL}/actualizar-tarea`, data, { headers });
  }
   crearObservacion(data: CreateObservacionRequest): Observable<{ success: boolean }> {
    const headers = this.auth.getMecanicoAuthHeaders();
    return this.http.post<{ success: boolean }>(`${environment.domain}${environment.apiEndpoint}/Observacion/CrearObservacion`, data, { headers });
  }
  eliminarMecanicoTarea(idTareaOt: number, idMecanico: number): Observable<any> {
    const headers = this.auth.getMecanicoAuthHeaders();
    const body = { idTareaOt, idMecanico };
    return this.http.delete(`${this.apiURL}/eliminar-mecanico-tarea`, {
      headers,
      body
    });
  }
  agregarMecanicosTarea(idTarea: number, mecanicos: { idMecanico: any, duracionEstimada: any }[]): Observable<any> {
    const headers = this.auth.getMecanicoAuthHeaders();
    const body = {
      idTarea,
      mecanicos
    };
    return this.http.post(`${this.apiURL}/AgregarMecanicosATarea`, body, { headers });
  }
  agregarRepuestosTarea(idTarea: any, idUsuario: any, repuestos: { idItem: any, cantidad: any }[]): Observable<any> {
    const headers = this.auth.getMecanicoAuthHeaders();
    return this.http.post(`${this.apiURL}/AgregarRepuestosATarea`, {
      idTarea,
      idUsuario,
      repuestos
    }, { headers });
  }
  eliminarRepuestoTarea(idTareaOt: number, idRepuesto: number): Observable<any> {
    const headers = this.auth.getMecanicoAuthHeaders();
    const body = { idTareaOt, idRepuesto };
    return this.http.delete(`${this.apiURL}/eliminar-repuesto-tarea`, { headers, body });
  }
}