import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/service/auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrdenMecanicoService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.ordenMecanico}`;

  constructor(private http: HttpClient, private auth: AuthService) {
  }
// En ordenMecanico.service.ts
getOrdenesByMecanicos(idMecanicos?: number[]): Observable<any[] | any> {
    const headers = this.auth.getAuthHeaders();
    let params = new HttpParams();
    
    if (idMecanicos && idMecanicos.length > 0) {
      idMecanicos.forEach(id => {
        params = params.append('idMecanico', id.toString());
      });
    }
    
    return this.http.get<any[]>(
      `${this.apiUrl}/GetOrdenesByMecanicos`, 
      { headers, params }
    );
  }
  actualizarEstadoOrdenTrabajo(codigoOrden: string, nuevoEstado: number): Observable<any> {
    const headers = this.auth.getMecanicoAuthHeaders();
    const body = {
      CodigoOrden: codigoOrden,
      nuevoEstado: nuevoEstado
    };
    
    return this.http.put<any>(
      `${this.apiUrl}/actualizar-estado`, 
      body, 
      { headers }
    );
  }
}
