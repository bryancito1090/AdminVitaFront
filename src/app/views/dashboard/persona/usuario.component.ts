import { Component } from '@angular/core';
import { GestionPersonasComponent } from "../../shared/components/gestion-personas/gestion-personas.component";

@Component({
  selector: 'app-usuario',
  imports: [GestionPersonasComponent],
  template: `
  <app-gestion-personas 
  [persona]="{tipo: 'usuario', key: 'user'}">  
  </app-gestion-personas>
  `,
})
export class UsuarioComponent {

}
