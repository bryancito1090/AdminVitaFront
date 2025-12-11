import { Component } from '@angular/core';
import { InputOtp } from 'primeng/inputotp';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AuthService } from '../../service/auth.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Component({
  selector: 'app-auth-mecanica',
  imports: [
    FormsModule,
    InputOtp,
    CommonModule
  ],
  standalone: true,
  templateUrl: './auth-mecanica.component.html',
  styleUrl: './auth-mecanica.component.scss'
})
export class AuthMecanicaComponent {
  
  value: string = '';
  tipoAccion: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private authService: AuthService
  ) {
    this.tipoAccion = this.config.data?.accion || '';
  }

  onSubmit() {
    this.authService.loginMecanico(this.value).subscribe({
      next: (response) => {
        if (response.token) {
          const token = this.authService.DecodedTokenAuth(response.token) as JwtPayload & { [key: string]: any };
          const idIdentifier = token["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
          const nameidentifier = token["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
          switch (this.tipoAccion){
            case 'AgregarOT':
              this.authService.saveToken(response.token);
              this.ref.close({ acceso: true, token: response.token });
              break;
              case 'EditarOT':
              this.authService.saveToken(response.token);
              this.ref.close({ acceso: true, token: response.token });
              break;
            case 'CrearOrdenDeTrabajo':
              this.ref.close({ acceso: true, token: response.token });
              break;
            case 'AgregarTareaOT':
              if (!token) return;
              this.ref.close({ acceso: true, id: idIdentifier, token: response.token });
              break;
            case 'AnularOT':
              this.ref.close({ acceso: true, token: response.token });
              break;
            case 'AccederEditarOT':
              this.ref.close({ acceso: true, token: response.token });
              break;
            case 'AutorizarEstadoOT':
              this.ref.close({ acceso: true, token: response.token });
              break;
            case 'AgregarMecanicoTarea':
              this.ref.close({ acceso: true, token: response.token });
              break;
            case 'EliminarMecanicoTarea':
              this.ref.close({ acceso: true, token: response.token });
              break;
            case 'AgregarRepuestoTarea':
              this.ref.close({ acceso: true, idUsuario: idIdentifier });
              break;
            case 'EliminarRepuestoTarea':
              this.ref.close({ acceso: true });
              break;
            case 'ActualizarEstadoTarea':
              this.ref.close({ acceso: true });
              break;
            case 'RegistrarClienteOT':
              this.authService.saveToken(response.token);
              this.ref.close({ acceso: true });
              break;
            default:
              this.ref.close({ acceso: false, token: response.token });
          }

        } else {
          this.ref.close({ acceso: false });
        }
      },
      error: (error) => {
        console.error('Error al autenticar:', error);
        this.ref.close({ acceso: false, id: null });
      }
    });
  }

  onCancel() {
    this.ref.close({ acceso: false, id: null });
  }
}
