import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { ValidacionService } from '../../../services/validacion.service';
import { AgendarOrdenMecanicoRequest } from '../../../../../domain/request/OrdenTrabajoRequest.model';
import { MecanicoService } from '../../../services/mecanico.service';
import { OrdenTrabajoService } from '../../../services/orden-trabajo.service';
import { AdjuntoService } from '../../../services/adjunto.service';
import { lastValueFrom } from 'rxjs';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Cliente } from '../../../../../domain/request/Cliente.model';
import { TipoVehiculoService } from '../../../services/tipo-vehiculo.service';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AddVehicleNoInstitucional } from '../../../../../domain/request/Vehiculo.model';
import { VehiculoService } from '../../../services/vehiculo.service';
import { ArchivosService } from '../../../services/archivos.service';

@Component({
  selector: 'app-agregar-orden-trabajo-mecanico',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Dialog,
    ButtonModule, 
    InputTextModule,
    DropdownModule,
    CalendarModule
    ],
  templateUrl: './agregar-orden-trabajo-mecanico.component.html',
  styleUrl: './agregar-orden-trabajo-mecanico.component.scss'
})
export class AgregarOrdenTrabajoMecanicoComponent implements OnInit{
  nombreUsuario: string = '';
  documento: string = '';
  clienteActual: any | null = null;
  mostrarInfoCliente: boolean = false;
  cargandoCliente: boolean = false;

  placa: string = '';
  vehiculoActual: any | null = null;
  mostrarInfoVehiculo: boolean = false;
  cargandoVehiculo: boolean = false;

  // Mecanicos disponibles
  mecanicos: any[] = [];
  cargandoMecanicos: boolean = false;
  
  // Estado de la creación de orden
  creandoOrden: boolean = false;
  
  // Datos de la orden
  ordenData: AgendarOrdenMecanicoRequest = {
    idUsuario: 1, // Valor fijo como solicitaste
    idCliente: 0,
    idVehiculo: 0,
    idMecanico: 0,
    detalle: '',
    prioridad: 0,
    estado: 0, // Valor fijo como solicitaste
    kilometraje: 0,
    observacion: '',
    fechaProgramada: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    fechaCreacion: new Date().toISOString()
  };

  // Variables para manejar imágenes
  imagenFrontal: File | null = null;
  imagenLateralIzquierda: File | null = null;
  imagenLateralDerecha: File | null = null;
  imagenTrasera: File | null = null;

  // Previsualizaciones
  previewFrontal: string | null = null;
  previewLateralIzquierda: string | null = null;
  previewLateralDerecha: string | null = null;
  previewTrasera: string | null = null;

  // Variables para drag & drop
  dragOverFrontal: boolean = false;
  dragOverLateralIzquierda: boolean = false;
  dragOverLateralDerecha: boolean = false;
  dragOverTrasera: boolean = false;

  // Estado de carga de imágenes
  cargandoImagenes: boolean = false;
  imagenesSubidas: number = 0;
  totalImagenes: number = 0;
  
  isPersonaNatural: boolean = true;
  mostrarCamposPersonaNatural: boolean = true;
  mostrarCamposEmpresa: boolean = false;
  mostrarTipoDocumento: boolean = true;

  mostrarPopupPropietario: boolean = false;
  visibleVehiculo: boolean = false;

  // Property to store vehicle types
  tipoVehiculo: any[] = [];
  tipoDocumento: string = 'cedula';

// Datos para el formulario
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

  visible: boolean = false;
  activeTab: string = 'informacion';
  mensajeExito: string = '';
  mensajeError: string = '';
  cargando: boolean = false;
  // En el componente .ts, agrega esta propiedad
  dialogStyle = {
    width: '680px', 
    maxWidth: '95vw',
    padding: 0,
    margin: 0,
    overflow: 'visible'
  };
  documentoVehiculo: string = '';
  clienteVehiculoActual: any = null;
  mostrarInfoClienteVehiculo: boolean = false;
  cargandoClienteVehiculo: boolean = false;
  errorClienteVehiculo: string = '';

  nuevoVehiculo: AddVehicleNoInstitucional = {
   idTipoVehiculo: 0,
  marca: '',
  modelo: '',
  version: null,            // Ahora es opcional
  placa: '',
  anio: 0,
  color: '',
  numeroChasis: null,       // Ahora es opcional
  numeroVehiculo: null,     // Ahora es opcional
  estado: 1,
  ultimoAnioMatriculacion: null, // Ahora es opcional
  ultimoAnioRTV: null,      // Ahora es opcional
  idCliente: 0,
  idLicencias: [],
  archivos: []
};
listaAnios: number[] = [];
cargandoRegistroVehiculo: boolean = false;
  constructor(
    private router: Router,
    private validacionService: ValidacionService,
    private toastr: ToastrService,
    private mecanicoService: MecanicoService,
    private ordenTrabajoService: OrdenTrabajoService,
    private adjuntoService : AdjuntoService,
    private clienteService: ClienteService,
    private tipoVehiculoService: TipoVehiculoService,
    private vehiculoService: VehiculoService,
    private archivoService : ArchivosService
  ) {}

  ngOnInit() {
    this.obtenerNombreUsuario();
    this.cargarSupervisores();
    this.GetTipoVehiculo();
    this.generarListaAnios();
  }
  generarListaAnios(): void {
  const anioActual = new Date().getFullYear();
  const anioInicio = anioActual - 30; // 30 años atrás
  
  this.listaAnios = [];
  for (let i = anioActual; i >= anioInicio; i--) {
    this.listaAnios.push(i);
  }
}
  cargarSupervisores() {
    this.cargandoMecanicos = true;
    this.mecanicoService.getSupervisores().subscribe({
      next: (data) => {
        this.mecanicos = data;
        this.cargandoMecanicos = false;
        
        if (this.mecanicos.length === 0) {
          this.toastr.warning('No se encontraron mecánicos disponibles', 'Advertencia');
        }
      },
      error: (error) => {
        console.error('Error al cargar mecánicos:', error);
        this.cargandoMecanicos = false;
        this.toastr.error('No se pudieron cargar los mecánicos', 'Error');
        this.mecanicos = [
          { idMecanico: 0, nombre: 'No se pudieron cargar mecánicos' }
        ];
      }
    });
  }
  
  obtenerNombreUsuario() {
    const usuarioGuardado = localStorage.getItem('currentUser');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        this.nombreUsuario = usuario.nombre || usuario.username || 'Usuario';
      } catch (e) {
        this.nombreUsuario = 'Usuario';
      }
    } else {
      this.nombreUsuario = 'Usuario';
    }
  }
  
  navegarInicio() {
    this.router.navigate(['/panel/mecanica']);
  }
  
  validarCliente() {
    if (!this.documento || this.documento.trim() === '') {
      this.toastr.warning('Por favor ingrese un documento válido', 'Advertencia');
      return;
    }
    this.cargandoCliente = true;
    this.mostrarInfoCliente = false;
    this.validacionService.validarClienteXDoc(this.documento)
      .subscribe({
        next: (respuesta) => {
          this.clienteActual = respuesta;
          this.mostrarInfoCliente = true;
          this.cargandoCliente = false;
          
          // Asignar idCliente a ordenData
          this.ordenData.idCliente = this.clienteActual.idPersona;
          
          if (this.clienteActual.esClienteActivo) {
            this.toastr.success('Cliente encontrado', 'Éxito');
          } else {
            this.toastr.info('El cliente existe pero no está activo', 'Información');
          }
        },
        error: (error) => {
          console.error('Error al validar el cliente:', error);
          this.cargandoCliente = false;
          if (error.status === 404) {
            this.toastr.warning('Cliente no encontrado', 'No existe');
          } else {
            this.toastr.error('Error al validar el cliente', 'Error');
          }
        }
      });
  }
  crearNuevoPropietario() {
    if (this.documento) {
      // Pre-llenamos el campo documento
      this.datosPersonaNatural.documento = this.documento;
      this.datosEmpresa.documento = this.documento;
    }
    this.mostrarPopupPropietario = true;
    this.activeTab = 'informacion'; // Reiniciamos a la primera pestaña
  }
  
validarVehiculo() {
  if (!this.placa || this.placa.trim() === '') {
    this.toastr.warning('Por favor ingrese una placa válida', 'Advertencia');
    return;
  }
  
  this.cargandoVehiculo = true;
  this.mostrarInfoVehiculo = false;
  
  // Limpiar previews de imágenes existentes
  this.limpiarPrevisualizaciones();
  
  this.validacionService.validarVehiculoXPlaca(this.placa)
    .subscribe({
      next: (respuesta) => {
        console.log('Respuesta de validación de vehículo:', respuesta);
        this.vehiculoActual = respuesta;
        this.mostrarInfoVehiculo = true;
        
        // Asignar idVehiculo a ordenData
        this.ordenData.idVehiculo = this.vehiculoActual.idVehiculo;
        
        // Cargar las imágenes del vehículo si tiene un ID válido
        if (this.vehiculoActual.idVehiculo) {
          this.cargarImagenesVehiculo(this.vehiculoActual.idVehiculo);
        }
        
        this.cargandoVehiculo = false;
        
        if (this.vehiculoActual.estado === 0) {
          this.toastr.success('Vehículo encontrado - Estado: Operativo', 'Éxito');
        } else if (this.vehiculoActual.estado === 1) {
          this.toastr.info('Vehículo encontrado - Estado: En Mantenimiento', 'Información');
        } else if (this.vehiculoActual.estado === 2) {
          this.toastr.warning('Vehículo encontrado - Estado: De Baja', 'Precaución');
        }
      },
      error: (error) => {
        console.error('Error al validar el vehículo:', error);
        this.cargandoVehiculo = false;
        
        if (error.status === 404) {
          this.toastr.warning('Vehículo no encontrado', 'No existe');
        } else {
          this.toastr.error('Error al validar el vehículo', 'Error');
        }
      }
    });
}
  crearNuevoVehiculo() {
    this.router.navigate(['/panel/mecanica/nuevo-vehiculo']);
  }
  validarDatosOrden(): boolean {
    if (!this.clienteActual || !this.vehiculoActual) {
      this.toastr.warning('Debe seleccionar un cliente y un vehículo antes de crear la orden', 'Datos incompletos');
      return false;
    }
    if (!this.ordenData.idMecanico) {
      this.toastr.warning('Debe seleccionar un mecánico', 'Datos incompletos');
      return false;
    }
    if (!this.ordenData.detalle || this.ordenData.detalle.trim() === '') {
      this.toastr.warning('Debe ingresar una descripción del mantenimiento', 'Datos incompletos');
      return false;
    }
    if (!this.ordenData.kilometraje || this.ordenData.kilometraje <= 0) {
      this.toastr.warning('Debe ingresar un kilometraje válido', 'Datos incompletos');
      return false;
    }
    if (!this.ordenData.fechaProgramada) {
      this.toastr.warning('Debe seleccionar una fecha programada', 'Datos incompletos');
      return false;
    }
    return true;
  }
  crearOrdenTrabajo() {
    if (!this.validarDatosOrden()) {
      return;
    }
    this.creandoOrden = true;
    this.ordenData.fechaCreacion = new Date().toISOString();
    console.log('Datos de la orden a enviar:', this.ordenData);
    this.ordenTrabajoService.agendarOrdenMecanico(this.ordenData).subscribe({
      next: async (response) => {
        console.log('Orden de trabajo creada:', response);
        this.toastr.success('Orden de trabajo creada exitosamente', 'Éxito');
        if (this.hayImagenesParaSubir()) {
          await this.subirImagenes();
        }
        this.creandoOrden = false;
      },
      error: (error) => {
        console.error('Error al crear la orden de trabajo:', error);
        this.creandoOrden = false;
        const errorMsg = error.error?.message || 'No se pudo crear la orden de trabajo';
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  onDrop(event: DragEvent, tipo: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.procesarArchivo(event.dataTransfer.files[0], tipo);
    }
  }
  onFileSelected(event: any, tipo: string): void {
    if (event.target.files && event.target.files.length > 0) {
      // Para imágenes capturadas con la cámara en dispositivos móviles
      // podríamos necesitar hacer alguna compresión aquí si las imágenes son muy grandes
      const file = event.target.files[0];
      
      // Si la imagen es muy grande (más de 5MB) y proviene de una cámara,
      // podríamos querer comprimirla antes de procesarla
      if (file.size > 5 * 1024 * 1024 && file.type.startsWith('image/')) {
        this.comprimirImagen(file, tipo);
      } else {
        this.procesarArchivo(file, tipo);
      }
    }
  }
  comprimirImagen(file: File, tipo: string): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Determinar el ancho y alto máximo (1200px es un buen balance para imágenes de autos)
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;
        
        // Calcular las nuevas dimensiones manteniendo la relación de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Crear un canvas para comprimirla
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a blob con calidad 0.85 (buen balance entre tamaño y calidad)
          canvas.toBlob((blob) => {
            if (blob) {
              // Crear un nuevo archivo a partir del blob
              const nuevoNombre = file.name.split('.')[0] + '_compressed.jpg';
              const archivoComprimido = new File([blob], nuevoNombre, { 
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              });
              
              // Procesar el archivo comprimido
              this.procesarArchivo(archivoComprimido, tipo);
              
              // Mostrar mensaje de que se comprimió la imagen
              this.toastr.info('La imagen ha sido comprimida para mejorar el rendimiento', 'Imagen optimizada');
            }
          }, 'image/jpeg', 0.85);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  procesarArchivo(file: File, tipo: string): void {
    if (!file.type.startsWith('image/')) {
      this.toastr.warning('Solo se permiten archivos de imagen (JPG, PNG, etc.)', 'Formato no válido');
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      this.toastr.warning('La imagen debe ser menor a 5MB', 'Archivo muy grande');
      return;
    }
    
    switch (tipo) {
      case 'frontal':
        this.imagenFrontal = file;
        break;
      case 'lateralIzquierda':
        this.imagenLateralIzquierda = file;
        break;
      case 'lateralDerecha':
        this.imagenLateralDerecha = file;
        break;
      case 'trasera':
        this.imagenTrasera = file;
        break;
    }
    this.generarPreview(file, tipo);
  }

  generarPreview(file: File, tipo: string): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      switch (tipo) {
        case 'frontal':
          this.previewFrontal = e.target.result;
          break;
        case 'lateralIzquierda':
          this.previewLateralIzquierda = e.target.result;
          break;
        case 'lateralDerecha':
          this.previewLateralDerecha = e.target.result;
          break;
        case 'trasera':
          this.previewTrasera = e.target.result;
          break;
      }
    };
    reader.readAsDataURL(file);
  }
  eliminarImagen(tipo: string): void {
    switch (tipo) {
      case 'frontal':
        this.imagenFrontal = null;
        this.previewFrontal = null;
        break;
      case 'lateralIzquierda':
        this.imagenLateralIzquierda = null;
        this.previewLateralIzquierda = null;
        break;
      case 'lateralDerecha':
        this.imagenLateralDerecha = null;
        this.previewLateralDerecha = null;
        break;
      case 'trasera':
        this.imagenTrasera = null;
        this.previewTrasera = null;
        break;
    }
  }
  hayImagenesParaSubir(): boolean {
    return !!(this.imagenFrontal || this.imagenLateralIzquierda || this.imagenLateralDerecha || this.imagenTrasera);
  }
  async subirImagenes(): Promise<boolean> {
    if (!this.vehiculoActual || !this.hayImagenesParaSubir()) {
      return true;
    }
    
    // Array de tuples [File, string] para mantener el tipo de imagen
    const imagenesConTipo: [File, string][] = [];
    if (this.imagenFrontal) imagenesConTipo.push([this.imagenFrontal, 'frontal']);
    if (this.imagenLateralIzquierda) imagenesConTipo.push([this.imagenLateralIzquierda, 'lateralIzquierda']);
    if (this.imagenLateralDerecha) imagenesConTipo.push([this.imagenLateralDerecha, 'lateralDerecha']);
    if (this.imagenTrasera) imagenesConTipo.push([this.imagenTrasera, 'trasera']);
    
    this.cargandoImagenes = true;
    this.imagenesSubidas = 0;
    this.totalImagenes = imagenesConTipo.length;
    
    try {
      for (const [imagen, tipo] of imagenesConTipo) {
        // Renombrar el archivo para incluir el tipo de imagen
        const tipoImagen = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const extensionArchivo = imagen.name.split('.').pop();
        const nuevoNombreArchivo = `${this.vehiculoActual.placa || 'vehiculo'}_${tipoImagen}.${extensionArchivo}`;
        
        // Crear un nuevo archivo con el nombre modificado
        const imagenRenombrada = new File(
          [imagen], 
          nuevoNombreArchivo, 
          { type: imagen.type }
        );
        
        await lastValueFrom(this.adjuntoService.createAdjunto(imagenRenombrada, this.vehiculoActual.idVehiculo));
        this.imagenesSubidas++;
      }
      
      this.toastr.success(`Se subieron ${this.imagenesSubidas} imágenes exitosamente`, 'Éxito');
      this.cargandoImagenes = false;
      return true;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      this.cargandoImagenes = false;
      if (this.imagenesSubidas > 0) {
        this.toastr.warning(`Se subieron ${this.imagenesSubidas} de ${this.totalImagenes} imágenes`, 'Advertencia');
        return true; // Consideramos éxito parcial
      } else {
        this.toastr.error('No se pudieron subir las imágenes', 'Error');
        return false;
      }
    }
  }
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  cerrarPopupPropietario() {
    this.visible = false;
    this.resetearFormulario();
  }
  

  toggleClienteType(isPersonaNatural: boolean): void {
    this.isPersonaNatural = isPersonaNatural;
    this.mostrarCamposPersonaNatural = isPersonaNatural;
    this.mostrarCamposEmpresa = !isPersonaNatural;
    this.activeTab = 'informacion';
    
    // Resetear tipo de documento según el tipo de persona
    if (isPersonaNatural) {
      this.tipoDocumento = 'cedula';
    } else {
      this.tipoDocumento = 'ruc';
    }
  }
  
  // Cambiar tipo de documento
  cambiarTipoDocumento(tipo: string): void {
    this.tipoDocumento = tipo;
  }
  
  // Resetear formulario
  resetearFormulario(): void {
    this.isPersonaNatural = true;
    this.mostrarCamposPersonaNatural = true;
    this.mostrarCamposEmpresa = false;
    this.tipoDocumento = 'cedula';
    this.activeTab = 'informacion';
    
    // Resetear datos de persona natural
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
    
    // Resetear datos de empresa
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
  
  prepararDatosCliente(): Cliente {
    const fechaActual = new Date().toISOString();
    
    if (this.isPersonaNatural) {
      // Para persona natural
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
        // Importante: Manejar correctamente el tipo de fechaNacimiento
        fechaNacimiento: this.datosPersonaNatural.fechaNacimiento ? 
          (typeof this.datosPersonaNatural.fechaNacimiento === 'string' ? 
           this.datosPersonaNatural.fechaNacimiento : 
           this.datosPersonaNatural.fechaNacimiento.toISOString()) : undefined,
        genero: this.datosPersonaNatural.genero === 'masculino' ? 'M' : 
          this.datosPersonaNatural.genero === 'femenino' ? 'F' : '',
        // Campos de empresa con valores por defecto para que no sean null/undefined
        razonSocial: '',
        idRepresentanteLegal: 0,
        representanteLegalNombre: '',
        obligadaContabilidad: false,
        esLocal: this.datosPersonaNatural.esLocal
      };
    } else {
      // Para empresa
      return {
        nombre: this.datosEmpresa.nombre,
        tipoPersona: 'E',
        tipoDocumento: 'R',
        documento: this.datosEmpresa.documento,
        email: this.datosEmpresa.email,
        celular: this.datosEmpresa.celular || '',
        telefono: this.datosEmpresa.telefono || '',
        direccion: this.datosEmpresa.direccion,
        // Campos para cumplir con el schema (pueden ir vacíos para empresas)
        apellidos: '',
        fechaNacimiento: undefined,
        genero: '',
        razonSocial: this.datosEmpresa.razonSocial,
        idRepresentanteLegal: 0, // Ajustar si tienes este dato
        representanteLegalNombre: this.datosEmpresa.representanteLegal,
        obligadaContabilidad: this.datosEmpresa.obligadaContabilidad,
        esLocal: this.datosEmpresa.esLocal
      };
    }
  }
// Validación mejorada con alertas Toast
validarFormulario(): boolean {
  // Validaciones para persona natural
  if (this.isPersonaNatural) {
    if (!this.datosPersonaNatural.documento) {
      this.toastr.warning('El número de documento es obligatorio', 'Campo requerido');
      return false;
    }
    
    // Validar formato de cédula
    if (this.tipoDocumento === 'cedula' && !/^\d{10}$/.test(this.datosPersonaNatural.documento)) {
      this.toastr.warning('La cédula debe tener 10 dígitos numéricos', 'Formato inválido');
      return false;
    }
    
    // Validar formato de pasaporte (alfanumérico, entre 6-12 caracteres)
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
    
    // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(this.datosPersonaNatural.email)) {
      this.toastr.warning('El formato del email no es válido', 'Formato inválido');
      return false;
    }
    
    if (!this.datosPersonaNatural.direccion) {
      this.toastr.warning('La dirección es obligatoria', 'Campo requerido');
      return false;
    }
  } 
  // Validaciones para empresa
  else {
    if (!this.datosEmpresa.documento) {
      this.toastr.warning('El número de RUC es obligatorio', 'Campo requerido');
      return false;
    }
    
    // Validar formato de RUC (13 dígitos)
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
    
    // Validar formato de email
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
registrarPropietario(): void {
  this.mensajeError = '';
  this.mensajeExito = '';
  
  if (!this.validarFormulario()) {
    return;
  }
  
  const cliente = this.prepararDatosCliente();
  this.cargando = true;
  
  // Depuración detallada
  console.log('Datos del cliente a registrar (objeto completo):', JSON.stringify(cliente, null, 2));
  
  this.clienteService.registrarCliente(cliente).subscribe({
    next: (respuesta) => {
      console.log('Respuesta del servidor:', respuesta);
      this.cargando = false;
      
      if (respuesta === 'Cliente registrado correctamente.' || 
          (typeof respuesta === 'object' && respuesta.success)) {
        this.toastr.success('Cliente registrado correctamente', 'Operación exitosa');
        
        // Actualizar documento y cerrar popup
        this.documento = cliente.documento;
        this.visible = false;
        
        // Cargar cliente después
        setTimeout(() => {
          this.validarCliente();
        }, 500);
      } else {
        this.toastr.warning(typeof respuesta === 'string' ? respuesta : 'Respuesta inesperada del servidor', 'Advertencia');
      }
    },
    error: (error) => {
      console.error('Error completo al registrar cliente:', error);
      this.cargando = false;
      
      // Analizar la respuesta para obtener más detalles
      let mensaje = 'Error al registrar el cliente';
      let titulo = 'Error';
      
      if (error.status === 400) {
        if (error.error && error.error.includes('ya existe')) {
          this.toastr.info('Este documento ya está registrado', 'Cliente existente');
          this.documento = cliente.documento;
          this.visible = false;
          setTimeout(() => this.validarCliente(), 500);
          return;
        }
        
        // Intentar extraer mensaje específico del error
        if (typeof error.error === 'object') {
          mensaje = JSON.stringify(error.error);
        } else if (typeof error.error === 'string') {
          mensaje = error.error;
        }
        titulo = 'Datos inválidos';
      } else if (error.status === 409) {
        mensaje = 'Ya existe un cliente con ese documento';
        titulo = 'Cliente duplicado';
      }
      
      this.toastr.error(mensaje, titulo);
    }
  });
}
// Para validación en tiempo real
validarCampo(tipo: string, campo: string, valor: any): void {
  // No mostrar errores mientras el usuario está escribiendo
  if (!valor || valor === '') return;
  
  switch (campo) {
    case 'documento':
      if (tipo === 'persona' && this.tipoDocumento === 'cedula') {
        if (!/^\d{10}$/.test(valor)) {
          this.toastr.warning('La cédula debe tener 10 dígitos numéricos', 'Formato inválido');
        }
      } else if (tipo === 'persona' && this.tipoDocumento === 'pasaporte') {
        if (!/^[A-Za-z0-9]{6,12}$/.test(valor)) {
          this.toastr.warning('El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos', 'Formato inválido');
        }
      } else if (tipo === 'empresa') {
        if (!/^\d{13}$/.test(valor)) {
          this.toastr.warning('El RUC debe tener 13 dígitos numéricos', 'Formato inválido');
        }
      }
      break;
      
    case 'email':
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(valor)) {
        this.toastr.warning('El formato del email no es válido', 'Formato inválido');
      }
      break;
      
    case 'telefono':
    case 'celular':
      if (valor && !/^[0-9]{7,10}$/.test(valor)) {
        this.toastr.warning(`El número de ${campo} debe tener entre 7 y 10 dígitos`, 'Formato inválido');
      }
      break;
  }
}
showDialog() {
  this.visible = true;
}
  GetTipoVehiculo(): void {
    this.tipoVehiculoService.getTiposVehiculo().subscribe({
      next: (data) => {
        this.tipoVehiculo = data;
      },
      error: (error) => {
        console.error('Error al cargar los tipos de vehículo:', error);
        this.toastr.error('No se pudieron cargar los tipos de vehículo', 'Error');
      }
    });
  }
abrirPopupVehiculo() {
  this.visibleVehiculo = true;
  // Reiniciar las variables
  this.documentoVehiculo = '';
  this.clienteVehiculoActual = null;
  this.mostrarInfoClienteVehiculo = false;
  this.errorClienteVehiculo = '';
  
  // Reiniciar el objeto del nuevo vehículo
  this.nuevoVehiculo = {
    idTipoVehiculo: 0,
    marca: '',
    modelo: '',
    version: '',
    placa: '',
    anio: 0,
    color: '',
    numeroChasis: '',
    numeroVehiculo: '', 
    estado: 1,  
    ultimoAnioMatriculacion: 0, 
    ultimoAnioRTV: 0, 
    idCliente: 0,
    idLicencias: [],
    archivos: []
  };
}
  cerrarPopupVehiculo(): void {
    this.visibleVehiculo = false;
  }
validarClienteVehiculo() {
  if (!this.documentoVehiculo || this.documentoVehiculo.trim() === '') {
    this.toastr.warning('Por favor ingrese un documento válido', 'Advertencia');
    return;
  }
  
  this.cargandoClienteVehiculo = true;
  this.mostrarInfoClienteVehiculo = false;
  this.errorClienteVehiculo = '';
  
  // Usar exactamente el mismo servicio y método que usas en validarCliente()
  this.validacionService.validarClienteXDoc(this.documentoVehiculo)
    .subscribe({
      next: (respuesta) => {
        this.clienteVehiculoActual = respuesta;
        this.mostrarInfoClienteVehiculo = true;
        this.cargandoClienteVehiculo = false;
        
        // También puedes asignar el cliente al vehículo aquí si lo necesitas
        // this.nuevoVehiculo.idCliente = this.clienteVehiculoActual.idPersona;
        
        if (this.clienteVehiculoActual.esClienteActivo) {
          this.toastr.success('Cliente encontrado', 'Éxito');
        } else {
          this.toastr.info('El cliente existe pero no está activo', 'Información');
        }
      },
      error: (error) => {
        console.error('Error al validar el cliente:', error);
        this.cargandoClienteVehiculo = false;
        this.clienteVehiculoActual = null;
        
        if (error.status === 404) {
          this.errorClienteVehiculo = 'Cliente no encontrado';
          this.toastr.warning('Cliente no encontrado', 'No existe');
        } else {
          this.errorClienteVehiculo = 'Error al validar el cliente';
          this.toastr.error('Error al validar el cliente', 'Error');
        }
      }
    });
}
registrarVehiculo() {
  // Validar campos obligatorios
  if (!this.clienteVehiculoActual) {
    this.toastr.warning('Debe validar un cliente primero', 'Advertencia');
    return;
  }

  if (!this.nuevoVehiculo.marca || !this.nuevoVehiculo.modelo || !this.nuevoVehiculo.color || 
      !this.nuevoVehiculo.anio || !this.nuevoVehiculo.idTipoVehiculo) {
    this.toastr.warning('Complete todos los campos obligatorios', 'Advertencia');
    return;
  }

  // Extraer solo los campos necesarios para la petición, omitiendo idVehiculo
  const vehiculoParaEnviar = {
    idTipoVehiculo: this.nuevoVehiculo.idTipoVehiculo,
    marca: this.nuevoVehiculo.marca,
    modelo: this.nuevoVehiculo.modelo,
    version: this.nuevoVehiculo.version,
    placa: this.nuevoVehiculo.placa,
    anio: this.nuevoVehiculo.anio,
    color: this.nuevoVehiculo.color,
    numeroChasis: this.nuevoVehiculo.numeroChasis,
    numeroVehiculo: null,  // Usa null en vez de string vacío
    estado: this.nuevoVehiculo.estado,
    idCliente: this.clienteVehiculoActual.idPersona,
    idLicencias: this.nuevoVehiculo.idLicencias || null,
    archivos: this.nuevoVehiculo.archivos || null,
    ultimoAnioMatriculacion: this.nuevoVehiculo.ultimoAnioMatriculacion || 0, // Add this property
    ultimoAnioRTV: this.nuevoVehiculo.ultimoAnioRTV || 0 // Add this property
  };
  
  // Conversión segura para años (usando null si no hay valor)
  if (this.nuevoVehiculo.ultimoAnioMatriculacion !== null) {
    vehiculoParaEnviar.ultimoAnioMatriculacion = Number(this.nuevoVehiculo.ultimoAnioMatriculacion) || 0;
  }
  
  if (this.nuevoVehiculo.ultimoAnioRTV !== null) {
    vehiculoParaEnviar.ultimoAnioRTV = Number(this.nuevoVehiculo.ultimoAnioRTV) || 0;
  }
  
  this.cargandoRegistroVehiculo = true;
  console.log('Datos del vehículo a registrar:', vehiculoParaEnviar);
  
  this.vehiculoService.postVehicleNoInstitucional(vehiculoParaEnviar)
    .subscribe({
      next: (respuesta) => {
        console.log('Respuesta del servidor:', respuesta);
        this.cargandoRegistroVehiculo = false;
        
        if (respuesta === 'Vehículo registrado correctamente.' || 
            (typeof respuesta === 'object' && respuesta.success)) {
          this.toastr.success('Vehículo registrado correctamente', 'Éxito');
          this.visibleVehiculo = false;
          this.resetearFormulario();
          
          // Si deseas usar la placa del vehículo recién creado
          if (respuesta.placa) {
            this.placa = respuesta.placa;
            this.validarVehiculo();
          }
        } else {
          this.toastr.warning(typeof respuesta === 'string' ? respuesta : 'Respuesta inesperada del servidor', 'Advertencia');
        }
      },
      error: (error) => {
        console.error('Error al registrar vehículo:', error);
        this.cargandoRegistroVehiculo = false;
        
        if (error.error && typeof error.error === 'string') {
          this.toastr.error(error.error, 'Error');
        } else {
          this.toastr.error('Error al registrar el vehículo', 'Error');
        }
      }
    });
}
limpiarPrevisualizaciones(): void {
  this.previewFrontal = null;
  this.previewLateralIzquierda = null;
  this.previewLateralDerecha = null;
  this.previewTrasera = null;
  
  // También limpiar los archivos
  this.imagenFrontal = null;
  this.imagenLateralIzquierda = null;
  this.imagenLateralDerecha = null;
  this.imagenTrasera = null;
}

// Método para cargar imágenes del vehículo
cargarImagenesVehiculo(idVehiculo: number) {
  this.adjuntoService.getAdjuntosByVehiculo(idVehiculo)
    .subscribe({
      next: (adjuntos) => {
        console.log('Adjuntos del vehículo:', adjuntos);
        if (adjuntos && adjuntos.length > 0) {
          // Procesar cada adjunto
          adjuntos.forEach(adjunto => {
            if (adjunto.ruta) {
              // Obtener el nombre del archivo desde la ruta
              const fileName = adjunto.ruta.split('/').pop() || '';
              
              // Llamar al servicio para obtener el archivo físico
              this.archivoService.getArchivo(fileName)
                .subscribe({
                  next: (blob) => {
                    // Crear una URL para el blob
                    const objectURL = URL.createObjectURL(blob);
                    
                    // Asignar la imagen según el nombre o tipo
                    this.asignarImagenSegunTipo(adjunto, objectURL);
                  },
                  error: (error) => {
                    console.error(`Error al obtener el archivo ${fileName}:`, error);
                  }
                });
            }
          });
          
          // Informar al usuario
          this.toastr.info(`Se han encontrado ${adjuntos.length} imágenes del vehículo`, 'Imágenes cargadas');
        }
      },
      error: (error) => {
        console.error('Error al obtener adjuntos del vehículo:', error);
        this.toastr.warning('No se pudieron cargar las imágenes del vehículo', 'Advertencia');
      }
    });
}

// Método para asignar la imagen a su ubicación correspondiente
asignarImagenSegunTipo(adjunto: any, objectURL: string): void {
  const nombreLowerCase = adjunto.nombre.toLowerCase();
  
  if (nombreLowerCase.includes('frontal')) {
    this.previewFrontal = objectURL;
  } else if (nombreLowerCase.includes('lateral') && nombreLowerCase.includes('izq')) {
    this.previewLateralIzquierda = objectURL;
  } else if (nombreLowerCase.includes('lateral') && !nombreLowerCase.includes('izq')) {
    this.previewLateralDerecha = objectURL;
  } else if (nombreLowerCase.includes('trasera') || nombreLowerCase.includes('posterior')) {
    this.previewTrasera = objectURL;
  } else {
    // Si no se puede determinar el tipo por el nombre, asignar a la primera vista previa disponible
    if (!this.previewFrontal) {
      this.previewFrontal = objectURL;
    } else if (!this.previewLateralIzquierda) {
      this.previewLateralIzquierda = objectURL;
    } else if (!this.previewLateralDerecha) {
      this.previewLateralDerecha = objectURL;
    } else if (!this.previewTrasera) {
      this.previewTrasera = objectURL;
    }
  }
}

// Método auxiliar para obtener el nombre del archivo de una ruta
obtenerNombreArchivo(ruta: string): string {
  if (!ruta) return '';
  return ruta.split('/').pop() || '';
}
}