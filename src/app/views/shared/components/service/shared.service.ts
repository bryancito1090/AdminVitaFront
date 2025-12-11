import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private estadoAddDialog = new BehaviorSubject<boolean>(false);
  private personaEdicion = new BehaviorSubject<any>(null);
  private modoEdicion = new BehaviorSubject<boolean>(false);

  estado$ = this.estadoAddDialog.asObservable();
  personaEdicion$ = this.personaEdicion.asObservable();
  modoEdicion$ = this.modoEdicion.asObservable();

  cambiarEstado(nuevoValor: boolean) {
    this.estadoAddDialog.next(nuevoValor);
  }

  obtenerEstadoActual(): boolean {
    return this.estadoAddDialog.getValue();
  }

  establecerPersonaEdicion(persona: any) {
    this.personaEdicion.next(persona);
  }

  establecerModoEdicion(modo: boolean) {
    this.modoEdicion.next(modo);
  }

  limpiarEdicion() {
    this.personaEdicion.next(null);
    this.modoEdicion.next(false);
  }
}