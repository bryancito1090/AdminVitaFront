import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Propietario } from '../../../domain/request/Cliente.model';
import { toFormData } from '../shared/util/form-data.util';
import { AuthService } from '../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.propietario}`;

  constructor(private http:HttpClient, private auth: AuthService) { }

getPropietariosVehiculo(id: number): Observable<any> {
  const headers = this.auth.getAuthHeaders();
  return this.http.get<any>(`${this.apiUrl}/GetPropietariosVehiculo/${id}`, { headers });
}
registrarPropietario(propietario: Propietario): Observable<any> {
  const headers = this.auth.getAuthHeaders().delete('Content-Type'); // Elimina Content-Type si existe
  const formData = toFormData(propietario);
  console.log("headers", headers);
  return this.http.post<any>(
    `${this.apiUrl}/RegistrarPropietario`,
    formData,
    { headers }
  );
}
}
