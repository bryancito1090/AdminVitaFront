import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Cliente } from '../../../domain/request/Cliente.model';
import { Observable } from 'rxjs';
import { toFormData } from '../shared/util/form-data.util';
import { AuthService } from '../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.cliente}`

  constructor(private http: HttpClient, private auth: AuthService) { }

  registrarCliente(cliente: Cliente): Observable<any> {
  const headers = this.auth.getMecanicoAuthHeaders(); // Usa tu método para incluir Authorization
  return this.http.post(`${this.apiUrl}/RegistrarCliente`, cliente, { 
    headers, 
    responseType: 'text' 
  });
}
}
