import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { AddVehicleNoInstitucional } from '../../../../domain/request/Vehiculo.model';
import { ValidacionService } from '../../../views/services/validacion.service';
import { VehiculoService } from '../../../views/services/vehiculo.service';
import { TipoVehiculoService } from '../../../views/services/tipo-vehiculo.service';

@Component({
  selector: 'app-registro-vehiculo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './registro-vehiculo.component.html',
  styleUrls: ['./registro-vehiculo.component.scss']
})
export class RegistroVehiculoComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() vehiculoRegistrado = new EventEmitter<string>();

  // Datos del formulario
  documentoCliente: string = '';
  vehiculo: AddVehicleNoInstitucional = {
    idTipoVehiculo: 0,
    marca: '',
    modelo: '',
    version: null,
    placa: '',
    anio: 0,
    color: '',
    numeroChasis: null,
    numeroVehiculo: null,
    estado: 1,
    ultimoAnioMatriculacion: null,
    ultimoAnioRTV: null,
    idCliente: 0,
    idLicencias: [],
    archivos: []
  };

  // Control de UI
  cargandoCliente: boolean = false;
  cargandoRegistro: boolean = false;
  mostrarInfoCliente: boolean = false;
  clienteActual: any = null;
  errorCliente: string = '';
  mensajeError: string = '';
  mensajeExito: string = '';

  // Listas de selección
  tiposVehiculo: any[] = [];
  listaAnios: number[] = [];

  constructor(
    private validacionService: ValidacionService,
    private vehiculoService: VehiculoService,
    private tipoVehiculoService: TipoVehiculoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarTiposVehiculo();
    this.generarListaAnios();
  }

  generarListaAnios(): void {
    const anioActual = new Date().getFullYear();
    const anioInicio = anioActual - 30;
    this.listaAnios = Array.from({ length: anioActual - anioInicio + 1 }, (_, i) => anioActual - i);
  }

 cargarTiposVehiculo(): void {
  this.tipoVehiculoService.getTiposVehiculo().subscribe({
    next: (data: any[]) => {
      this.tiposVehiculo = data;
    },
    error: (error: any) => {
      console.error('Error al cargar tipos de vehículo:', error);
      this.toastr.error('No se pudieron cargar los tipos de vehículo', 'Error');
    }
  });
}

 validarCliente(): void {
  if (!this.documentoCliente || this.documentoCliente.trim() === '') {
    this.toastr.warning('Por favor ingrese un documento válido', 'Advertencia');
    return;
  }

  this.cargandoCliente = true;
  this.mostrarInfoCliente = false;
  this.errorCliente = '';

  this.validacionService.validarClienteXDocMec(this.documentoCliente).subscribe({
    next: (respuesta: any) => {
      this.clienteActual = respuesta;
      this.mostrarInfoCliente = true;
      this.cargandoCliente = false;
      this.vehiculo.idCliente = this.clienteActual.idPersona;

      if (this.clienteActual.esClienteActivo) {
        this.toastr.success('Cliente encontrado', 'Éxito');
      } else {
        this.toastr.info('El cliente existe pero no está activo', 'Información');
      }
    },
    error: (error: any) => {
      console.error('Error al validar cliente:', error);
      this.cargandoCliente = false;
      this.clienteActual = null;

      if (error.status === 404) {
        this.errorCliente = 'Cliente no encontrado';
        this.toastr.warning('Cliente no encontrado', 'No existe');
      } else {
        this.errorCliente = 'Error al validar el cliente';
        this.toastr.error('Error al validar el cliente', 'Error');
      }
    }
  });
}

  validarFormulario(): boolean {
    if (!this.clienteActual) {
      this.toastr.warning('Debe validar un cliente primero', 'Advertencia');
      return false;
    }

    if (!this.vehiculo.marca || !this.vehiculo.modelo || !this.vehiculo.color || 
        !this.vehiculo.anio || !this.vehiculo.idTipoVehiculo) {
      this.toastr.warning('Complete todos los campos obligatorios', 'Advertencia');
      return false;
    }

    return true;
  }
registrarVehiculo(): void {
  if (!this.validarFormulario()) {
    return;
  }

  this.cargandoRegistro = true;
  this.mensajeError = '';
  this.mensajeExito = '';

  const vehiculoParaEnviar = {
    ...this.vehiculo,
    ultimoAnioMatriculacion: this.vehiculo.ultimoAnioMatriculacion || 0,
    ultimoAnioRTV: this.vehiculo.ultimoAnioRTV || 0
  };

  console.log('Enviando vehículo:', vehiculoParaEnviar);

  this.vehiculoService.postVehicleNoInstitucional(vehiculoParaEnviar).subscribe({
    next: (respuesta: any) => {
      console.log('Respuesta exitosa:', respuesta);
      this.cargandoRegistro = false;
      
      // ✅ NUEVA lógica: Si es un objeto con idVehiculo, es exitoso
      const esExitoso = 
        // Respuesta es un objeto con idVehiculo (caso actual)
        (typeof respuesta === 'object' && respuesta.idVehiculo && respuesta.idVehiculo > 0) ||
        // Respuesta es un objeto con codigo generado
        (typeof respuesta === 'object' && respuesta.codigo) ||
        // Respuesta es un objeto con success true
        (typeof respuesta === 'object' && respuesta.success === true) ||
        // Respuesta es un objeto sin error explícito y con datos del vehículo
        (typeof respuesta === 'object' && !respuesta.error && (respuesta.placa || respuesta.marca)) ||
        // Casos de string exitoso
        respuesta === 'Vehículo registrado correctamente.' ||
        respuesta === 'Vehiculo registrado correctamente.' ||
        respuesta === true ||
        (typeof respuesta === 'string' && respuesta.toLowerCase().includes('éxito')) ||
        (typeof respuesta === 'string' && respuesta.toLowerCase().includes('exitoso')) ||
        (typeof respuesta === 'string' && respuesta.toLowerCase().includes('correctamente'));

      if (esExitoso) {
        // ✅ Mensaje de éxito personalizado según el tipo de respuesta
        let mensajeExito = 'Vehículo registrado correctamente';
        
        if (respuesta.codigo) {
          mensajeExito = `Vehículo registrado con código: ${respuesta.codigo}`;
        } else if (respuesta.placa) {
          mensajeExito = `Vehículo ${respuesta.placa} registrado correctamente`;
        }
        
        this.toastr.success(mensajeExito, 'Éxito', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
        
        // ✅ Emitir la placa del vehículo registrado
        const placaRegistrada = respuesta.placa || this.vehiculo.placa;
        this.vehiculoRegistrado.emit(placaRegistrada);
        
        setTimeout(() => {
          this.cerrarDialogo();
        }, 500);
        
      } else {
        // Si llegó aquí pero no es claramente exitoso
        const mensaje = typeof respuesta === 'string' 
          ? respuesta 
          : (respuesta?.message || 'Respuesta inesperada del servidor');
        
        this.toastr.warning(mensaje, 'Advertencia', {
          timeOut: 4000,
          progressBar: true
        });
      }
    },
    error: (error: any) => {
      console.error('Error completo:', error);
      this.cargandoRegistro = false;
      
      let mensajeError = 'Error al registrar el vehículo';
      
      // ✅ Extracción mejorada del mensaje de error
      if (error.error && typeof error.error === 'object' && error.error.message) {
        mensajeError = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        mensajeError = error.error;
      } else if (error.message && !error.message.includes('Http failure response')) {
        mensajeError = error.message;
      } else if (error.status === 400) {
        mensajeError = 'Datos inválidos. Verifique la información ingresada.';
        
        if (error.error && error.error.message) {
          mensajeError = error.error.message;
        }
      } else if (error.status === 409) {
        mensajeError = 'El registro ya existe en el sistema';
      } else if (error.status === 0) {
        mensajeError = 'Error de conexión con el servidor';
      } else if (error.status === 500) {
        mensajeError = 'Error interno del servidor';
      }
      
      // ✅ Mostrar notificación según el tipo de error
      if (error.status === 400 && mensajeError.includes('placa')) {
        this.toastr.warning(mensajeError, 'Placa Duplicada', {
          timeOut: 5000,
          progressBar: true
        });
      } else if (error.status === 400) {
        this.toastr.warning(mensajeError, 'Datos Inválidos', {
          timeOut: 5000,
          progressBar: true
        });
      } else {
        this.toastr.error(mensajeError, 'Error', {
          timeOut: 5000,
          progressBar: true
        });
      }
    }
  });
}
  mostrarDialogo(documento?: string): void {
    this.resetearFormulario();
    if (documento) {
      this.documentoCliente = documento;
    }
    this.visible = true;
  }

  cerrarDialogo(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.documentoCliente = '';
    this.vehiculo = {
      idTipoVehiculo: 0,
      marca: '',
      modelo: '',
      version: null,
      placa: '',
      anio: 0,
      color: '',
      numeroChasis: null,
      numeroVehiculo: null,
      estado: 1,
      ultimoAnioMatriculacion: null,
      ultimoAnioRTV: null,
      idCliente: 0,
      idLicencias: [],
      archivos: []
    };
    this.clienteActual = null;
    this.mostrarInfoCliente = false;
    this.errorCliente = '';
    this.mensajeError = '';
    this.mensajeExito = '';
  }
  // ✅ Permitir solo números al escribir
soloNumeros(event: any): void {
  const valor = event.target.value;
  const valorLimpio = valor.replace(/[^0-9]/g, '');
  
  // Actualizar el valor en el input
  event.target.value = valorLimpio;
  
  // Actualizar el modelo
  this.documentoCliente = valorLimpio;
}

// ✅ Validar teclas presionadas para prevenir caracteres no deseados
validarTecla(event: KeyboardEvent): boolean {
  const char = String.fromCharCode(event.which);
  
  // Permitir teclas de control (backspace, delete, tab, etc.)
  if (event.which === 8 || event.which === 9 || event.which === 27 || event.which === 13 ||
      // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.which === 65 && event.ctrlKey === true) ||
      (event.which === 67 && event.ctrlKey === true) ||
      (event.which === 86 && event.ctrlKey === true) ||
      (event.which === 88 && event.ctrlKey === true)) {
    return true;
  }
  
  // Permitir solo números
  if (!/[0-9]/.test(char)) {
    event.preventDefault();
    return false;
  }
  
  return true;
}
}