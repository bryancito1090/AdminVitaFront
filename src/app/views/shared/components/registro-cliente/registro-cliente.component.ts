import { Component, EventEmitter, Output } from '@angular/core';
import { AuthMecanicaComponent } from '../../../auth/components/auth-mecanica/auth-mecanica.component';
import { ToastrService } from 'ngx-toastr';
import { ClienteService } from '../../../services/cliente.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  styleUrls: ['./registro-cliente.component.scss'],
  providers: [DialogService],
})
export class RegistroClienteComponent {
  @Output() clienteRegistrado = new EventEmitter<{ documento: any; cliente: any | null }>();
  
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

  dialogRef: DynamicDialogRef | undefined;

  constructor(
    private clienteService: ClienteService,
    private toastr: ToastrService,
    private dialogService: DialogService
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

  // VALIDACIONES DETALLADAS BASADAS EN LA BASE DE DATOS
  
  // Validar nombre (máximo 50 caracteres según DB)
  validarNombre(nombre: string): boolean {
    if (!nombre || nombre.trim() === '') {
      this.toastr.warning('El nombre es obligatorio', 'Campo requerido');
      return false;
    }
    
    if (nombre.length > 50) {
      this.toastr.warning('El nombre no puede tener más de 50 caracteres', 'Nombre muy largo');
      return false;
    }
    
    // Solo letras, espacios y algunos caracteres especiales
    const nombreRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-'\.]+$/;
    if (!nombreRegex.test(nombre)) {
      this.toastr.warning('El nombre solo puede contener letras, espacios y guiones', 'Formato inválido');
      return false;
    }
    
    return true;
  }

  // Validar apellidos (aunque no está en DB, es importante)
  validarApellidos(apellidos: string): boolean {
    if (!apellidos || apellidos.trim() === '') {
      this.toastr.warning('Los apellidos son obligatorios', 'Campo requerido');
      return false;
    }
    
    if (apellidos.length > 50) {
      this.toastr.warning('Los apellidos no pueden tener más de 50 caracteres', 'Apellidos muy largos');
      return false;
    }
    
    // Solo letras, espacios y algunos caracteres especiales
    const apellidosRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-'\.]+$/;
    if (!apellidosRegex.test(apellidos)) {
      this.toastr.warning('Los apellidos solo pueden contener letras, espacios y guiones', 'Formato inválido');
      return false;
    }
    
    return true;
  }

  // Validar documento (máximo 15 caracteres según DB)
  validarDocumento(documento: string, tipoDoc: string): boolean {
    if (!documento || documento.trim() === '') {
      this.toastr.warning('El número de documento es obligatorio', 'Campo requerido');
      return false;
    }
    
    if (documento.length > 15) {
      this.toastr.warning('El documento no puede tener más de 15 caracteres', 'Documento muy largo');
      return false;
    }
    
    switch (tipoDoc) {
      case 'cedula':
        if (!/^\d{10}$/.test(documento)) {
          this.toastr.warning('La cédula debe tener exactamente 10 dígitos numéricos', 'Cédula inválida');
          return false;
        }
        // Validar que no sean todos los dígitos iguales
        if (/^(\d)\1{9}$/.test(documento)) {
          this.toastr.warning('La cédula no puede tener todos los dígitos iguales', 'Cédula inválida');
          return false;
        }
        // Validar algoritmo de cédula ecuatoriana
        if (!this.validarCedulaEcuatoriana(documento)) {
          this.toastr.warning('La cédula ingresada no es válida', 'Cédula inválida');
          return false;
        }
        break;
        
      case 'ruc':
        if (!/^\d{13}$/.test(documento)) {
          this.toastr.warning('El RUC debe tener exactamente 13 dígitos numéricos', 'RUC inválido');
          return false;
        }
        // Validar que no sean todos los dígitos iguales
        if (/^(\d)\1{12}$/.test(documento)) {
          this.toastr.warning('El RUC no puede tener todos los dígitos iguales', 'RUC inválido');
          return false;
        }
        // Validar algoritmo de RUC ecuatoriano
        if (!this.validarRUCEcuatoriano(documento)) {
          this.toastr.warning('El RUC ingresado no es válido', 'RUC inválido');
          return false;
        }
        break;
        
      case 'pasaporte':
        if (!/^[A-Za-z0-9]{6,12}$/.test(documento)) {
          this.toastr.warning('El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos', 'Pasaporte inválido');
          return false;
        }
        break;
    }
    
    return true;
  }

  // Validar cédula ecuatoriana (algoritmo oficial)
  validarCedulaEcuatoriana(cedula: string): boolean {
    if (cedula.length !== 10) return false;
    
    const digitos = cedula.split('').map(Number);
    const provincia = parseInt(cedula.substring(0, 2));
    
    // Validar código de provincia (01-24)
    if (provincia < 1 || provincia > 24) return false;
    
    // Algoritmo de validación
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    
    for (let i = 0; i < 9; i++) {
      let resultado = digitos[i] * coeficientes[i];
      if (resultado > 9) resultado -= 9;
      suma += resultado;
    }
    
    const verificador = (10 - (suma % 10)) % 10;
    return verificador === digitos[9];
  }

  // Validar RUC ecuatoriano (algoritmo oficial)
  validarRUCEcuatoriano(ruc: string): boolean {
    if (ruc.length !== 13) return false;
    
    const digitos = ruc.split('').map(Number);
    const provincia = parseInt(ruc.substring(0, 2));
    
    // Validar código de provincia (01-24)
    if (provincia < 1 || provincia > 24) return false;
    
    // Validar tercer dígito según tipo de RUC
    const tercerDigito = digitos[2];
    if (tercerDigito < 0 || tercerDigito > 9) return false;
    
    // Para personas naturales (tercer dígito < 6)
    if (tercerDigito < 6) {
      const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      let suma = 0;
      
      for (let i = 0; i < 9; i++) {
        let resultado = digitos[i] * coeficientes[i];
        if (resultado > 9) resultado -= 9;
        suma += resultado;
      }
      
      const verificador = (10 - (suma % 10)) % 10;
      return verificador === digitos[9];
    }
    
    // Para sociedades privadas (tercer dígito = 9)
    if (tercerDigito === 9) {
      const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      
      for (let i = 0; i < 9; i++) {
        suma += digitos[i] * coeficientes[i];
      }
      
      const verificador = 11 - (suma % 11);
      const digitoVerificador = verificador === 11 ? 0 : verificador === 10 ? 1 : verificador;
      return digitoVerificador === digitos[9];
    }
    
    // Para sociedades públicas (tercer dígito = 6)
    if (tercerDigito === 6) {
      const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      
      for (let i = 0; i < 8; i++) {
        suma += digitos[i] * coeficientes[i];
      }
      
      const verificador = 11 - (suma % 11);
      const digitoVerificador = verificador === 11 ? 0 : verificador === 10 ? 1 : verificador;
      return digitoVerificador === digitos[8];
    }
    
    return false;
  }

  // Validar email (máximo 45 caracteres según DB)
  validarEmail(email: string): boolean {
    if (!email || email.trim() === '') {
      this.toastr.warning('El email es obligatorio', 'Campo requerido');
      return false;
    }
    
    if (email.length > 45) {
      this.toastr.warning('El email no puede tener más de 45 caracteres', 'Email muy largo');
      return false;
    }
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      this.toastr.warning('El formato del email no es válido', 'Email inválido');
      return false;
    }
    
    return true;
  }

  // Validar celular (máximo 10 caracteres según DB)
  validarCelular(celular: string): boolean {
    if (!celular || celular.trim() === '') {
      return true; // Campo opcional
    }
    
    if (celular.length > 10) {
      this.toastr.warning('El celular no puede tener más de 10 dígitos', 'Celular muy largo');
      return false;
    }
    
    if (!/^\d{10}$/.test(celular)) {
      this.toastr.warning('El celular debe tener exactamente 10 dígitos numéricos', 'Celular inválido');
      return false;
    }
    
    // Validar que inicie con 09 (formato Ecuador)
    if (!celular.startsWith('09')) {
      this.toastr.warning('El celular debe iniciar con 09', 'Celular inválido');
      return false;
    }
    
    return true;
  }

  // Validar teléfono (máximo 10 caracteres según DB)
  validarTelefono(telefono: string): boolean {
    if (!telefono || telefono.trim() === '') {
      return true; // Campo opcional
    }
    
    if (telefono.length > 10) {
      this.toastr.warning('El teléfono no puede tener más de 10 dígitos', 'Teléfono muy largo');
      return false;
    }
    
    if (!/^\d{7,10}$/.test(telefono)) {
      this.toastr.warning('El teléfono debe tener entre 7 y 10 dígitos numéricos', 'Teléfono inválido');
      return false;
    }
    
    return true;
  }

  // Validar dirección (máximo 50 caracteres según DB)
  validarDireccion(direccion: string): boolean {
    if (!direccion || direccion.trim() === '') {
      this.toastr.warning('La dirección es obligatoria', 'Campo requerido');
      return false;
    }
    
    if (direccion.length > 50) {
      this.toastr.warning('La dirección no puede tener más de 50 caracteres', 'Dirección muy larga');
      return false;
    }
    
    return true;
  }

  // Validar razón social (para empresas)
  validarRazonSocial(razonSocial: string): boolean {
    if (!razonSocial || razonSocial.trim() === '') {
      this.toastr.warning('La razón social es obligatoria', 'Campo requerido');
      return false;
    }
    
    if (razonSocial.length > 100) {
      this.toastr.warning('La razón social no puede tener más de 100 caracteres', 'Razón social muy larga');
      return false;
    }
    
    return true;
  }

  // Validar representante legal
  validarRepresentanteLegal(representante: string): boolean {
    if (!representante || representante.trim() === '') {
      this.toastr.warning('El nombre del representante legal es obligatorio', 'Campo requerido');
      return false;
    }
    
    if (representante.length > 100) {
      this.toastr.warning('El nombre del representante legal no puede tener más de 100 caracteres', 'Nombre muy largo');
      return false;
    }
    
    const nombreRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-'\.]+$/;
    if (!nombreRegex.test(representante)) {
      this.toastr.warning('El nombre del representante legal solo puede contener letras, espacios y guiones', 'Formato inválido');
      return false;
    }
    
    return true;
  }

  // Validar fecha de nacimiento
  validarFechaNacimiento(fecha: Date | null): boolean {
    if (!fecha) {
      return true; // Campo opcional
    }
    
    const hoy = new Date();
    const hace150Anos = new Date(hoy.getFullYear() - 150, hoy.getMonth(), hoy.getDate());
    
    if (fecha > hoy) {
      this.toastr.warning('La fecha de nacimiento no puede ser futura', 'Fecha inválida');
      return false;
    }
    
    if (fecha < hace150Anos) {
      this.toastr.warning('La fecha de nacimiento no puede ser anterior a hace 150 años', 'Fecha inválida');
      return false;
    }
    
    return true;
  }

  // Validación completa del formulario
  validarFormulario(): boolean {
    if (this.isPersonaNatural) {
      // Validar datos de persona natural
      if (!this.validarDocumento(this.datosPersonaNatural.documento, this.tipoDocumento)) return false;
      if (!this.validarNombre(this.datosPersonaNatural.nombres)) return false;
      if (!this.validarApellidos(this.datosPersonaNatural.apellidos)) return false;
      if (!this.validarEmail(this.datosPersonaNatural.email)) return false;
      if (!this.validarCelular(this.datosPersonaNatural.celular)) return false;
      if (!this.validarTelefono(this.datosPersonaNatural.telefono)) return false;
      if (!this.validarDireccion(this.datosPersonaNatural.direccion)) return false;
      if (!this.validarFechaNacimiento(this.datosPersonaNatural.fechaNacimiento)) return false;
      
      // Validar género
      if (!this.datosPersonaNatural.genero) {
        this.toastr.warning('El género es obligatorio', 'Campo requerido');
        return false;
      }
      
    } else {
      // Validar datos de empresa
      if (!this.validarDocumento(this.datosEmpresa.documento, 'ruc')) return false;
      if (!this.validarNombre(this.datosEmpresa.nombre)) return false;
      if (!this.validarRazonSocial(this.datosEmpresa.razonSocial)) return false;
      if (!this.validarRepresentanteLegal(this.datosEmpresa.representanteLegal)) return false;
      if (!this.validarEmail(this.datosEmpresa.email)) return false;
      if (!this.validarCelular(this.datosEmpresa.celular)) return false;
      if (!this.validarTelefono(this.datosEmpresa.telefono)) return false;
      if (!this.validarDireccion(this.datosEmpresa.direccion)) return false;
    }
    
    return true;
  }

  // Validación en tiempo real de campos
  validarCampo(tipo: string, campo: string, valor: any): void {
    if (!valor || valor === '') return;
    
    switch (campo) {
      case 'documento':
        let tipoDoc = tipo === 'persona' ? this.tipoDocumento : 'ruc';
        this.validarDocumento(valor, tipoDoc);
        break;
        
      case 'nombres':
      case 'nombre':
        this.validarNombre(valor);
        break;
        
      case 'apellidos':
        this.validarApellidos(valor);
        break;
        
      case 'email':
        this.validarEmail(valor);
        break;
        
      case 'celular':
        this.validarCelular(valor);
        break;
        
      case 'telefono':
        this.validarTelefono(valor);
        break;
        
      case 'direccion':
        this.validarDireccion(valor);
        break;
        
      case 'razonSocial':
        this.validarRazonSocial(valor);
        break;
        
      case 'representanteLegal':
        this.validarRepresentanteLegal(valor);
        break;
        
      case 'fechaNacimiento':
        this.validarFechaNacimiento(valor);
        break;
    }
  }

  // Filtrar solo números para campos numéricos
  soloNumeros(event: any, tipo: string): void {
    const valor = event.target.value;
    let valorLimpio = '';
    
    if (tipo === 'cedula' || tipo === 'ruc' || tipo === 'celular' || tipo === 'telefono') {
      valorLimpio = valor.replace(/[^0-9]/g, '');
    } else if (tipo === 'pasaporte') {
      valorLimpio = valor.replace(/[^A-Za-z0-9]/g, '');
    }
    
    // Actualizar el valor en el input
    event.target.value = valorLimpio;
    
    // Actualizar el modelo correspondiente
    if (tipo === 'ruc') {
      this.datosEmpresa.documento = valorLimpio;
    } else if (tipo === 'cedula' || tipo === 'pasaporte') {
      this.datosPersonaNatural.documento = valorLimpio;
    } else if (tipo === 'celular') {
      if (this.isPersonaNatural) {
        this.datosPersonaNatural.celular = valorLimpio;
      } else {
        this.datosEmpresa.celular = valorLimpio;
      }
    } else if (tipo === 'telefono') {
      if (this.isPersonaNatural) {
        this.datosPersonaNatural.telefono = valorLimpio;
      } else {
        this.datosEmpresa.telefono = valorLimpio;
      }
    }
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
registrarCliente(): void {    
  const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
        header: 'Código de Autenticación',
        width: '400px',
        modal: true,
        dismissableMask: false,
        closable: false,
        data: { accion: 'RegistrarClienteOT' }
      });
  
  dialogRef.onClose.subscribe((result: { acceso: boolean }) => {
    if (!result?.acceso) {
      this.toastr.error('Código incorrecto o cancelado', 'Error');
      return;
    }

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
        
        console.log('Respuesta del servidor:', respuesta); // Para debugging
        
        // Mejorar la validación de respuestas exitosas
        const esExitoso = this.validarRespuestaExitosa(respuesta);
        
        if (esExitoso) {
          this.toastr.success('Cliente registrado correctamente', 'Operación exitosa');
          
          this.clienteRegistrado.emit({
            documento: cliente.documento,
            cliente: respuesta
          });
          
          this.visible = false;
          this.resetearFormulario();
        } else {
          // Si llegamos aquí, hubo un error en el servidor pero el status HTTP fue 200
          const mensajeError = this.extraerMensajeError(respuesta);
          this.toastr.error(mensajeError, 'Error del servidor');
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
              cliente: null
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
  });
}

// Método auxiliar para validar si la respuesta es exitosa
private validarRespuestaExitosa(respuesta: any): boolean {
  // Casos de respuesta exitosa:
  
  // 1. String que indica éxito
  if (typeof respuesta === 'string') {
    const respuestaLower = respuesta.toLowerCase();
    return respuestaLower.includes('correctamente') || 
           respuestaLower.includes('exitosamente') || 
           respuestaLower.includes('registrado') ||
           respuestaLower.includes('creado') ||
           respuestaLower.includes('success') ||
           respuesta === 'Cliente registrado correctamente.';
  }
  
  // 2. Objeto con propiedad success
  if (typeof respuesta === 'object' && respuesta !== null) {
    // success: true
    if (respuesta.success === true) {
      return true;
    }
    
    // success: "true" (string)
    if (respuesta.success === "true") {
      return true;
    }
    
    // status: "success" o similar
    if (respuesta.status && typeof respuesta.status === 'string') {
      const statusLower = respuesta.status.toLowerCase();
      if (statusLower === 'success' || statusLower === 'ok' || statusLower === 'created') {
        return true;
      }
    }
    
    // message que indica éxito
    if (respuesta.message && typeof respuesta.message === 'string') {
      const messageLower = respuesta.message.toLowerCase();
      if (messageLower.includes('correctamente') || 
          messageLower.includes('exitosamente') || 
          messageLower.includes('registrado') ||
          messageLower.includes('creado')) {
        return true;
      }
    }
    
    // Si tiene un ID, probablemente es exitoso
    if (respuesta.id || respuesta.idCliente || respuesta.clienteId) {
      return true;
    }
    
    // Si el objeto tiene datos del cliente creado
    if (respuesta.nombre || respuesta.documento || respuesta.email) {
      return true;
    }
  }
  
  // 3. Número (podría ser un ID)
  if (typeof respuesta === 'number' && respuesta > 0) {
    return true;
  }
  
  // 4. Boolean true
  if (respuesta === true) {
    return true;
  }
  
  return false;
}

// Método auxiliar para extraer mensaje de error
private extraerMensajeError(respuesta: any): string {
  if (typeof respuesta === 'string') {
    return respuesta;
  }
  
  if (typeof respuesta === 'object' && respuesta !== null) {
    // Buscar mensaje de error en diferentes propiedades
    if (respuesta.error) {
      return typeof respuesta.error === 'string' ? respuesta.error : JSON.stringify(respuesta.error);
    }
    
    if (respuesta.message) {
      return respuesta.message;
    }
    
    if (respuesta.details) {
      return respuesta.details;
    }
    
    return JSON.stringify(respuesta);
  }
  
  return 'Respuesta inesperada del servidor';
}
  cambiarPestana(index: number) {
    if (index < this.activeTabIndex || this.validarPestañaActual()) {
      this.activeTabIndex = index;
    }
  }

  validarPestañaActual(): boolean {
    if (this.activeTabIndex === 0) {
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
      return true;
    }
    
    return false;
  }

  // Método para limitar caracteres en tiempo real
  limitarCaracteres(event: any, maxLength: number): void {
    const valor = event.target.value;
    if (valor.length > maxLength) {
      event.target.value = valor.substring(0, maxLength);
      this.toastr.warning(`Máximo ${maxLength} caracteres permitidos`, 'Límite de caracteres');
    }
  }

  // Método para validar caracteres permitidos en nombres
  validarCaracteresNombre(event: any): void {
    const valor = event.target.value;
    const valorLimpio = valor.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-'\.]/g, '');
    if (valor !== valorLimpio) {
      event.target.value = valorLimpio;
      this.toastr.warning('Solo se permiten letras, espacios, guiones y apostrofes', 'Caracteres no válidos');
    }
  }

  // Método para validar email en tiempo real
  validarEmailEnTiempoReal(event: any): void {
    const email = event.target.value;
    if (email && email.length > 0) {
      setTimeout(() => {
        this.validarEmail(email);
      }, 500); // Delay para evitar muchas validaciones
    }
  }

  // Método para validar documento en tiempo real
  validarDocumentoEnTiempoReal(event: any, tipo: string): void {
    const documento = event.target.value;
    if (documento && documento.length > 0) {
      setTimeout(() => {
        let tipoDoc = tipo === 'persona' ? this.tipoDocumento : 'ruc';
        this.validarDocumento(documento, tipoDoc);
      }, 500);
    }
  }

  // Método para formatear teléfono/celular mientras se escribe
  formatearTelefono(event: any, tipo: 'celular' | 'telefono'): void {
    let valor = event.target.value.replace(/[^0-9]/g, '');
    
    if (tipo === 'celular') {
      // Limitar a 10 dígitos para celular
      if (valor.length > 10) {
        valor = valor.substring(0, 10);
        this.toastr.warning('El celular no puede tener más de 10 dígitos', 'Límite excedido');
      }
      
      // Validar que inicie con 09 si tiene al menos 2 dígitos
      if (valor.length >= 2 && !valor.startsWith('09')) {
        this.toastr.warning('El celular debe iniciar con 09', 'Formato incorrecto');
      }
    } else {
      // Limitar a 10 dígitos para teléfono
      if (valor.length > 10) {
        valor = valor.substring(0, 10);
        this.toastr.warning('El teléfono no puede tener más de 10 dígitos', 'Límite excedido');
      }
    }
    
    event.target.value = valor;
    
    // Actualizar modelo
    if (tipo === 'celular') {
      if (this.isPersonaNatural) {
        this.datosPersonaNatural.celular = valor;
      } else {
        this.datosEmpresa.celular = valor;
      }
    } else {
      if (this.isPersonaNatural) {
        this.datosPersonaNatural.telefono = valor;
      } else {
        this.datosEmpresa.telefono = valor;
      }
    }
  }

  // Método para validar edad mínima
  validarEdadMinima(fecha: Date): boolean {
    if (!fecha) return true;
    
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fecha.getMonth();
    
    let edadReal = edad;
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fecha.getDate())) {
      edadReal--;
    }
    
    if (edadReal < 18) {
      this.toastr.warning('El cliente debe ser mayor de edad (18 años)', 'Edad insuficiente');
      return false;
    }
    
    return true;
  }

  // Método para validar fecha en tiempo real
  validarFechaEnTiempoReal(fecha: Date): void {
    if (fecha) {
      setTimeout(() => {
        this.validarFechaNacimiento(fecha);
        this.validarEdadMinima(fecha);
      }, 100);
    }
  }

  // Método para mostrar sugerencias de formato
  mostrarSugerenciaFormato(campo: string): void {
    switch (campo) {
      case 'cedula':
        this.toastr.info('Formato: 10 dígitos (ej: 1234567890)', 'Formato de cédula');
        break;
      case 'ruc':
        this.toastr.info('Formato: 13 dígitos (ej: 1234567890001)', 'Formato de RUC');
        break;
      case 'pasaporte':
        this.toastr.info('Formato: 6-12 caracteres alfanuméricos (ej: AB123456)', 'Formato de pasaporte');
        break;
      case 'celular':
        this.toastr.info('Formato: 10 dígitos iniciando con 09 (ej: 0987654321)', 'Formato de celular');
        break;
      case 'telefono':
        this.toastr.info('Formato: 7-10 dígitos (ej: 2345678 o 023456789)', 'Formato de teléfono');
        break;
      case 'email':
        this.toastr.info('Formato: usuario@dominio.com', 'Formato de email');
        break;
    }
  }

  // Método para limpiar espacios en blanco al inicio y final
  limpiarEspacios(event: any, campo: string): void {
    const valor = event.target.value.trim();
    event.target.value = valor;
    
    // Actualizar modelo según el campo
    if (this.isPersonaNatural) {
      switch (campo) {
        case 'nombres':
          this.datosPersonaNatural.nombres = valor;
          break;
        case 'apellidos':
          this.datosPersonaNatural.apellidos = valor;
          break;
        case 'email':
          this.datosPersonaNatural.email = valor;
          break;
        case 'direccion':
          this.datosPersonaNatural.direccion = valor;
          break;
      }
    } else {
      switch (campo) {
        case 'nombre':
          this.datosEmpresa.nombre = valor;
          break;
        case 'razonSocial':
          this.datosEmpresa.razonSocial = valor;
          break;
        case 'representanteLegal':
          this.datosEmpresa.representanteLegal = valor;
          break;
        case 'email':
          this.datosEmpresa.email = valor;
          break;
        case 'direccion':
          this.datosEmpresa.direccion = valor;
          break;
      }
    }
  }

  // Método para convertir a mayúsculas ciertos campos
  convertirAMayusculas(event: any, campo: string): void {
    const valor = event.target.value.toUpperCase();
    event.target.value = valor;
    
    if (campo === 'documento') {
      if (this.isPersonaNatural) {
        this.datosPersonaNatural.documento = valor;
      } else {
        this.datosEmpresa.documento = valor;
      }
    }
  }

  // Método para validar datos únicos (email, documento)
  validarDatosUnicos(): boolean {
    // Esta validación se puede hacer contra una base de datos
    // Por ahora solo verificamos formato
    return true;
  }

  // Método para mostrar resumen de validaciones
  mostrarResumenValidaciones(): void {
    const errores: string[] = [];
    
    if (this.isPersonaNatural) {
      if (!this.datosPersonaNatural.documento) errores.push('Documento');
      if (!this.datosPersonaNatural.nombres) errores.push('Nombres');
      if (!this.datosPersonaNatural.apellidos) errores.push('Apellidos');
      if (!this.datosPersonaNatural.email) errores.push('Email');
      if (!this.datosPersonaNatural.genero) errores.push('Género');
      if (!this.datosPersonaNatural.direccion) errores.push('Dirección');
    } else {
      if (!this.datosEmpresa.documento) errores.push('RUC');
      if (!this.datosEmpresa.nombre) errores.push('Nombre de empresa');
      if (!this.datosEmpresa.razonSocial) errores.push('Razón social');
      if (!this.datosEmpresa.representanteLegal) errores.push('Representante legal');
      if (!this.datosEmpresa.email) errores.push('Email');
      if (!this.datosEmpresa.direccion) errores.push('Dirección');
    }
    
    if (errores.length > 0) {
      this.toastr.error(`Campos faltantes: ${errores.join(', ')}`, 'Formulario incompleto');
    }
  }
}