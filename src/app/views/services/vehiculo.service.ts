import { Injectable } from '@angular/core';
import { AuthService } from '../auth/service/auth.service';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { VehicleDetalleResponse, VehiculosList } from '../../../domain/response/Vehiculo.model';
import { HttpClient } from '@angular/common/http';
import { AddVehicleInstitucional, AddVehicleNoInstitucional, UpdateOptionsVehicle } from '../../../domain/request/Vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.vehiculo}`;

  constructor(private auth: AuthService, private http: HttpClient) { }

  getVehiculosInstitucionales():Observable<VehiculosList[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<VehiculosList[]>(`${this.apiUrl}/ObtenerVehiculos`, { headers });
  }
  getVehiculoByPlaca(placa: string): Observable<VehicleDetalleResponse>{
    const headers = this.auth.getAuthHeaders();
    return this.http.get<VehicleDetalleResponse>(`${this.apiUrl}/GetVehiculoByPlaca/${placa}`, { headers });
  }
  postVehicleInstitucional(vehicle: AddVehicleInstitucional):Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/CreateVehiculo`, vehicle, { headers });
  }
  putVehicleInstitucionalOptions(vehicle: UpdateOptionsVehicle):Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/UpdateVehiculo`, vehicle, { headers });
  }
  postVehicleNoInstitucional(vehicle: AddVehicleNoInstitucional): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/CreateVehiculo`, vehicle, { headers });
  }
}
