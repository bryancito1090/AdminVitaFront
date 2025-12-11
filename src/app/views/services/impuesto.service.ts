import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/service/auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ImpuestoService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.impuesto}`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  getImpuestos(): Observable<any[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/GetImpuestos`, { headers });
  }
  getPorcentajeImpuesto(id: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/GetPorcentajeById?IdImpuesto=${id}`, { headers });
  }
}