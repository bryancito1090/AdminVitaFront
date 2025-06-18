import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../auth/service/auth.service';

@Component({
  selector: 'app-validar-accion-mecanico',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ProgressSpinnerModule
],
  standalone: true,
  templateUrl: './validar-accion-mecanico.component.html',
  styleUrl: './validar-accion-mecanico.component.scss'
})
export class ValidarAccionMecanicoComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() validacionExitosa = new EventEmitter<any>();
  @Output() onCerrar = new EventEmitter<void>();
  @Input() requiredPermissions: string[] = []; 
  @Output() validacionSinPermisos = new EventEmitter<any>(); 

  pin: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService) {}

  onDialogHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.limpiarFormulario();
    this.onCerrar.emit();
  }

validarPin() {
    if (!this.pin || this.pin.trim() === '') {
      this.errorMessage = 'Por favor ingrese su PIN';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.loginMecanico(this.pin).subscribe({
      next: (mecanicoAuth) => {
        
        if (this.requiredPermissions.length > 0) {
          console.log('🔍 Verificando permisos:', this.requiredPermissions);
          console.log('🔍 Permisos del mecánico:', mecanicoAuth.permissions);
          
          const hasPermission = this.authService.hasAnyPermission(this.requiredPermissions);
          console.log('🔍 Tiene permisos:', hasPermission);
          
          if (!hasPermission) {
            this.loading = false;
            console.log('❌ Emitiendo evento validacionSinPermisos');
            this.validacionSinPermisos.emit(mecanicoAuth);
            this.onDialogHide();
            return;
          }
          
        }

        this.loading = false;
        this.validacionExitosa.emit(mecanicoAuth);
        this.onDialogHide();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'PIN incorrecto. Intente nuevamente.';
        
        // Limpiar PIN para nuevo intento
        this.pin = '';
      }
    });
  }
  cerrarModal() {
    this.onDialogHide();
  }

  private limpiarFormulario() {
    this.pin = '';
    this.errorMessage = '';
    this.loading = false;
  }

  onPinChange() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}