import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/service/auth.service';
import { Observable } from 'rxjs';
import { Item } from '../../../domain/response/Item.model';
import { CreateUpdateDetalleCompraRequest, DetalleCompra, DetalleCompraResponse } from '../../../domain/response/DetalleCompra.model';

@Injectable({
  providedIn: 'root'
})
export class DetalleCompraService {
  
  private apiURL = `${environment.domain}${environment.apiEndpoint}${environment.detalleCompra}`;
  
  constructor(private http: HttpClient, private auth: AuthService) { }

  createUpdateDetalleCompra(detallesCompra: DetalleCompra[]): Observable<DetalleCompraResponse> {
    const headers = this.auth.getAuthHeaders();
    const request: CreateUpdateDetalleCompraRequest = {
      detallesCompra: detallesCompra
    };
    return this.http.post<DetalleCompraResponse>(
      `${this.apiURL}/CreateUpdateDetalleCompra`, 
      request, 
      { headers }
    );
  }
  eliminarDetalleCompra(id: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.delete<any>(
      `${this.apiURL}/EliminarDetalleCompra/${id}`, 
      { headers }
    );
  }
}
