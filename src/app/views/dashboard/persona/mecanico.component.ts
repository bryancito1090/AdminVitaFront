import { Component } from '@angular/core';
import { GestionPersonasComponent } from "../../shared/components/gestion-personas/gestion-personas.component";

@Component({
  selector: 'app-mecanico',
  imports: [
    GestionPersonasComponent
],
  standalone: true,
  template: `<app-gestion-personas [persona]="{tipo: 'mecanico', key: 'mec'}"/>`,
})
export class MecanicoComponent{
  
}
