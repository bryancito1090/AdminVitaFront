import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-dialog-observaciones',
  imports: [
    CommonModule
  ],
  templateUrl: './dialog-observaciones.component.html',
})
export class DialogObservacionesComponent {
  observaciones: any[] = [];

  constructor(public config: DynamicDialogConfig) {
    this.observaciones = config.data.observaciones || [];
  }
}
