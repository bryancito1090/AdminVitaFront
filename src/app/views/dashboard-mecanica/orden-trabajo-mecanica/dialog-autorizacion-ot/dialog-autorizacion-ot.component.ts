import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrdenMecanicoService } from '../../../services/ordenMecanico.service';
import { AuthMecanicaComponent } from '../../../auth/components/auth-mecanica/auth-mecanica.component';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dialog-autorizacion-ot',
  imports: [
    CommonModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './dialog-autorizacion-ot.component.html',
  styleUrl: './dialog-autorizacion-ot.component.scss'
})
export class DialogAutorizacionOTComponent {

  estado: number = 0;
  idTareaOt: any;
  duracion: number = 0;
  mensaje: string = '';
  estadoLabel: string = 'Revision';
  estadoColor: 'info' | 'warn' | 'danger' | 'success' | 'secondary' = 'info';
  mostrarBotonAutorizar = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public ordenMecanicoService: OrdenMecanicoService,
    private dialogService: DialogService
  ) {
    this.estado = Number(this.config.data.estado ?? 0);
    this.idTareaOt = this.config.data.idTarea;
    this.duracion = this.config.data.duracion || 0;

    this.definirEstado();
  }

  private definirEstado() {
    switch (this.estado) {
      case 6:
        this.estadoLabel = 'Espera admin';
        this.estadoColor = 'warn';
        this.mensaje = 'Esperando autorizacion administrativa para aprobar la solicitud.';
        break;
      case 7:
        this.estadoLabel = 'Asignar mecanico';
        this.estadoColor = 'info';
        this.mensaje = 'Esta tarea necesita un mecanico asignado antes de continuar.';
        break;
      case 8:
        this.estadoLabel = 'Pendiente cliente';
        this.estadoColor = 'danger';
        this.mensaje = 'Se requiere la aprobacion del cliente para avanzar.';
        this.mostrarBotonAutorizar = true;
        break;
      default:
        this.estadoLabel = 'Revision';
        this.estadoColor = 'secondary';
        this.mensaje = 'Estado pendiente de revision.';
        break;
    }
  }

  cerrar() {
    this.ref.close(false);
  }

  autorizar() {
    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Codigo de Autenticacion',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: { accion: 'AutorizarEstadoOT' }
    });
    
    dialogRef.onClose.subscribe((result: { acceso: boolean, token: any }) => {
      if (result?.acceso && this.estado === 8) {
        this.ordenMecanicoService.actualizarTareaOT(this.idTareaOt, 1, this.duracion).subscribe({
          next: () => {
            console.log('Orden autorizada exitosamente');
          },
          error: (error) => {
            console.error('Error al autorizar la orden:', error);
          }
        });
      }
      this.ref.close(!!result?.acceso);
    });
  }
}
