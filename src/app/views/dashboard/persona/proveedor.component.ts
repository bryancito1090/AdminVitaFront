import { Component } from '@angular/core';
import { GestionPersonasComponent } from "../../shared/components/gestion-personas/gestion-personas.component";

@Component({
  selector: 'app-proveedor',
  imports: [GestionPersonasComponent],
  template: `<app-gestion-personas [persona]="{tipo: 'proveedor', key: 'prov'}"/>`
})
export class ProveedorComponent {

}
