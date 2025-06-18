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

    this.authService.auth_mecanica(this.value).subscribe({
      next: (response) => {
        if (response.token) {
          const result = {
            acceso: true,
            id: 1
          };
          this.ref.close(result);
        } else {
          this.ref.close({ acceso: false, id: null });
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
