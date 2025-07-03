import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

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
  mensaje: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.estado = this.config.data.estado;

    console.log(this.estado); 
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
    this.ref.close(true);
  }
}
