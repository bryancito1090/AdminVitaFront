import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ClienteService } from '../../../views/services/cliente.service';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    RadioButtonModule,
    TabViewModule,
    CalendarModule,
    DropdownModule,
    ButtonModule
  ],
  templateUrl: './registro-cliente.component.html',
  styleUrls: ['./registro-cliente.component.scss']
})
export class RegistroClienteComponent {
  // ✅ ELIMINADO: @Input() documentoPrevio
  @Output() clienteRegistrado = new EventEmitter<{ documento: any; cliente: any | null }>();
  
  // Control de visibilidad del diálogo
  visible: boolean = false;
  
  // Tipos de cliente
  isPersonaNatural: boolean = true;
  mostrarCamposPersonaNatural: boolean = true;
  mostrarCamposEmpresa: boolean = false;
  mostrarTipoDocumento: boolean = true;
  
  // Tipo de documento
  tipoDocumento: string = 'cedula';
  
  // Pestañas activas
  activeTabIndex: number = 0;
  
  // Mensajes
  mensajeExito: string = '';
  mensajeError: string = '';
  cargando: boolean = false;
  
  // Opciones para dropdowns
  generos = [
    { label: 'Seleccionar', value: '' },
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'O' }
  ];
  
  // Datos del formulario
  datosPersonaNatural = {
    documento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: null as Date | null,
    genero: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    esLocal: true,
  };

  datosEmpresa = {
    documento: '',
    nombre: '',
    razonSocial: '',
    representanteLegal: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    obligadaContabilidad: false,
    esLocal: true
  };

  constructor(
    private clienteService: ClienteService,
    private toastr: ToastrService
  ) {}

  mostrarDialogo(): void {
    this.resetearFormulario();
    this.visible = true;
  }

  // Método para cerrar el diálogo
  cerrarDialogo(): void {
    this.visible = false;
    this.resetearFormulario();
  }

  // Cambiar tipo de cliente
  toggleClienteType(isPersonaNatural: boolean): void {
    this.isPersonaNatural = isPersonaNatural;
    this.mostrarCamposPersonaNatural = isPersonaNatural;
    this.mostrarCamposEmpresa = !isPersonaNatural;
    this.activeTabIndex = 0;
    
    // Resetear tipo de documento según el tipo de persona
    this.tipoDocumento = isPersonaNatural ? 'cedula' : 'ruc';
  }
  
  // Cambiar tipo de documento
  cambiarTipoDocumento(tipo: string): void {
    this.tipoDocumento = tipo;
  }
  
  resetearFormulario(): void {
    this.isPersonaNatural = true;
    this.mostrarCamposPersonaNatural = true;
    this.mostrarCamposEmpresa = false;
    this.tipoDocumento = 'cedula';
    this.activeTabIndex = 0;
    
    this.datosPersonaNatural = {
      documento: '', 
      nombres: '',
      apellidos: '',
      fechaNacimiento: null,
      genero: '',
      email: '',
      celular: '',
      telefono: '',
      direccion: '',
      esLocal: true
    };
    
    this.datosEmpresa = {
      documento: '', 
      nombre: '',
      razonSocial: '',
      representanteLegal: '',
      email: '',
      celular: '',
      telefono: '',
      direccion: '',
      obligadaContabilidad: false,
      esLocal: true
    };
    
    this.mensajeExito = '';
    this.mensajeError = '';
  }
  
  // Preparar datos del cliente para enviar al servicio
  prepararDatosCliente(): any {
    const fechaActual = new Date().toISOString();
    
    if (this.isPersonaNatural) {
      return {
        nombre: this.datosPersonaNatural.nombres,
        tipoPersona: 'N',
        tipoDocumento: this.tipoDocumento === 'cedula' ? 'C' : 'P',
        documento: this.datosPersonaNatural.documento,
        email: this.datosPersonaNatural.email,
        celular: this.datosPersonaNatural.celular || '',
        telefono: this.datosPersonaNatural.telefono || '',
        direccion: this.datosPersonaNatural.direccion,
        apellidos: this.datosPersonaNatural.apellidos,
        fechaNacimiento: this.datosPersonaNatural.fechaNacimiento ? 
          (typeof this.datosPersonaNatural.fechaNacimiento === 'string' ? 
           this.datosPersonaNatural.fechaNacimiento : 
           this.datosPersonaNatural.fechaNacimiento.toISOString()) : undefined,
        genero: this.datosPersonaNatural.genero || '',
        razonSocial: '',
        idRepresentanteLegal: 0,
        representanteLegalNombre: '',
        obligadaContabilidad: false,
        esLocal: this.datosPersonaNatural.esLocal
      };
    } else {
      return {
        nombre: this.datosEmpresa.nombre,
        tipoPersona: 'E',
        tipoDocumento: 'R',
        documento: this.datosEmpresa.documento,
        email: this.datosEmpresa.email,
        celular: this.datosEmpresa.celular || '',
        telefono: this.datosEmpresa.telefono || '',
        direccion: this.datosEmpresa.direccion,
        apellidos: '',
        fechaNacimiento: undefined,
        genero: '',
        razonSocial: this.datosEmpresa.razonSocial,
        idRepresentanteLegal: 0,
        representanteLegalNombre: this.datosEmpresa.representanteLegal,
        obligadaContabilidad: this.datosEmpresa.obligadaContabilidad,
        esLocal: this.datosEmpresa.esLocal
      };
    }
  }

  // Validación de campos
  validarFormulario(): boolean {
    if (this.isPersonaNatural) {
      if (!this.datosPersonaNatural.documento) {
        this.toastr.warning('El número de documento es obligatorio', 'Campo requerido');
        return false;
      }
      if (!this.datosPersonaNatural.genero) {
        this.toastr.warning('El género es obligatorio', 'Campo requerido');
        return false;
      }
      if (this.tipoDocumento === 'cedula' && !/^\d{10}$/.test(this.datosPersonaNatural.documento)) {
        this.toastr.warning('La cédula debe tener 10 dígitos numéricos', 'Formato inválido');
        return false;
      }
      
      if (this.tipoDocumento === 'pasaporte' && !/^[A-Za-z0-9]{6,12}$/.test(this.datosPersonaNatural.documento)) {
        this.toastr.warning('El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos', 'Formato inválido');
        return false;
      }
      
      if (!this.datosPersonaNatural.nombres) {
        this.toastr.warning('El nombre es obligatorio', 'Campo requerido');
        return false;
      }
      
      if (!this.datosPersonaNatural.apellidos) {
        this.toastr.warning('El apellido es obligatorio', 'Campo requerido');
        return false;
      }
      
      if (!this.datosPersonaNatural.email) {
        this.toastr.warning('El email es obligatorio', 'Campo requerido');
        return false;
      }
      
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(this.datosPersonaNatural.email)) {
        this.toastr.warning('El formato del email no es válido', 'Formato inválido');
        return false;
      }
      
      if (!this.datosPersonaNatural.direccion) {
        this.toastr.warning('La dirección es obligatoria', 'Campo requerido');
        return false;
      }
    } else {
      if (!this.datosEmpresa.documento) {
        this.toastr.warning('El número de RUC es obligatorio', 'Campo requerido');
        return false;
      }
      
      if (!/^\d{13}$/.test(this.datosEmpresa.documento)) {
        this.toastr.warning('El RUC debe tener 13 dígitos numéricos', 'Formato inválido');
        return false;
      }
      
      if (!this.datosEmpresa.nombre) {
        this.toastr.warning('El nombre de la empresa es obligatorio', 'Campo requerido');
        return false;
      }
      
      if (!this.datosEmpresa.razonSocial) {
        this.toastr.warning('La razón social es obligatoria', 'Campo requerido');
        return false;
      }
      
      if (!this.datosEmpresa.representanteLegal) {
        this.toastr.warning('El nombre del representante legal es obligatorio', 'Campo requerido');
        return false;
      }
      
      if (!this.datosEmpresa.email) {
        this.toastr.warning('El email es obligatorio', 'Campo requerido');
        return false;
      }
      
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(this.datosEmpresa.email)) {
        this.toastr.warning('El formato del email no es válido', 'Formato inválido');
        return false;
      }
      
      if (!this.datosEmpresa.direccion) {
        this.toastr.warning('La dirección es obligatoria', 'Campo requerido');
        return false;
      }
    }
    
    return true;
  }

  validarDocumento(valor: string, tipo: string): boolean {
    if (!valor) return false;
    
    // Solo números y longitud correcta
    if (tipo === 'cedula') {
      // Cédula: exactamente 10 dígitos, sin repetir todos iguales
      return /^\d{10}$/.test(valor) && !/^(\d)\1{9}$/.test(valor);
    } else if (tipo === 'ruc') {
      // RUC: exactamente 13 dígitos, sin repetir todos iguales
      return /^\d{13}$/.test(valor) && !/^(\d)\1{12}$/.test(valor);
    } else if (tipo === 'pasaporte') {
      // Pasaporte: entre 6-12 caracteres alfanuméricos
      return /^[A-Za-z0-9]{6,12}$/.test(valor);
    }
    
    return false;
  }

  validarCampo(tipo: string, campo: string, valor: any): void {
    if (!valor || valor === '') return;
    
    switch (campo) {
      case 'documento':
        let tipoDoc = '';
        if (tipo === 'persona') {
          tipoDoc = this.tipoDocumento; // 'cedula' o 'pasaporte'
        } else {
          tipoDoc = 'ruc';
        }
        
        if (!this.validarDocumento(valor, tipoDoc)) {
          if (tipoDoc === 'cedula') {
            this.toastr.error('La cédula debe tener exactamente 10 dígitos y no pueden ser todos iguales', 'Cédula inválida');
          } else if (tipoDoc === 'ruc') {
            this.toastr.error('El RUC debe tener exactamente 13 dígitos y no pueden ser todos iguales', 'RUC inválido');
          } else {
            this.toastr.error('El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos', 'Pasaporte inválido');
          }
        }
        break;
        
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(valor)) {
          this.toastr.warning('El formato del email no es válido', 'Formato inválido');
        }
        break;
    }
  }

  soloNumeros(event: any, tipo: string): void {
    const valor = event.target.value;
    let valorLimpio = '';
    
    if (tipo === 'cedula' || tipo === 'ruc') {
      // Solo números
      valorLimpio = valor.replace(/[^0-9]/g, '');
    } else {
      // Alfanumérico para pasaporte
      valorLimpio = valor.replace(/[^A-Za-z0-9]/g, '');
    }
    
    // Actualizar el valor
    event.target.value = valorLimpio;
    
    // Actualizar el modelo
    if (tipo === 'ruc') {
      this.datosEmpresa.documento = valorLimpio;
    } else {
      this.datosPersonaNatural.documento = valorLimpio;
    }
  }

  registrarCliente(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    
    if (!this.validarFormulario()) {
      return;
    }
    
    const cliente = this.prepararDatosCliente();
    this.cargando = true;
    
    this.clienteService.registrarCliente(cliente).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        
        if (respuesta === 'Cliente registrado correctamente.' || 
            (typeof respuesta === 'object' && respuesta.success)) {
          this.toastr.success('Cliente registrado correctamente', 'Operación exitosa');
          
          this.clienteRegistrado.emit({
            documento: cliente.documento,
            cliente: respuesta
          });
          
          this.visible = false;
        } else {
          this.toastr.warning(typeof respuesta === 'string' ? respuesta : 'Respuesta inesperada del servidor', 'Advertencia');
        }
      },
      error: (error) => {
        this.cargando = false;
        
        let mensaje = 'Error al registrar el cliente';
        let titulo = 'Error';
        
        if (error.status === 400) {
          if (error.error && error.error.includes('ya existe')) {
            this.toastr.info('Este documento ya está registrado', 'Cliente existente');
            
            this.clienteRegistrado.emit({
              documento: cliente.documento,
              cliente: null  // null indica que ya existe
            });
            
            this.visible = false;
            this.resetearFormulario();
            return;
          }
          
          if (typeof error.error === 'object') {
            mensaje = JSON.stringify(error.error);
          } else if (typeof error.error === 'string') {
            mensaje = error.error;
          }
          titulo = 'Datos inválidos';
        } else if (error.status === 409) {
          mensaje = 'Ya existe un cliente con ese documento';
          titulo = 'Cliente duplicado';
          
          this.clienteRegistrado.emit({
            documento: cliente.documento,
            cliente: null
          });
          
          this.visible = false;
          this.resetearFormulario();
          return;
        }
        
        this.toastr.error(mensaje, titulo);
      }
    });
  }

  cambiarPestana(index: number) {
    // Solo permite cambiar a pestañas anteriores o si ya se completaron los pasos previos
    if (index < this.activeTabIndex || this.validarPestañaActual()) {
      this.activeTabIndex = index;
    }
  }

  validarPestañaActual(): boolean {
    // Implementa la validación de los campos de la pestaña actual
    // Retorna true si los datos son válidos y se puede avanzar
    
    if (this.activeTabIndex === 0) {
      // Validar información básica
      if (this.isPersonaNatural) {
        return this.datosPersonaNatural.documento !== '' && 
               this.datosPersonaNatural.nombres !== '' && 
               this.datosPersonaNatural.apellidos !== '';
      } else {
        return this.datosEmpresa.documento !== '' && 
               this.datosEmpresa.nombre !== '' && 
               this.datosEmpresa.razonSocial !== '' && 
               this.datosEmpresa.representanteLegal !== '';
      }
    } else if (this.activeTabIndex === 1) {
      // Validar información adicional (solo empresas)
      return true; // O implementa validaciones específicas si es necesario
    }
    
    return false;
  }
}