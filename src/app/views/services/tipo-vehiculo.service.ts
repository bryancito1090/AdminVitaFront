import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoVehiculoService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.tipoVehiculo}`;

  constructor(private http: HttpClient) { }

  getOrdenesTrabajoListado(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}`);
  }
  getTiposVehiculo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
}
}
