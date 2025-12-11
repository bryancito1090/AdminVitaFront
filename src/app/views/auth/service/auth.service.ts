import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { jwtDecode, JwtPayload } from "jwt-decode";
import { MecanicoAuth } from '../../../../domain/response/Auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.domain}${environment.apiEndpoint}${environment.authentication}`;
  
  private currentMecanicoSubject = new BehaviorSubject<MecanicoAuth | null>(null);
  public currentMecanico$ = this.currentMecanicoSubject.asObservable();
  private mecanicoTokenTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {
    this.checkStoredMecanicoToken();
  }


  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(`${this.apiUrl}/login`, body, { headers });
  }

  auth_mecanica(codigo: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/login-mecanico`, JSON.stringify(codigo), { headers });
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  deleteToken(): void {
    localStorage.removeItem('authToken');
  }
  
  getToken(): string {
    const token = localStorage.getItem('authToken');
    return token || "NotFoundToken";
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();  
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  DecodedTokenAuth(token: any): JwtPayload | null {
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  }

  getNameIdentifier(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  }

  getUserCode(): string | undefined {
    const token = this.getToken();
    if (!token) return undefined;
  
    try {
      const decoded: any = jwtDecode(token);
      return decoded.codigoUsuario || null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return undefined;
    }
  }
// Login con PIN del mecánico
loginMecanico(pin: string): Observable<MecanicoAuth> {
  const mecanicoAuthUrl = `${environment.domain}${environment.apiEndpoint}/Autenticate/login-mecanico`;
  
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  
  // ✅ CORREGIDO: Enviar el PIN como string JSON (con comillas)
  return this.http.post<any>(mecanicoAuthUrl, JSON.stringify(pin), { headers })
    .pipe(
      map(response => {
        const token = response.token || response;
        const mecanicoData = this.decodeMecanicoToken(token);
        
        // Almacenar en localStorage
        localStorage.setItem('mecanico-token', token);
        
        // Actualizar subject
        this.currentMecanicoSubject.next(mecanicoData);
        this.startMecanicoTokenTimer(mecanicoData.exp);
        
        return mecanicoData;
      })
    );
}
  // Decodificar JWT token específico para mecánicos
  private decodeMecanicoToken(token: string): MecanicoAuth {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Parsear permisos (viene como string JSON)
      let permissions: string[] = [];
      if (payload.Permissions) {
        permissions = JSON.parse(payload.Permissions);
      }

      return {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.id,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name,
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role,
        permissions: permissions,
        roleName: payload.RoleName || payload.roleName,
        token: token,
        exp: payload.exp
      };
    } catch (error) {
      throw new Error('Token de mecánico inválido');
    }
  }

  // Verificar token de mecánico almacenado
  private checkStoredMecanicoToken(): void {
    const token = localStorage.getItem('mecanico-token');
    if (token) {
      try {
        const mecanicoData = this.decodeMecanicoToken(token);
        
        // Verificar si el token no ha expirado
        if (mecanicoData.exp * 1000 > Date.now()) {
          this.currentMecanicoSubject.next(mecanicoData);
          this.startMecanicoTokenTimer(mecanicoData.exp);
        } else {
          this.handleMecanicoTokenExpiration();
        }
      } catch (error) {
        this.handleMecanicoTokenExpiration();
      }
    }
  }

  // Verificar si el mecánico tiene un permiso específico
  hasPermission(modulo: string, operacion: string): boolean {
    const currentMecanico = this.currentMecanicoSubject.value;
    if (!currentMecanico) return false;

    const requiredPermission = `${modulo}.${operacion}`;
    return currentMecanico.permissions.includes(requiredPermission);
  }

  // Verificar si el mecánico tiene cualquiera de los permisos especificados
  hasAnyPermission(permissions: string[]): boolean {
    const currentMecanico = this.currentMecanicoSubject.value;
    if (!currentMecanico) return false;

    return permissions.some(permission => 
      currentMecanico.permissions.includes(permission)
    );
  }

  // Obtener mecánico actual
  getCurrentMecanico(): MecanicoAuth | null {
    return this.currentMecanicoSubject.value;
  }

  // Verificar si el mecánico está autenticado
  isMecanicoAuthenticated(): boolean {
    const currentMecanico = this.currentMecanicoSubject.value;
    if (!currentMecanico) return false;

    // Verificar si el token no ha expirado
    return currentMecanico.exp * 1000 > Date.now();
  }

  // Logout específico para mecánico
  logoutMecanico(): void {
    this.clearMecanicoTokenTimer();
    localStorage.removeItem('mecanico-token');
    this.currentMecanicoSubject.next(null);
  }

  // Obtener token de mecánico para headers HTTP
  getMecanicoToken(): string | null {
    const currentMecanico = this.currentMecanicoSubject.value;
    return currentMecanico ? currentMecanico.token : null;
  }

  getMecanicoAuthHeaders(): HttpHeaders {
  const token = this.getMecanicoToken();
  if (!token) {
    return new HttpHeaders({'Content-Type': 'application/json'});
  }
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}

getUsuarioData(): any {
  const token = this.getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.nameid || payload.sub || payload.id || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        idUsuario: payload.nameid || payload.sub || payload.id || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        nombre: payload.name || payload.nombre || payload.unique_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: payload.email || payload.emailaddress || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
      };
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }
  return null;
}

getMecanicoProfile(): { nombre: string; email?: string } | null {
  const mecanico = this.currentMecanicoSubject.value;
  if (mecanico) {
    return { nombre: mecanico.name, email: mecanico.email };
  }

  const token = localStorage.getItem('mecanico-token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      nombre: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name,
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email
    };
  } catch (error) {
    console.error('Error al decodificar token de mecánico:', error);
    return null;
  }
}

  private startMecanicoTokenTimer(exp?: number): void {
    this.clearMecanicoTokenTimer();
    if (!exp) return;

    const expiresInMs = exp * 1000 - Date.now();
    if (expiresInMs <= 0) {
      this.handleMecanicoTokenExpiration();
      return;
    }

    this.mecanicoTokenTimer = setTimeout(() => {
      this.handleMecanicoTokenExpiration();
    }, expiresInMs);
  }

  private clearMecanicoTokenTimer(): void {
    if (this.mecanicoTokenTimer) {
      clearTimeout(this.mecanicoTokenTimer);
      this.mecanicoTokenTimer = null;
    }
  }

  private handleMecanicoTokenExpiration(): void {
    this.logoutMecanico();
    this.ngZone.run(() => this.router.navigate(['/login_mecanica']));
  }
}
