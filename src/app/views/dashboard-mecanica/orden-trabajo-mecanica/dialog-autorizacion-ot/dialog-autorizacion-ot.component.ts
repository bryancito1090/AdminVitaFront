import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrdenMecanicoService } from '../../../services/ordenMecanico.service';
import { AuthMecanicaComponent } from '../../../auth/components/auth-mecanica/auth-mecanica.component';

@Component({
  selector: 'app-dialog-autorizacion-ot',
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './dialog-autorizacion-ot.component.html',
  styleUrl: './dialog-autorizacion-ot.component.scss'
})
export class DialogAutorizacionOTComponent {

  estado: any;
  idTareaOt: any; 
  duracion: any;
  mensaje: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public ordenMecanicoService: OrdenMecanicoService,
    private dialogService: DialogService
  ) {
    this.estado = this.config.data.estado;
    this.idTareaOt = this.config.data.idTarea;
    this.duracion = this.config.data.duracion || 0;

    switch (this.estado) {
      
      case 6:
        this.mensaje = 'Esperando autorización administrativa para aprobación de la solicitud.';
        break;
      case 7:
        this.mensaje = 'Esperando asignación de un mecánico a la tarea.';
        break;
      case 8:
        this.mensaje = 'Esperando aprobación del cliente.';
        break;
      default:
        this.mensaje = 'Estado no reconocido.';
    }
  }

  cerrar() {
    this.ref.close(false);
  }

  autorizar() {
    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: {
        accion: 'AutorizarEstadoOT'
      }
    });
    
    dialogRef.onClose.subscribe((result: { acceso: boolean, token: any }) => {
      if (this.estado == 8){
        this.ordenMecanicoService.actualizarTareaOT(this.idTareaOt, 1, this.duracion).subscribe({
          next: (response) => {
            console.log('Orden autorizada exitosamente:', response);
          },
          error: (error) => {
            console.error('Error al autorizar la orden:', error);
          }
        });
      }
      this.ref.close(true);
    });
  }
}
