import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EstadoTarea } from '../../../shared/util/genericData';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ItemService } from '../../../services/item.service';
import { MecanicoService } from '../../../services/mecanico.service';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthMecanicaComponent } from '../../../auth/components/auth-mecanica/auth-mecanica.component';
import { ToastrService } from 'ngx-toastr';
import { MagnitudService } from '../../../services/magnitud.service';
import { TareasService } from '../../../services/tareas.service';
import { SolicitudService } from '../../../services/solicitud.service';
import { AdjuntoService } from '../../../services/adjunto.service';
import { AuthService } from '../../../auth/service/auth.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-crud-tarea-mecanica',
  imports: [
    CommonModule,
    FormsModule,
    RadioButtonModule,
    InputTextModule,
    FloatLabelModule,
    InputNumberModule,
    SelectModule,
    DividerModule,
    ButtonModule,
    Dialog,
    TableModule,
    CheckboxModule,
    InputTextModule
  ],
  providers: [ItemService, DialogService],
  templateUrl: './crud-tarea-mecanica.component.html',
  styleUrl: './crud-tarea-mecanica.component.scss'
})
export class CrudTareaMecanicaComponent implements OnInit{
  
  @Input() codigoOT: any;
  @Input() action: 'agregar' | 'editar' | 'eliminar' = 'agregar';
  @Input() color: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  //dialog repuestos
  displayAddDialogRepuestos: boolean = false;
  displayEditDialogRepuestos: boolean = false;
  allItemsRepuestos: any[] = [];

  selectedItemId: any | null = null;
  cantidadSeleccionada: number | null = null;
  editingRepuesto: { idItem: number; cantidad: number } = { idItem: 0, cantidad: 0 };

  //dialog mecanicos
  allMecanicos: any[] = [];

  displayDialogMecanicos: boolean = false;
  selectedMecanicoId: number | null = null;
  duracionEstimada: number | null = null;

  displayEditMecanico: boolean = false;
  editingMecanico: { idMecanico: number; duracion: number } = { idMecanico: 0, duracion: 0 };

  //header dialog
  header_dialog: string = '';
  
  //formulario
  tipo_tarea: 'interna' | 'externa' = 'interna';
  tipo_mantenimiento: 'preventivo' | 'correctivo' = 'preventivo';
  //formulario interna
  detalleTarea: string = '';
  duracion_tarea: number = 0;
  estado_tarea: any = EstadoTarea[0].code;
  requ_auth: boolean = true;
  requ_repuestos: boolean = true;
  list_repuestos: { idItem: number; cantidad: number }[] = [];
  list_mecanicos: { idMecanico: number; duracionEstimada: number }[] = [];

  estados_tarea!: any [];
  
  //Dialgo Dinamic
  dialogRef: DynamicDialogRef | undefined;
  tipoItemSeleccionado: 'repuesto' | 'insumo' = 'repuesto';
  allItemsInsumos: any[] = [];
  allItemsActual: any[] = []; 
  loadingItems: boolean = false;
  // Variables para magnitudes
  magnitudesCompatibles: any[] = [];
  magnitudOrigen: any = null;
  selectedMagnitudId: number | null = null;
  loadingMagnitudes: boolean = false;
  mostrarMagnitudes: boolean = false;

  solicitudRepuesto: boolean = false;
  displaySolicitudRepuestoDialog: boolean = false;
  datosSolicitudRepuesto = {
    detalle: '',
    archivo: null as File | null,
    archivoNombre: '',
    idAdjunto: null as number | null
  };
  constructor(
    private itemService: ItemService,
    private mecanicoService: MecanicoService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private tareaService: TareasService,
    private magnitudService: MagnitudService,
    private solicitudService: SolicitudService,
    private adjuntoService: AdjuntoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initData();
  }

initData(){
  this.estados_tarea = EstadoTarea;
  
  // Cargar repuestos por defecto
  this.itemService.getItemsTipoRespuestoMec().subscribe({
    next: (items : any) => {
      this.allItemsRepuestos = items;
      this.allItemsActual = items; // Por defecto mostrar repuestos
    }
  });
  
  // Cargar insumos también
  this.itemService.getItemsTipoInsumoMec().subscribe({
    next: (items : any) => {
      this.allItemsInsumos = items;
    }
  });
  
  this.mecanicoService.getMecanicos().subscribe({
    next: (mecanicos: any) => {
      this.allMecanicos = mecanicos;
    },
    error: (error) => {
      console.error('Error al cargar mecánicos:', error);
    }
  })
  this.headerDialog();
}
onTipoItemChange() {
  this.loadingItems = true;
  this.selectedItemId = null; 
  this.mostrarMagnitudes = false;
  this.magnitudesCompatibles = [];
  this.selectedMagnitudId = null;
  
  if (this.tipoItemSeleccionado === 'repuesto') {
    this.allItemsActual = this.allItemsRepuestos;
    this.loadingItems = false;
  } else {
    this.allItemsActual = this.allItemsInsumos;
    this.loadingItems = false;
  }
}
onItemSelectionChange(itemId: number) {
  
  this.selectedItemId = itemId;
  
  if (this.tipoItemSeleccionado === 'insumo' && itemId) {
    
    this.loadingMagnitudes = true;
    this.mostrarMagnitudes = true;
    
    this.magnitudService.GetMagnitudCompatibleByItemMec(itemId).subscribe({
      next: (response: any) => {
        this.magnitudOrigen = response.magnitudOrigen;
        this.magnitudesCompatibles = response.magnitudesCompatibles;
        
        const todasLasMagnitudes = [
          response.magnitudOrigen,
          ...response.magnitudesCompatibles
        ];
        this.magnitudesCompatibles = todasLasMagnitudes;
        
        this.selectedMagnitudId = response.magnitudOrigen.idMagnitud;
        
        this.loadingMagnitudes = false;
      },
      error: (error) => {
        console.error('Error al cargar magnitudes:', error);
        this.loadingMagnitudes = false;
        this.mostrarMagnitudes = false;
        this.toastr.error('Error al cargar las magnitudes disponibles', 'Error');
      }
    });
  } else {
    this.mostrarMagnitudes = false;
    this.magnitudesCompatibles = [];
    this.selectedMagnitudId = null;
  }
}
agregarTarea() {
    // Validaciones mínimas
    if (!this.detalleTarea || this.duracion_tarea <= 0) {
      this.toastr.error('Los campos Detalle de Tarea y Duración son obligatorios.', 'Error de validación');
      return;
    }

    // Validar que tenga mecánicos asignados
    if (this.list_mecanicos.length === 0) {
      this.toastr.error('Debe asignar al menos un mecánico a la tarea.', 'Error de validación');
      return;
    }

    this.dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false, 
      closable: false,
      data: {
        accion: 'AgregarTareaOT'
      }
    });

    this.dialogRef.onClose.subscribe((result: { acceso: boolean, id: number | null, token: any }) => {
      if (result.acceso && result.id) {
        
        // Decidir si crear tarea normal o con solicitud
        if (this.solicitudRepuesto) {
          this.crearTareaConSolicitud(result);
        } else {
          this.crearTareaNormal(result);
        }
          
      } else {
        this.toastr.error('Código incorrecto o no se pudo obtener el ID del usuario', 'Error');
      }
    });
  }

// ✅ MÉTODO PARA TAREAS NORMALES - CORREGIDO
crearTareaNormal(result: { acceso: boolean, id: number | null, token: any }) {
  
  // ✅ VALIDAR CONSISTENCIA DE REPUESTOS
  const tieneRepuestos = this.list_repuestos.length > 0;
  const requiereRepuestos = this.requ_repuestos;

  // Si el usuario marcó que requiere repuestos pero no agregó ninguno
  if (requiereRepuestos && !tieneRepuestos) {
    this.toastr.warning('Has marcado que requiere repuestos pero no has agregado ninguno', 'Advertencia');
    return;
  }

  // ✅ PREPARAR REPUESTOS CON VALIDACIÓN DE TIPOS
  const repuestosFormateados = this.list_repuestos.map(repuesto => ({
    idItem: Number(repuesto.idItem),
    cantidad: Number(repuesto.cantidad)
  }));

  // ✅ PREPARAR MECÁNICOS CON VALIDACIÓN DE TIPOS
  const mecanicosFormateados = this.list_mecanicos.map(mecanico => ({
    idMecanico: Number(mecanico.idMecanico),
    duracionEstimada: Number(mecanico.duracionEstimada)
  }));

  // ✅ PREPARAR DATOS DE LA TAREA - FORMATO CORRECTO
  const nuevaTarea = {
    codigoOrdenTrabajo: this.codigoOT,
    idUsuario: Number(result.id), // ✅ CORRECTO: usar idUsuario en lugar de idMecanico
    detalle: this.detalleTarea.trim(),
    estado: Number(this.estado_tarea),
    esManual: true,
    requiereRepuesto: tieneRepuestos, // ✅ Basado en si realmente tiene repuestos
    requiereServicioExterno: this.tipo_tarea === 'externa' ? true : false,
    requiereAutorizacion: this.requ_auth,
    tipoMantenimiento: this.tipo_mantenimiento === 'preventivo' ? true : false,
    duracion: Number(this.duracion_tarea),
    mecanicos: mecanicosFormateados,
    repuestos: repuestosFormateados,
  };

  this.tareaService.createTarea(nuevaTarea, result.token).subscribe({
    next: (response) => {
      this.toastr.success('Tarea creada correctamente', 'Éxito');
      this.resetForm();
    },
    error: (error) => {
      // ✅ MOSTRAR ERRORES DE VALIDACIÓN ESPECÍFICOS
      if (error.error?.errors) {
        console.error('❌ Errores de validación:', error.error.errors);
        
        // Mostrar cada error de validación
        Object.keys(error.error.errors).forEach(campo => {
          const errores = error.error.errors[campo];
          console.error(`❌ Campo "${campo}":`, errores);
          
          // Mostrar el primer error de cada campo
          if (Array.isArray(errores) && errores.length > 0) {
            this.toastr.error(`${campo}: ${errores[0]}`, 'Error de validación');
          }
        });
      } else if (error.error?.message) {
        console.error('❌ Mensaje de error:', error.error.message);
        this.toastr.error(error.error.message, 'Error del servidor');
      } else {
        this.toastr.error('Error al crear la tarea', 'Error');
      }
    }
  });
}

// ✅ MÉTODO PARA TAREAS CON SOLICITUD DE REPUESTO - TAMBIÉN CORREGIDO
async crearTareaConSolicitud(authResult: { acceso: boolean, id: number | null, token: any }) {
  try {
    // Buscar el estado "Espera repuesto" 
    const estadoEsperaRepuesto = this.estados_tarea.find(estado => 
      estado.name.toLowerCase().includes('espera') && 
      estado.name.toLowerCase().includes('repuesto')
    );
    const estadoTarea = estadoEsperaRepuesto ? estadoEsperaRepuesto.code : 6; // Fallback

    // ✅ PREPARAR MECÁNICOS CON VALIDACIÓN DE TIPOS
    const mecanicosFormateados = this.list_mecanicos.map(mecanico => ({
      idMecanico: Number(mecanico.idMecanico),
      duracionEstimada: Number(mecanico.duracionEstimada)
    }));

    const nuevaTarea = {
      codigoOrdenTrabajo: this.codigoOT,
      idUsuario: Number(authResult.id), 
      detalle: this.detalleTarea.trim(),
      estado: estadoTarea,
      esManual: true,
      requiereRepuesto: true, 
      requiereServicioExterno: this.tipo_tarea === 'externa' ? true : false,
      requiereAutorizacion: this.requ_auth,
      tipoMantenimiento: this.tipo_mantenimiento === 'preventivo' ? true : false,
      duracion: Number(this.duracion_tarea),
      mecanicos: mecanicosFormateados,
      repuestos: [],
    };
    
    // Crear la tarea primero
    this.tareaService.createTarea(nuevaTarea, authResult.token).subscribe({
      next: async (tareaResponse) => {
        this.toastr.success('Tarea creada correctamente', 'Éxito');

        const idTarea = tareaResponse.idTareaOt || 
                       tareaResponse.id || 
                       tareaResponse.idTarea || 
                       tareaResponse.codigoTarea ||
                       tareaResponse.IdTareaOT ||
                       tareaResponse.IdTarea ||
                       tareaResponse.tareaId ||
                       tareaResponse.ID ||
                       tareaResponse.Id ||
                       tareaResponse.identificador ||
                       tareaResponse.codigo;


        if (idTarea) {
          // Crear la solicitud de repuesto
          await this.crearSolicitudRepuesto(idTarea);
        } else {
          this.toastr.error('No se pudo crear la solicitud de repuesto: ID de tarea no encontrado', 'Error');
        }
        
        this.resetForm();
      },
      error: (error) => {
        this.toastr.error('Error al crear la tarea', 'Error');
      }
    });

  } catch (error) {
    this.toastr.error('Error en el proceso de creación', 'Error');
  }
}
async crearSolicitudRepuesto(idTareaOt: string | number) {
  try {
    
    let idAdjunto: number | null = null;

    // Subir archivo si existe
    if (this.datosSolicitudRepuesto.archivo) {
      try {
        const adjuntoResponse = await this.adjuntoService.createAdjunto(
          this.datosSolicitudRepuesto.archivo, 
          0
        ).toPromise();
        idAdjunto = adjuntoResponse.id || adjuntoResponse.idAdjunto;
      } catch (error) {
        console.warn('⚠️ Error al subir archivo, continuando sin adjunto:', error);
        this.toastr.warning('No se pudo subir el archivo adjunto, pero la solicitud se creará', 'Advertencia');
      }
    }

    let idUsuario: number | null = null;
    
    const mecanicoActual = this.authService.getCurrentMecanico();
    if (mecanicoActual) {
      idUsuario = parseInt(mecanicoActual.id);
    } else {
      const userData = this.authService.getUsuarioData();
      idUsuario = userData?.id || userData?.idUsuario;
    }

    if (!idUsuario) {
      this.toastr.error('No se pudo obtener la información del usuario', 'Error');
      return;
    }

    let idTareaFinal: number;
    
    if (typeof idTareaOt === 'string') {
      // Si es un código alfanumérico, usar como está
      if (isNaN(parseInt(idTareaOt))) {
        idTareaFinal = idTareaOt as any; // Mantener como string
      } else {
        idTareaFinal = parseInt(idTareaOt, 10);
      }
    } else {
      idTareaFinal = idTareaOt;
    }

    const solicitudData = {
      idTareaOt: idTareaFinal,
      idUsuario: idUsuario,
      detalle: this.datosSolicitudRepuesto.detalle.trim(),
      ...(idAdjunto && { idAdjunto: idAdjunto })
    };


    this.solicitudService.crearSolicitudRepuesto(solicitudData).subscribe({
      next: (solicitudResponse) => {
        this.toastr.success(
          `Solicitud de repuesto ${solicitudResponse.codigo} creada exitosamente`, 
          'Solicitud Creada'
        );
      },
      error: (error) => {
        this.toastr.error('Error al crear la solicitud de repuesto', 'Error');
      }
    });

  } catch (error) {
    console.error('❌ Error en crearSolicitudRepuesto:', error);
    this.toastr.error('Error al procesar la solicitud de repuesto', 'Error');
  }
}


 resetForm() {
  this.codigoOT = '';
  this.detalleTarea = '';
  this.estado_tarea = EstadoTarea[0].code;
  this.requ_repuestos = true;
  this.tipo_tarea = 'interna';
  this.requ_auth = true;
  this.tipo_mantenimiento = 'preventivo';
  this.duracion_tarea = 0;
  this.list_repuestos = [];
  this.list_mecanicos = [];
  this.solicitudRepuesto = false;
  this.displaySolicitudRepuestoDialog = false;
  this.datosSolicitudRepuesto = {
    detalle: '',
    archivo: null,
    archivoNombre: '',
    idAdjunto: null
  };
  
  this.onClose.emit({ action: this.action, color: this.color });
}

  showDialogRepuestos() {
    this.displayAddDialogRepuestos = true;
  }

  showDialogMecanicos() {
    this.displayDialogMecanicos = true;
  }

agregarRepuesto() {
  if (!this.selectedItemId || !this.cantidadSeleccionada || this.cantidadSeleccionada <= 0) {
    this.toastr.error('Selecciona un ítem y una cantidad válida.', 'Error');
    return;
  }

  const item = this.allItemsActual.find(i => i.idItem === this.selectedItemId);
  if (!item) {
    this.toastr.error('El ítem seleccionado no es válido.', 'Error');
    return;
  }

  const yaExiste = this.list_repuestos.some(r => r.idItem === this.selectedItemId);
  if (yaExiste) {
    this.toastr.warning('Este ítem ya fue agregado.', 'Ítem duplicado');
    return;
  }

  // ✅ VALIDACIÓN DE STOCK MEJORADA
  if (this.tipoItemSeleccionado === 'insumo' && this.mostrarMagnitudes && this.selectedMagnitudId) {
    // Para insumos con conversión de magnitudes
    this.validarStockConConversion(item);
  } else {
    // Para repuestos o insumos sin conversión
    if (this.cantidadSeleccionada > item.stock) {
      this.toastr.error(`La cantidad excede el stock disponible: ${item.stock}`, 'Stock insuficiente');
      return;
    }
    this.agregarItemALista(this.cantidadSeleccionada);
  }
}
validarStockConConversion(item: any) {
  // Si la magnitud seleccionada es la misma que la magnitud origen, no hay conversión
  if (this.selectedMagnitudId === this.magnitudOrigen.idMagnitud) {
    if (this.cantidadSeleccionada! > item.stock) {
      this.toastr.error(`La cantidad excede el stock disponible: ${item.stock} ${this.magnitudOrigen.unidad}`, 'Stock insuficiente');
      return;
    }
    this.agregarItemALista(this.cantidadSeleccionada!);
    return;
  }

  // ✅ CONVERTIR LA CANTIDAD INGRESADA A LA UNIDAD BASE PARA VALIDAR STOCK
  this.magnitudService.convertirUnidad(
    this.selectedMagnitudId!, // Desde la magnitud seleccionada por el usuario
    this.cantidadSeleccionada!, // Cantidad ingresada por el usuario
    this.magnitudOrigen.idMagnitud // Hacia la magnitud base del ítem
  ).subscribe({
    next: (response: any) => {
      const cantidadEnUnidadBase = response.unidadDestino;
      
      // ✅ VALIDAR STOCK EN LA UNIDAD BASE
      if (cantidadEnUnidadBase > item.stock) {
        const magnitudSeleccionada = this.magnitudesCompatibles.find(m => m.idMagnitud === this.selectedMagnitudId);
        this.toastr.error(
          `La cantidad solicitada (${this.cantidadSeleccionada} ${magnitudSeleccionada?.unidad}) equivale a ${cantidadEnUnidadBase} ${this.magnitudOrigen.unidad}, pero solo hay ${item.stock} ${this.magnitudOrigen.unidad} disponibles.`, 
          'Stock insuficiente'
        );
        return;
      }

      // ✅ STOCK SUFICIENTE - GUARDAR LA CANTIDAD EN UNIDAD BASE
      this.agregarItemALista(cantidadEnUnidadBase);
    },
    error: (error) => {
      console.error('Error al validar stock con conversión:', error);
      this.toastr.error('Error al validar el stock. Intenta nuevamente.', 'Error');
    }
  });
}

getMagnitudNombre(idMagnitud: number): string {
  const magnitud = this.magnitudesCompatibles.find(m => m.idMagnitud === idMagnitud);
  return magnitud ? magnitud.unidad : '';
}

agregarItemALista(cantidadFinal: number) {
  this.list_repuestos.push({
    idItem: this.selectedItemId!,
    cantidad: cantidadFinal
  });
  this.limpiarFormulario();
}

limpiarFormulario() {
  this.selectedItemId = null;
  this.cantidadSeleccionada = null;
  this.selectedMagnitudId = null;
  this.mostrarMagnitudes = false;
  this.magnitudesCompatibles = [];
  this.magnitudOrigen = null;
  this.displayAddDialogRepuestos = false;
}
limpiarFormularioAlCerrar() {
  this.selectedItemId = null;
  this.cantidadSeleccionada = null;
  this.selectedMagnitudId = null;
  this.mostrarMagnitudes = false;
  this.magnitudesCompatibles = [];
  this.magnitudOrigen = null;
  this.tipoItemSeleccionado = 'repuesto'; 
  this.allItemsActual = this.allItemsRepuestos; 
  this.loadingItems = false;
  this.loadingMagnitudes = false;
}

 getItem(id: number): any {
  return this.allItemsActual.find(i => i.idItem === id) || 
         this.allItemsRepuestos.find(i => i.idItem === id) ||
         this.allItemsInsumos.find(i => i.idItem === id);
}

  abrirEditar(repuesto: { idItem: number; cantidad: number }) {
    this.editingRepuesto = { ...repuesto }; // copia temporal
    this.displayEditDialogRepuestos = true;
  }

  guardarCantidad() {
    const index = this.list_repuestos.findIndex(r => r.idItem === this.editingRepuesto.idItem);
    if (index !== -1) {
      this.list_repuestos[index].cantidad = this.editingRepuesto.cantidad;
    }
    this.displayEditDialogRepuestos = false;
  }

  eliminarRepuesto(idItem: number) {
    this.list_repuestos = this.list_repuestos.filter(r => r.idItem !== idItem);
  }

  getMecanico(id: number): any {
    return this.allMecanicos.find(m => m.idMecanico === id);
  }

  agregarMecanico() {
    if (!this.selectedMecanicoId || !this.duracionEstimada || this.duracionEstimada <= 0) {
      alert('Selecciona un mecánico y una duración válida.');
      return;
    }

    const yaExiste = this.list_mecanicos.some(m => m.idMecanico === this.selectedMecanicoId);
    if (yaExiste) {
      alert('Este mecánico ya está asignado.');
      return;
    }

    this.list_mecanicos.push({
      idMecanico: this.selectedMecanicoId,
      duracionEstimada: this.duracionEstimada
    });

    this.selectedMecanicoId = null;
    this.duracionEstimada = null;
    this.displayDialogMecanicos = false;
  }

  abrirEditarMecanico(mec: { idMecanico: number; duracion: number }) {
    this.editingMecanico = { ...mec };
    this.displayEditMecanico = true;
  }

  guardarDuracionMecanico() {
    const index = this.list_mecanicos.findIndex(m => m.idMecanico === this.editingMecanico.idMecanico);
    if (index !== -1) {
      this.list_mecanicos[index].duracionEstimada = this.editingMecanico.duracion;
    }
    this.displayEditMecanico = false;
  }

  eliminarMecanico(idMecanico: number) {
    this.list_mecanicos = this.list_mecanicos.filter(m => m.idMecanico !== idMecanico);
  }

  headerDialog(): void {
  switch (this.action) {
    case 'agregar':
      this.header_dialog = 'Agregar Nueva Tarea';
      break;
    case 'editar':
      this.header_dialog = 'Editar Tarea';
      break;
    case 'eliminar':
      this.header_dialog = 'Eliminar Tarea';
      break;
    default:
      this.header_dialog = 'Gestión de Tarea';
  }
}

onSolicitudRepuestoChange(): void {
  if (!this.solicitudRepuesto) {
    // Si se desactiva el checkbox, limpiar los datos de solicitud
    this.datosSolicitudRepuesto = {
      detalle: '',
      archivo: null,
      archivoNombre: '',
      idAdjunto: null
    };
    this.displaySolicitudRepuestoDialog = false;
  } else {
    // ✅ Si se activa la solicitud, limpiar la lista de repuestos y establecer requ_repuestos en false
    this.list_repuestos = [];
    this.requ_repuestos = false;
  }
}

  abrirDialogSolicitudRepuesto(): void {
  this.displaySolicitudRepuestoDialog = true;
}

  onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    // Validar que sea una imagen
    if (file.type.startsWith('image/')) {
      this.datosSolicitudRepuesto.archivo = file;
      this.datosSolicitudRepuesto.archivoNombre = file.name;
    } else {
      this.toastr.warning('Solo se permiten archivos de imagen', 'Tipo de archivo no válido');
      event.target.value = ''; // Limpiar el input
    }
  }
}

  cancelarSolicitudRepuesto(): void {
  this.datosSolicitudRepuesto = {
    detalle: '',
    archivo: null,
    archivoNombre: '',
    idAdjunto: null
  };
  this.displaySolicitudRepuestoDialog = false;
}

  confirmarSolicitudRepuesto(): void {
  if (!this.datosSolicitudRepuesto.detalle.trim()) {
    this.toastr.warning('El detalle de la solicitud es obligatorio', 'Campo requerido');
    return;
  }

  // Guardar el nombre del archivo para mostrar en la UI
  if (this.datosSolicitudRepuesto.archivo) {
    this.datosSolicitudRepuesto.archivoNombre = this.datosSolicitudRepuesto.archivo.name;
  }

  this.displaySolicitudRepuestoDialog = false;
  this.toastr.success('Solicitud de repuesto configurada correctamente', 'Configuración guardada');
}
}