import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { ValidacionService } from '../../../services/validacion.service';
import { AgendarOrdenMecanicoRequest } from '../../../../../domain/request/OrdenTrabajoRequest.model';
import { MecanicoService } from '../../../services/mecanico.service';
import { OrdenTrabajoService } from '../../../services/orden-trabajo.service';
import { AdjuntoService } from '../../../services/adjunto.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../auth/service/auth.service';
import { RegistroClienteComponent } from '../../../../shared/components/registro-cliente/registro-cliente.component';
import { RegistroVehiculoComponent } from '../../../../shared/components/registro-vehiculo/registro-vehiculo.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthMecanicaComponent } from '../../../auth/components/auth-mecanica/auth-mecanica.component';

@Component({
  selector: 'app-agregar-orden-trabajo-mecanico',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule, 
    InputTextModule,
    DropdownModule,
    CalendarModule,
    ConfirmDialogModule,
    RegistroClienteComponent,
    RegistroVehiculoComponent
    ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './agregar-orden-trabajo-mecanico.component.html',
  styleUrl: './agregar-orden-trabajo-mecanico.component.scss'
})
export class AgregarOrdenTrabajoMecanicoComponent implements OnInit{
  // En registro-cliente.component.ts
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  NameIdentifier: any;

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
  
  mostrarPopupPropietario: boolean = false;
  visibleVehiculo: boolean = false;

  // Property to store vehicle types
  tipoVehiculo: any[] = [];


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
dialogRef: DynamicDialogRef | undefined; // Referencia al diálogo de autenticación
listaAnios: number[] = [];
cargandoRegistroVehiculo: boolean = false;
idAdjuntoFrontal: number | null = null;
idAdjuntoLateralIzquierda: number | null = null;
idAdjuntoLateralDerecha: number | null = null;
idAdjuntoTrasera: number | null = null;
mostrarDialogRegistroCliente: boolean = false;
mensajeError: any;
mensajeExito: any;
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
    private archivoService : ArchivosService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.obtenerNombreUsuario();
    this.cargarSupervisores();
    this.GetTipoVehiculo();
    this.NameIdentifier = this.authService.getNameIdentifier();
  }

  cargarSupervisores() {
    this.cargandoMecanicos = true;
    this.mecanicoService.getSupervisoresMec().subscribe({
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
    this.validacionService.validarClienteXDocMec(this.documento)
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
        error: (error: any) => {
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

validarVehiculo() {
  if (!this.placa || this.placa.trim() === '') {
    this.toastr.warning('Por favor ingrese una placa válida', 'Advertencia');
    return;
  }
  
  this.cargandoVehiculo = true;
  this.mostrarInfoVehiculo = false;
  
  // Limpiar previews de imágenes existentes
  this.limpiarPrevisualizaciones();
  
  this.validacionService.validarVehiculoXPlacaMec(this.placa)
    .subscribe({
      next: (respuesta) => {
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
  async crearOrdenTrabajo() {
    if (!this.validarDatosOrden()) return;

    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: { accion: 'CrearOrdenDeTrabajo' }
    });

    dialogRef.onClose.subscribe(async (result: { acceso: boolean }) => {
      if (result?.acceso) {
        this.creandoOrden = true;
        this.ordenData.fechaCreacion = new Date().toISOString();

        try {
          const response = await firstValueFrom(this.ordenTrabajoService.agendarOrdenMecanico(this.ordenData));
          this.toastr.success('Orden de trabajo creada exitosamente', 'Éxito');

          if (this.hayImagenesParaSubir()) {
            await this.subirImagenes(); // se asegura que las imágenes se suban antes de continuar
          }

          this.creandoOrden = false;
          this.router.navigate([`/mecanica/${response.codigo}`]); // solo se ejecuta después
        } catch (error) {
          console.error('Error al crear la orden de trabajo:', error);
          this.toastr.error('No se pudo crear la orden de trabajo', 'Error');
          this.creandoOrden = false;
        }
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
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
  let idAdjunto: number | null = null;
  let tipoImagen = '';
  
  // Determinar qué imagen y ID se están eliminando
  switch (tipo) {
    case 'frontal':
      idAdjunto = this.idAdjuntoFrontal;
      tipoImagen = 'frontal';
      break;
    case 'lateralIzquierda':
      idAdjunto = this.idAdjuntoLateralIzquierda;
      tipoImagen = 'lateral izquierda';
      break;
    case 'lateralDerecha':
      idAdjunto = this.idAdjuntoLateralDerecha;
      tipoImagen = 'lateral derecha';
      break;
    case 'trasera':
      idAdjunto = this.idAdjuntoTrasera;
      tipoImagen = 'trasera';
      break;
  }
  
  // Si hay un ID de adjunto, mostrar confirmación
  if (idAdjunto) {
    this.confirmationService.confirm({
      message: `Esta acción no se puede deshacer. ¿Desea eliminar la imagen ${tipoImagen}?`,
      header: 'Confirmación para eliminar imagen',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Sí, eliminar imagen',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.toastr.info('Procesando su solicitud...', 'Eliminando imagen');
        
        // Llamar al servicio para eliminar el adjunto
        this.adjuntoService.eliminarAdjuntoCompleto(idAdjunto).subscribe({
          next: (respuesta) => {
            // Si la eliminación fue exitosa
            if (respuesta) {
              this.toastr.success(`Imagen ${tipoImagen} eliminada correctamente`, 'Éxito');
              
              // Limpiar la vista previa y el ID según el tipo
              switch (tipo) {
                case 'frontal':
                  this.previewFrontal = null;
                  this.idAdjuntoFrontal = null;
                  this.imagenFrontal = null;
                  break;
                case 'lateralIzquierda':
                  this.previewLateralIzquierda = null;
                  this.idAdjuntoLateralIzquierda = null;
                  this.imagenLateralIzquierda = null;
                  break;
                case 'lateralDerecha':
                  this.previewLateralDerecha = null;
                  this.idAdjuntoLateralDerecha = null;
                  this.imagenLateralDerecha = null;
                  break;
                case 'trasera':
                  this.previewTrasera = null;
                  this.idAdjuntoTrasera = null;
                  this.imagenTrasera = null;
                  break;
              }
            } else {
              this.toastr.error(`No se pudo eliminar la imagen ${tipoImagen}`, 'Error');
            }
          },
          error: (error) => {
            console.error('Error al eliminar el adjunto:', error);
            
            if (error.status === 400) {
              this.toastr.error(`No se puede eliminar esta imagen. Verifique que no esté en uso`, 'Error');
            } else if (error.status === 401 || error.status === 403) {
              this.toastr.error('No tiene permisos para realizar esta acción', 'Error de autorización');
            } else if (error.status === 404) {
              this.toastr.error('No se encontró la imagen especificada', 'Error');
            } else {
              this.toastr.error(`Error al eliminar la imagen ${tipoImagen}: ` + (error.error?.mensaje || error.message), 'Error');
            }
          }
        });
      }
    });
  } else {
    // Si no hay ID de adjunto (imagen local), solo eliminar la vista previa
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
}
 hayImagenesParaSubir(): boolean {
  return !!(
    (this.imagenFrontal && !this.idAdjuntoFrontal) || 
    (this.imagenLateralIzquierda && !this.idAdjuntoLateralIzquierda) || 
    (this.imagenLateralDerecha && !this.idAdjuntoLateralDerecha) || 
    (this.imagenTrasera && !this.idAdjuntoTrasera)
  );
}
async subirImagenes(): Promise<boolean> {
  if (!this.vehiculoActual) {
    return true;
  }
  
  // Array de tuples [File, string] para mantener el tipo de imagen, solo las nuevas
  const imagenesConTipo: [File, string][] = [];
  
  // Solo incluir las imágenes que no tienen ya un ID de adjunto (son nuevas)
  if (this.imagenFrontal && !this.idAdjuntoFrontal) {
    imagenesConTipo.push([this.imagenFrontal, 'frontal']);
  }
  if (this.imagenLateralIzquierda && !this.idAdjuntoLateralIzquierda) {
    imagenesConTipo.push([this.imagenLateralIzquierda, 'lateralIzquierda']);
  }
  if (this.imagenLateralDerecha && !this.idAdjuntoLateralDerecha) {
    imagenesConTipo.push([this.imagenLateralDerecha, 'lateralDerecha']);
  }
  if (this.imagenTrasera && !this.idAdjuntoTrasera) {
    imagenesConTipo.push([this.imagenTrasera, 'trasera']);
  }
  
  // Si no hay imágenes nuevas para subir, retornar éxito
  if (imagenesConTipo.length === 0) {
    return true;
  }
  
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
      
      // Subir la imagen y obtener la respuesta
      const respuesta = await lastValueFrom(this.adjuntoService.createAdjunto(imagenRenombrada, this.vehiculoActual.idVehiculo));
      
      // Si la respuesta contiene el ID del adjunto, actualizarlo en el componente
      if (respuesta && respuesta.idAdjunto) {
        switch (tipo) {
          case 'frontal':
            this.idAdjuntoFrontal = respuesta.idAdjunto;
            break;
          case 'lateralIzquierda':
            this.idAdjuntoLateralIzquierda = respuesta.idAdjunto;
            break;
          case 'lateralDerecha':
            this.idAdjuntoLateralDerecha = respuesta.idAdjunto;
            break;
          case 'trasera':
            this.idAdjuntoTrasera = respuesta.idAdjunto;
            break;
        }
      }
      
      this.imagenesSubidas++;
    }
    
    if (this.imagenesSubidas > 0) {
      this.toastr.success(`Se subieron ${this.imagenesSubidas} imágenes nuevas exitosamente`, 'Éxito');
    }
    
    this.cargandoImagenes = false;
    return true;
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    this.cargandoImagenes = false;
    
    if (this.imagenesSubidas > 0) {
      this.toastr.warning(`Se subieron ${this.imagenesSubidas} de ${this.totalImagenes} imágenes nuevas`, 'Advertencia');
      return true; // Consideramos éxito parcial
    } else {
      this.toastr.error('No se pudieron subir las imágenes nuevas', 'Error');
      return false;
    }
  }
}
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
  
  // Limpiar IDs de adjuntos
  this.idAdjuntoFrontal = null;
  this.idAdjuntoLateralIzquierda = null;
  this.idAdjuntoLateralDerecha = null;
  this.idAdjuntoTrasera = null;
}

// Método para cargar imágenes del vehículo
cargarImagenesVehiculo(idVehiculo: number) {
  this.adjuntoService.getAdjuntosByVehiculoMec(idVehiculo)
    .subscribe({
      next: (adjuntos) => {
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
    this.idAdjuntoFrontal = adjunto.idAdjunto;
  } else if (nombreLowerCase.includes('lateral') && nombreLowerCase.includes('izq')) {
    this.previewLateralIzquierda = objectURL;
    this.idAdjuntoLateralIzquierda = adjunto.idAdjunto;
  } else if (nombreLowerCase.includes('lateral') && !nombreLowerCase.includes('izq')) {
    this.previewLateralDerecha = objectURL;
    this.idAdjuntoLateralDerecha = adjunto.idAdjunto;
  } else if (nombreLowerCase.includes('trasera') || nombreLowerCase.includes('posterior')) {
    this.previewTrasera = objectURL;
    this.idAdjuntoTrasera = adjunto.idAdjunto;
  } else {
    // Si no se puede determinar el tipo por el nombre, asignar a la primera vista previa disponible
    if (!this.previewFrontal) {
      this.previewFrontal = objectURL;
      this.idAdjuntoFrontal = adjunto.idAdjunto;
    } else if (!this.previewLateralIzquierda) {
      this.previewLateralIzquierda = objectURL;
      this.idAdjuntoLateralIzquierda = adjunto.idAdjunto;
    } else if (!this.previewLateralDerecha) {
      this.previewLateralDerecha = objectURL;
      this.idAdjuntoLateralDerecha = adjunto.idAdjunto;
    } else if (!this.previewTrasera) {
      this.previewTrasera = objectURL;
      this.idAdjuntoTrasera = adjunto.idAdjunto;
    }
  }
}

// Método auxiliar para obtener el nombre del archivo de una ruta
obtenerNombreArchivo(ruta: string): string {
  if (!ruta) return '';
  return ruta.split('/').pop() || '';
}
retirarVehiculo() {
  this.confirmationService.confirm({
    message: '¿Está seguro que desea retirar este vehículo? Se limpiarán todos los datos asociados.',
    header: 'Confirmación para retirar vehículo',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, retirar vehículo',
    rejectLabel: 'Cancelar',
    accept: () => {
      // Limpiar datos del vehículo
      this.vehiculoActual = null;
      this.mostrarInfoVehiculo = false;
      this.placa = '';
      
      // Limpiar imágenes
      this.limpiarPrevisualizaciones();
      
      // Limpiar ID de vehículo en ordenData
      this.ordenData.idVehiculo = 0;
      
      // Notificar al usuario
      this.toastr.info('Se ha retirado el vehículo', 'Información');
    }
  });
}
 crearNuevoPropietario() {
    this.mostrarDialogRegistroCliente = true;
  }

  onClienteRegistrado(evento: { documento: string, cliente: any }) {
    this.documento = evento.documento;
    
    // Dar un delay para que el backend procese el registro
    setTimeout(() => {
      this.validarCliente();
    }, 500);
  }

  onCerrarDialogCliente() {
    this.mostrarDialogRegistroCliente = false;
  }
  onVehiculoRegistrado(placa: string) {
  this.placa = placa;
  this.validarVehiculo();
  }
}