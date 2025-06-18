import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/service/auth.service';
import { SolicitudDetalleTableExpandOT } from '../../../domain/response/Solicitud.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiURL = `${environment.domain}${environment.apiEndpoint}${environment.solicitudRepuesto}`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  getSolicitudRepuestoTablaExpandOT(code: string):Observable<SolicitudDetalleTableExpandOT[]>{
    const headers = this.auth.getAuthHeaders();
    const params = new HttpParams().set('codigo', code);
    return this.http.get<SolicitudDetalleTableExpandOT[]>(`${this.apiURL}/ObtenerSolicitudes`, { params, headers });
  }
  actualizarAprobacionSolicitud(codigo: string, aprobado: boolean): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    const body = {
      codigo: codigo,
      aprobado: aprobado
    };
    return this.http.put(`${this.apiURL}/ActualizarAprobacion`, body, { headers });
  }
}
