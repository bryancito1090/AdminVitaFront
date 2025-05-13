import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  imports: [],
  template: `
    <div id="bg-principal" >
      <div class="relative min-h-screen bg-indigo-900 bg-opacity-50">
        <div class="contenedor-main min-h-screen min-w-[100vw] bg-slate-900 bg-opacity-60">
          <div class="flex justify-center items-center">
          </div>
          <div>
            <div class="flex flex-col items-center justify-center mb-4">
              <h1 class="text-6xl font-bold text-white tracking-wide" style="font-size: 100px;">VITA</h1>
              <p class="text-slate-100">¡Nos alegra tenerte aquí! Comienza tu experiencia con VITA.</p>
            </div>
            <div class="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
              <div 
                class="contenedor-form self-center bg-slate-400 p-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:bg-gray-100 focus:ring-gray-500"
                tabindex="0"
                role="button"
                aria-pressed="false"
                (click)="redirectToMecanica()"
              >
                <h2 class="text-lg font-semibold text-gray-800 text-center">Portal Mecánica</h2>
              </div>
              <div 
                class="contenedor-form self-center bg-slate-400 p-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:bg-gray-100 focus:ring-gray-500"
                tabindex="0"
                role="button"
                aria-pressed="false"
                (click)="redirectToAdministrative()"
              >
                <h2 class="text-lg font-semibold text-gray-800 text-center">Portal Administrativo</h2>
              </div>
            </div>
          </div>
          <div>
            <p class="text-slate-500 text-xs mt-8" >Desarrollado por: ©Instituto Superior Tecnológico Mayor Pedro Traversarí.</p>
          </div>
        </div>
    </div>
  `,
  styleUrl: `./start.component.scss`,
  standalone: true,
})
export class StartComponent {

  constructor(private route: Router) {}

  redirectToAdministrative() {
    this.route.navigate(['/login']);
  }
  redirectToMecanica() {
    this.route.navigate(['/mecanica']);
  }
}
