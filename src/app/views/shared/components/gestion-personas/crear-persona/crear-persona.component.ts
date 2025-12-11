import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormularioPersonaComponent } from "../../formulario-persona/formulario-persona.component";
import { SharedService } from '../../service/shared.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-crear-persona',
  standalone: true,
  imports: [
    DialogModule,
    FormularioPersonaComponent,
    ButtonModule
  ],
  templateUrl: './crear-persona.component.html',
  styleUrl: './crear-persona.component.scss'
})
export class CrearPersonaComponent implements OnInit, AfterViewInit {
  @Input() visible: boolean = false;
  @Input() persona: any;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();
  @ViewChild('formularioPersona') formularioPersona!: FormularioPersonaComponent;

  esEdicion: boolean = false;
  datosPersonaEdicion: any = null;
  titleDialog!: string;

  constructor(private sharedService: SharedService) { }

 ngOnInit(): void {
    this.titlePersona(); // Establecer título inicial
    
    // Suscribirse al estado del diálogo
    this.sharedService.estado$.subscribe(valor => {
      this.visible = valor;
      if (!valor) {
        this.limpiarEstado();
      } else {
        // Actualizar título cuando se abre el diálogo
        this.titlePersona();
      }
    });

    // Suscribirse a los datos de persona para edición
    this.sharedService.personaEdicion$.subscribe(persona => {
      this.datosPersonaEdicion = persona;
      this.titlePersona(); // Actualizar título
    });

    // Suscribirse al modo de edición
    this.sharedService.modoEdicion$.subscribe(modo => {
      this.esEdicion = modo;
      this.titlePersona(); // Actualizar título
    });
}
ngAfterViewInit() {
    // Verificar si hay datos pendientes cuando el componente hijo esté listo
    setTimeout(() => {
      if (this.datosPersonaEdicion && this.esEdicion && this.formularioPersona) {
        this.formularioPersona.cargarDatosParaEdicion(this.datosPersonaEdicion, this.esEdicion);
      }
    }, 200);
}

private cargarDatosEnFormulario() {
    if (this.formularioPersona && this.datosPersonaEdicion && this.esEdicion) {
      setTimeout(() => {
        this.formularioPersona.cargarDatosParaEdicion(this.datosPersonaEdicion, this.esEdicion);
      }, 100);
    }
}

  titlePersona() {
    const tipoOperacion = this.esEdicion ? 'Editar' : 'Crear';
    
    switch(this.persona) {
      case 'persona':
        this.titleDialog = `${tipoOperacion} Persona`;
        break;
      case 'mec':
        this.titleDialog = `${tipoOperacion} Mecánico`;
        break;
      case 'prov':
        this.titleDialog = `${tipoOperacion} Proveedor`;
        break;
      case 'propietario':
        this.titleDialog = this.esEdicion ? 'Editar Propietario' : 'Cambiar Propietario';
        break;
      case 'user':
        this.titleDialog = `${tipoOperacion} Usuario`;
        break;
      default:
        this.titleDialog = `${tipoOperacion} Persona`;
        break;
    }
  }

  responseDialogPropietariosForm(valor: any) {
    if (valor) {
      this.visible = false;
      this.sharedService.cambiarEstado(false);
      this.formSubmitted.emit(false);
    }
  }

  closeDialog() {
    this.sharedService.cambiarEstado(false);
    this.cerrar.emit();
    this.formSubmitted.emit(false);
  }

  private limpiarEstado() {
    this.esEdicion = false;
    this.datosPersonaEdicion = null;
    
    // Limpiar el servicio después de un delay
    setTimeout(() => {
      this.sharedService.limpiarEdicion();
    }, 100);
    
    // Resetear el formulario si existe
    if (this.formularioPersona) {
      setTimeout(() => {
        this.formularioPersona.resetForm();
      }, 200);
    }
    
    // Actualizar título a modo creación
    this.titlePersona();
  }
}