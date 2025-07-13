import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrdenTrabajoService } from '../../services/orden-trabajo.service';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { HeadersTablesMecanico } from '../../shared/util/tables';
import { DropdownModule } from 'primeng/dropdown';
import { EstadosVehiculo, EstadosOTs, PrioridadesOT, EstadoTarea, genericT } from '../../shared/util/genericData';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrudTareaMecanicaComponent } from "./crud-tarea-mecanica/crud-tarea-mecanica.component";
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MecanicoService } from '../../services/mecanico.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TareasService } from '../../services/tareas.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthMecanicaComponent } from '../../auth/components/auth-mecanica/auth-mecanica.component';
import { OrdenMecanicoService } from '../../services/ordenMecanico.service';
import { DialogAutorizacionOTComponent } from './dialog-autorizacion-ot/dialog-autorizacion-ot.component';
import { CreateObservacionRequest } from '../../../../domain/response/Observacion.model';
import { AdjuntoService } from '../../services/adjunto.service';
import { ItemService } from '../../services/item.service';
import { DialogObservacionesComponent } from './dialog-observaciones/dialog-observaciones.component';

interface ActualizarOrdenRequest {
  idOrden: number;
  detalle: string;
  nombreCliente: string;
  placa: string;
  estado: number;
  prioridad: number;
  supervisor: number;
  fechaProgramada: Date;
  observacion?: string;
}

@Component({
  selector: 'app-orden-trabajo-mecanica',
  imports: [
    CommonModule,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    TagModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    SelectModule,
    InputTextModule,
    InputTextModule,
    MultiSelectModule,
    DialogModule,
    CalendarModule,
    FloatLabelModule,
    ConfirmDialogModule,
    CrudTareaMecanicaComponent,
    ProgressSpinnerModule,
    InputNumberModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  providers: [ConfirmationService, DialogService],
  templateUrl: './orden-trabajo-mecanica.component.html',
  styleUrl: './orden-trabajo-mecanica.component.scss'
})
export class OrdenTrabajoMecanicaComponent implements OnInit {

  codigo: string | null = null;
  OrdenTrabajo: any = null;

  // Utilizando las constantes de estados importadas
  estado = EstadosOTs;
  prioridad = PrioridadesOT;
  estadosVehiculo = EstadosVehiculo;

  cols: any[] = [];
  loadingGeneral: boolean = true;
  loadingTable: boolean = true;
  TareasOT: any[] = [];

  selectedEstadoFilter!: genericT;
  estadosFilter!: genericT[];

  agregar_tarea_card: boolean = true;
  visibleEdit: boolean = false;
  loadingEditDialog: boolean = false;
  fb_editOt: FormGroup;
  minDate: Date = new Date();

  // Lista de supervisores
  supervisor: genericT[] = [];

  //Dialgo Dinamic
  dialogRef: DynamicDialogRef | undefined;
  modalActivo: boolean = false;

  //Editar Tarea
  selectedTarea: any = null;

  mecanicosDisponibles: any[] = [];
  mecanicosDisponiblesAux: any[] = [];
  mecanicosTarea: any[] = [];

  duracionEstimadaMecanicosDialogEdit: any;

  formRepuesto: number | null = null;
  cantidadRepuesto: any;
  repuestosDisponibles: any[] = [];
  repuestosDisponiblesAux: any[] = [];
  repuestosTarea: any[] = [];


  displayModal = false;
  formEstado: number | null = null;
  formMecanico: any;
  displayMecanicosDialog: boolean = false;
  mecanicosTareaSeleccionada: any[] = [];
  codigoTareaSeleccionada: string = '';

  loadingActualizarEstado : boolean = false;
  estadosTarea = EstadoTarea;
  observacionDetalle: string = '';
  selectedFile: File | null = null;
  loadingCrearObservacion: boolean = false;
  loadingSubirImagen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ordenTrabajoService: OrdenTrabajoService,
    private tareaService: TareasService,
    private mecanicoService: MecanicoService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private ordenMecanicoService : OrdenMecanicoService,
    private adjuntoService : AdjuntoService,
    private itemService: ItemService
  ) {
    // Inicializar el formulario
    this.fb_editOt = this.fb.group({
      estado: [0, Validators.required],
      prioridad: [0, Validators.required],
      supervisor: [null, Validators.required],
      fechaProgramada: [new Date(), Validators.required],
      observacion: ['']
    });
  }

  ngOnInit() {
    this.initData();
    this.cargarSupervisores();
    this.mecanicoService.getMecanicos().subscribe({
    next: (mecanicos: any) => {
      this.mecanicosDisponibles = mecanicos;
    },
    error: (error) => {
      console.error('Error al cargar mecánicos:', error);
    }
  })
  }

  initData() {
    this.codigo = this.route.snapshot.paramMap.get('codigo');
    if (!this.codigo ) {
      this.toastr.error('La orden de trabajo no existe', 'Error');
      this.router.navigate(['mecanico']);
    }
    this.getOrdenTrabajo();
    this.cols = HeadersTablesMecanico.Tareas;
    this.estadosFilter = EstadoTarea;
  }

getItemsDisponibles() {
    this.itemService.getItemsTipoRespuestoMec().subscribe({
        next: (items: any) => {
            this.repuestosDisponibles = items;
            this.repuestosDisponiblesAux = items;
        },
        error: (error) => {
            console.error('Error al cargar repuestos:', error);
            this.toastr.error('No se pudieron cargar los repuestos disponibles', 'Error');
        }
    });
}
  getOrdenTrabajo() {
    this.loadingGeneral = true;
    this.ordenTrabajoService.getOrdenTrabajoCodigoMec(this.codigo!).subscribe({
      next: (response) => {
        this.OrdenTrabajo = response;
        this.loadingGeneral = false;
        this.getTareaOT();
        if (this.OrdenTrabajo.estado === 1 || this.OrdenTrabajo.estado === 2 || this.OrdenTrabajo.estado === 3) {
          this.toastr.error('La orden de trabajo no está disponible', 'Error');
          this.router.navigate(['mecanica']);
        }
      },
      error: (error) => {
        console.error('Error al obtener la orden de trabajo:', error);
        this.toastr.error('No se pudo cargar la información de la orden de trabajo', 'Error');
        this.loadingGeneral = false;
      }
    });
  }

  // Método para obtener el severity de la prioridad con tipo específico
  getPrioridadSeverity(prioridad: number): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (prioridad) {
      case 0: return 'danger';    // Crítico - Rojo
      case 1: return 'danger';    // Emergencia - Rojo
      case 2: return 'warn';      // Advertencia - Amarillo
      case 3: return 'info';      // Notificación - Azul
      case 4: return 'success';   // Baja prioridad - Verde
      default: return 'secondary';
    }
  }

  // Método para obtener el severity del estado con tipo específico
  getEstadoSeverity(estado: number): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (estado) {
      case 0: return 'info';      // Activo - Azul
      case 1: return 'success';   // Finalizado - Verde
      case 2: return 'warn';      // Finalizado sin éxito - Amarillo
      case 3: return 'danger';    // Anulado - Rojo
      default: return 'secondary';
    }
  }

  // Los métodos de texto se mantienen igual
  getPrioridadTexto(prioridad: number): string {
    switch (prioridad) {
      case 0: return 'Crítico';
      case 1: return 'Emergencia';
      case 2: return 'Advertencia';
      case 3: return 'Notificación';
      case 4: return 'Baja prioridad';
      default: return 'Sin definir';
    }
  }

  getEstadoTexto(estado: number): string {
    switch (estado) {
      case 0: return 'Activo';
      case 1: return 'Finalizado';
      case 2: return 'Finalizado sin éxito';
      case 3: return 'Anulado';
      default: return 'Sin definir';
    }
  }

getTareaOT() {
  this.loadingTable = true;
  
  this.tareaService.getTareasByOTMec(this.codigo!).subscribe({
    next: (tareas) => {
      this.tareaService.getTareaExternaByOT(this.codigo!).subscribe({
        next: (tareasExternas) => {
          const tareasMapeadas = tareas.map(t => {
            const externa = tareasExternas.find(e => e.codigo === t.codigo);
            return {
              ...t,
              solicitante: externa?.solicitante ?? null,
              requiereAutorizacion: externa?.requiereAutorizacion ?? null,
              requiereServicioExterno: externa?.requiereServicioExterno ?? null,
              detalleExterno: externa?.detalle ?? null,
              esExterna: externa ? true : false
            };
          });

          const tareasExternasNoIncluidas = tareasExternas.filter(e =>
            !tareas.some(t => t.codigo === e.codigo)
          ).map(e => ({
            idTareaOt: e.idTareaOt, 
            codigo: e.codigo,
            detalle: e.detalle ?? null,
            duracion: null,
            estado: e.estado,
            mecanicos: [],
            observaciones: e.observaciones || [], 
            requiereRepuesto: null,
            requiereServicioExterno: e.requiereServicioExterno ?? null,
            solicitante: e.solicitante ?? null,
            requiereAutorizacion: e.requiereAutorizacion ?? null,
            detalleExterno: e.detalle ?? null,
            esExterna: true
          }));

          this.TareasOT = [...tareasMapeadas, ...tareasExternasNoIncluidas];
          this.loadingTable = false;
        },
        error: (error) => {
          console.warn('No se pudieron cargar las tareas externas, pero continuando con tareas normales:', error);
          
          this.TareasOT = tareas.map(t => ({
            ...t,
            solicitante: null,
            requiereAutorizacion: null,
            requiereServicioExterno: null,
            detalleExterno: null,
            esExterna: false
          }));
          
          this.loadingTable = false;
        }
      });
    },
    error: (error) => {
      console.error('Error al cargar las tareas de la orden de trabajo:', error);
      this.toastr.error('No se pudieron cargar las tareas de la orden de trabajo', 'Error');
      
      // Intentar cargar solo tareas externas como fallback
      this.tareaService.getTareaExternaByOT(this.codigo!).subscribe({
        next: (tareasExternas) => {
          this.TareasOT = tareasExternas.map(e => ({
            idTareaOt: e.idTareaOt, 
            codigo: e.codigo,
            detalle: e.detalle ?? null,
            duracion: null,
            estado: e.estado,
            mecanicos: [],
            observaciones: e.observaciones || [], 
            requiereRepuesto: null,
            requiereServicioExterno: e.requiereServicioExterno ?? null,
            solicitante: e.solicitante ?? null,
            requiereAutorizacion: e.requiereAutorizacion ?? null,
            detalleExterno: e.detalle ?? null,
            esExterna: true
          }));
          console.log('Cargando tareas externas como fallback:', this.TareasOT);
          this.loadingTable = false;
        },
        error: (errorExternas) => {
          console.error('Error al cargar tareas externas como fallback:', errorExternas);
          this.TareasOT = [];
          this.loadingTable = false;
        }
      });
    }
  });
}
getSeverityEstadoUnificado(estado: number, esExterna: boolean = false): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
  const severityBase = this.getSeverityEstado(estado);
  
  if (esExterna) {
    switch (severityBase) {
      case 'success': return 'info';    
      case 'warn': return 'warn';        
      case 'danger': return 'danger';     
      case 'info': return 'info';        
      case 'secondary': return 'contrast'; 
      default: return 'info';            
    }
  }
  
  return severityBase;
}
  getSeverityEstado(status: number): "success" | "warn" | "danger" | "secondary" | "info" {
    switch (status) {
      case 0: return 'success';
      case 1: return 'warn';
      case 2: return 'danger';
      case 3: return 'info';
      default:
        return 'secondary';
    }
  }
getTextoEstadoUnificado(estado: number): string {
  return this.GetEstado(estado) || 'Sin definir';
}

estadoRequiereAtencion(estado: number): boolean {
  return [6, 7, 8].includes(estado);
}

puedeEditarTarea(estado: number): boolean {
  return ![3, 4, 5].includes(estado);
}
  GetEstado(id: number) {
    const item = this.estadosFilter.find(x => x.code === id);
    return item?.name;
  }
  unirStrings(array: any): string {
    if (!array) return 'Ninguno';
    const str = array.join(', ');

    return str;
  }

  // Método para cargar los supervisores
  cargarSupervisores() {
    this.mecanicoService.getSupervisoresMec().subscribe({
      next: (data) => {
        // Mapear los datos al formato esperado por el dropdown
        this.supervisor = data.map(sup => ({
          name: sup.nombre,
          code: sup.idMecanico
        }));
      },
      error: (error) => {
        console.error('Error al cargar supervisores:', error);
        this.toastr.error('No se pudieron cargar los supervisores', 'Error');
      }
    });
  }
  showEditDialog() {
    // Verificar que los supervisores estén cargados
    if (!this.supervisor || this.supervisor.length === 0) {
      this.toastr.warning('Cargando supervisores...', 'Espere');
      setTimeout(() => {
        this.showEditDialog();
      }, 1000);
      return;
    }
    this.loadingEditDialog = true;
    this.visibleEdit = true;
    if (this.OrdenTrabajo) {
      const supervisorSeleccionado = this.supervisor.find(sup => sup.code === parseInt(this.OrdenTrabajo.idSupervisor));
      let fechaProgramada: Date | null = null;
      if (this.OrdenTrabajo.fechaProgramada) {
        const fechaString = this.OrdenTrabajo.fechaProgramada.toString();
        try {
          if (fechaString.includes('T')) {
            const soloFecha = fechaString.split('T')[0];
            const [año, mes, dia] = soloFecha.split('-').map(Number);
            fechaProgramada = new Date(año, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
          } else {
            fechaProgramada = new Date(fechaString);
          }
          if (isNaN(fechaProgramada.getTime())) {
            fechaProgramada = new Date();
            console.warn('Fecha inválida, usando fecha actual');
          }
        } catch (error) {
          console.error('Error al procesar fecha:', error);
          fechaProgramada = new Date();
        }
      } else {
        fechaProgramada = new Date();
      }
      this.fb_editOt.patchValue({
        estado: parseInt(this.OrdenTrabajo.estado) || 0,
        prioridad: parseInt(this.OrdenTrabajo.prioridad) || 0,
        supervisor: supervisorSeleccionado ? supervisorSeleccionado.code : null,
        fechaProgramada: fechaProgramada,
        observacion: this.OrdenTrabajo.observacion || ''
      });
      Object.keys(this.fb_editOt.controls).forEach(key => {
        const control = this.fb_editOt.get(key);
      });
      setTimeout(() => {
        this.fb_editOt.get('fechaProgramada')?.updateValueAndValidity();
      }, 100);
    }
    this.loadingEditDialog = false;
  }
  updateOT() {
    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: {
        accion: 'EditarOT'
      }
    });

    dialogRef.onClose.subscribe((result: { acceso: boolean, token: any }) => {
      this.modalActivo = false;
      if (result?.acceso) {
        if (this.fb_editOt.valid) {
          this.loadingEditDialog = true;
          // Crear el objeto con solo los campos que necesitas enviar
          const datosActualizados = {
            codigo: this.codigo!,
            estado: this.fb_editOt.value.estado,
            prioridad: this.fb_editOt.value.prioridad,
            idMecanico: this.fb_editOt.value.supervisor, // Asumiendo que 'supervisor' corresponde a 'idMecanico'
            fechaProgramada: this.fb_editOt.value.fechaProgramada,
            observacion: this.fb_editOt.value.observacion || ''
          };

          this.ordenTrabajoService.updateOrdenTrabajo(datosActualizados).subscribe({
            next: (response) => {
              this.toastr.success('Orden de trabajo actualizada con éxito', 'Éxito');
              this.visibleEdit = false;
              this.loadingEditDialog = false;
              this.getOrdenTrabajo();
            },
            error: (error) => {
              console.error('Error al actualizar la orden de trabajo', error);
              this.toastr.error('No se pudo actualizar la orden de trabajo', 'Error');
              this.loadingEditDialog = false;
            }
          });
        } else {
          // Mostrar errores del formulario
          Object.keys(this.fb_editOt.controls).forEach(key => {
            const control = this.fb_editOt.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
          this.toastr.warning('Por favor complete correctamente todos los campos requeridos', 'Formulario inválido');
        }
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
      }
    });
  }
  // Método para confirmar anulación de OT
  confirmarAnularOT() {
    if (this.modalActivo) return;
    this.modalActivo = true;

    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: {
        accion: 'AnularOT'
      }
    });

    dialogRef.onClose.subscribe((result: { acceso: boolean, token: any }) => {
      this.modalActivo = false;

      if (result?.acceso) {
        this.confirmationService.confirm({
          message: 'Esta acción no se puede deshacer. ¿Desea anular esta orden de trabajo?',
          header: 'Confirmación para anular orden de trabajo',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Sí, anular orden',
          rejectLabel: 'Cancelar',
          accept: () => {
            this.anularOT(result.token);
          }
        });
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
      }
    });
  }

  anularOT(token: any) {
    this.toastr.info('Procesando su solicitud...', 'Anulando orden');

    this.ordenMecanicoService.actualizarEstadoOrdenTrabajo(this.codigo!, 3).subscribe({ //3anular, 1 finalizar, 2 finalizar sin exito
      next: (response) => {
        this.toastr.success('Orden de trabajo anulada exitosamente', 'Éxito');
        // Recargar los datos para mostrar el nuevo estado
        this.getOrdenTrabajo();
      },
      error: (error) => {
        console.error('Error al anular la orden de trabajo:', error);
        this.toastr.error('No se pudo anular la orden de trabajo', 'Error');
      }
    });
  }

  confirmarFinalizarOT() {
    if (this.modalActivo) return;
    this.modalActivo = true;

    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: {
        accion: 'FinalizarOT'
      }
    });

    dialogRef.onClose.subscribe((result: { acceso: boolean, token: any }) => {
      this.modalActivo = false;

      if (result?.acceso) {
        this.confirmationService.confirm({
          message: '¿Está seguro de finalizar esta orden de trabajo? Esta acción no se puede revertir.',
          header: 'Confirmación para finalizar orden de trabajo',
          icon: 'pi pi-check-circle',
          acceptLabel: 'Sí, finalizar orden',
          rejectLabel: 'Cancelar',
          accept: () => {
            this.finalizarOT(result.token);
          }
        });
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
      }
    });
  }

  finalizarOT(token: any) {
    this.toastr.info('Procesando su solicitud...', 'Finalizada orden de Trabajo!');
   
    this.ordenMecanicoService.actualizarEstadoOrdenTrabajo(this.codigo!, 1).subscribe({ //3anular, 1 finalizar, 2 finalizar sin exito
      next: (response) => {
        this.toastr.success('Orden de trabajo Finalizada exitosamente', 'Éxito');
        this.getOrdenTrabajo();
      },
      error: (error) => {
        console.error('Error al finalizar la orden de trabajo:', error);
        this.toastr.error('No se pudo finalizar la orden de trabajo', 'Error');
      }
    });
  }

  GetItemsByTarea(id: any) {
    this.itemService.getItemsByTarea(id).subscribe({
      next: (items: any[]) => {
        this.repuestosTarea = items;
        this.itemService.getItemsTipoRespuestoMec().subscribe({
          next: (items : any) => {
            this.repuestosDisponibles = items;
            //console.log('Items disponibles:', this.repuestosDisponibles, this.repuestosTarea);
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener los items de la tarea:', error);
        this.toastr.error('No se pudieron cargar los items de la tarea', 'Error');
      }
    });
  }

abrirModalEdicion(codigo: string, mecanicos: any) {
    // ✅ Asegurar que cada mecánico tenga todas las propiedades necesarias
    this.mecanicosTarea = (mecanicos || []).map((m: any) => ({
        idMecanico: m.idMecanico,
        nombreCompleto: m.nombreCompleto || `${m.nombre || ''} ${m.apellidos || ''}`.trim(),
        duracionEstimada: m.duracionEstimada || null, // ✅ ASEGURAR QUE EXISTE
        especialidad: m.especialidad || null
    }));
    console.log('Mecánicos de la tarea:', this.mecanicosTarea);
    
    this.selectedTarea = this.TareasOT.find(t => t.codigo === codigo);
    if (!this.selectedTarea) return;

    this.mecanicosDisponiblesAux = this.filtrarMecanicosDisponibles(); 
    this.GetItemsByTarea(this.selectedTarea.idTareaOt);
    this.getItemsDisponibles();
    this.formEstado = this.selectedTarea.estado;
    this.formMecanico = [...this.selectedTarea.mecanicos];
    this.displayModal = true;
}

  cerrarModalEditTarea() {
    this.displayModal = false;
    this.selectedTarea = null;
    this.formEstado = null;
    this.formMecanico = null;
    this.limpiarFormularioObservacion();
  }

  autorizacionTareaOT(codigo: string) {
    const tarea = this.TareasOT.find(t => t.codigo === codigo);
    if (!tarea) {
      this.toastr.error('No se encontró la tarea', 'Error');
      return;
    }
    
    const estado = tarea.estado; 
    const duracion = tarea.duracionEstimada || 0; 
    const idTarea = tarea.idTareaOt

    const dialogRef = this.dialogService.open(DialogAutorizacionOTComponent, {
      header: 'Estado de Autorización',
      width: '450px',
      modal: true,
      dismissableMask: true,
      data: {
        estado,
        idTarea,
        duracion
      }
    });

    dialogRef.onClose.subscribe((autorizado: boolean) => {
      if (autorizado) {
        this.autorizarTareaOT(codigo);
        this.getTareaOT();
      }
    });
  }
  
  autorizarTareaOT(codigo: string) { //modificar cuando haya una funciuon para cambiar el estado
    this.toastr.info('Procesando su solicitud...', 'Autorizando tarea');
  }
  mostrarMecanicos(mecanicos: any[], codigoTarea: string) {
    this.mecanicosTareaSeleccionada = mecanicos;
    this.codigoTareaSeleccionada = codigoTarea;
    this.displayMecanicosDialog = true;
  }
  getDuracionTotalMecanicos(): string {
    if (!this.mecanicosTareaSeleccionada || this.mecanicosTareaSeleccionada.length === 0) {
      return '0 hrs';
    }
    const total = this.mecanicosTareaSeleccionada
      .map(m => Number(m.duracionEstimada) || 0)
      .reduce((a, b) => a + b, 0);
    return total + ' hrs';
  }
  obtenerTextoEstadoTarea(estado: number): string {
    const estadoObj = this.estadosTarea.find(e => e.code === estado);
    return estadoObj ? estadoObj.name : 'Sin definir';
  }

  // Método para obtener el severity del estado de la tarea
  obtenerSeverityEstadoTarea(estado: number): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    const estadoObj = this.estadosTarea.find(e => e.code === estado);
    return estadoObj?.severity as any || 'secondary';
  }

  actualizarEstadoTarea(idTarea?: number) {
    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: {
        accion: 'ActualizarEstadoTarea'
      }
    });

    dialogRef.onClose.subscribe((result: { acceso: boolean, token: any }) => {
      this.modalActivo = false;

      if (result?.acceso) {
        if (!this.selectedTarea || this.formEstado === null) {
          this.toastr.warning('Debe seleccionar un estado válido', 'Advertencia');
          return;
        }
        // Verificar si realmente cambió el estado
        if (this.formEstado === this.selectedTarea.estado) {
          this.toastr.info('No se detectaron cambios en el estado', 'Información');
          return;
        }
        const idTareaFinal = idTarea || 
                            this.selectedTarea.idTarea || 
                            this.selectedTarea.id || 
                            this.selectedTarea.idTareaOt;
        if (!idTareaFinal) {
          this.toastr.error('No se pudo identificar la tarea para actualizar', 'Error');
          return;
        }
        this.loadingActualizarEstado = true;
        const datosActualizacion = {
          idTareaOt: Number(idTareaFinal),
          estado: Number(this.formEstado)
        };

        this.tareaService.actualizarTarea(datosActualizacion).subscribe({
          next: (response) => {
            this.toastr.success(
              `Estado actualizado a: ${this.obtenerTextoEstadoTarea(this.formEstado!)}`, 
              'Estado Actualizado'
            );
            this.loadingActualizarEstado = false;
            this.actualizarTareaEnLista();
            this.getTareaOT();
            this.displayModal = false;
          },
          error: (error) => {
            this.toastr.error('No se pudo actualizar el estado de la tarea', 'Error');
            this.loadingActualizarEstado = false;
          }
        });
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
      }
    });
  }

  actualizarTareaEnLista() {
    const index = this.TareasOT.findIndex(t => t.codigo === this.selectedTarea.codigo);
    if (index !== -1) {
      this.TareasOT[index].estado = this.formEstado;
    }
  }

  estadoHaCambiado(): boolean {
    return this.formEstado !== null && 
          this.selectedTarea && 
          this.formEstado !== this.selectedTarea.estado;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.toastr.warning('Solo se permiten archivos de imagen', 'Archivo inválido');
        return;
      }

      // Validar tamaño (ejemplo: máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.toastr.warning('El archivo no puede superar los 5MB', 'Archivo muy grande');
        return;
      }

      this.selectedFile = file;
      console.log('Archivo seleccionado:', file.name, 'Tamaño:', file.size);
    }
  }

  removeSelectedFile() {
    this.selectedFile = null;
  }

  async subirImagen(): Promise<number | null> {
    if (!this.selectedFile) {
      return null;
    }

    this.loadingSubirImagen = true;

    try {
      // Llamar al servicio de adjuntos con idVehiculo como null (opcional)
      const response = await this.adjuntoService.createAdjunto(this.selectedFile, null as any).toPromise();
      
      console.log('Imagen subida exitosamente:', response);
      this.loadingSubirImagen = false;
      
      return response.idAdjunto;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      this.toastr.error('Error al subir la imagen', 'Error');
      this.loadingSubirImagen = false;
      return null;
    }
  }

  async crearObservacionTarea() {
    if (!this.selectedTarea || !this.observacionDetalle.trim()) {
      this.toastr.warning('Debe ingresar un detalle para la observación', 'Campos requeridos');
      return;
    }
    // Obtener ID de la tarea (igual que en actualizar estado)
    const tareaCompleta = this.TareasOT.find(t => t.codigo === this.selectedTarea.codigo);
    const idTarea = tareaCompleta?.idTarea || 
                   tareaCompleta?.id || 
                   tareaCompleta?.idTareaOt ||
                   this.selectedTarea.idTarea;

    if (!idTarea) {
      this.toastr.error('No se pudo identificar la tarea', 'Error');
      return;
    }

    this.loadingCrearObservacion = true;

    try {
      let idAdjunto: number | null = null;
      if (this.selectedFile) {
        idAdjunto = await this.subirImagen();
        
        if (idAdjunto === null) {
          this.loadingCrearObservacion = false;
          return; // Error al subir imagen
        }
      }
      const observacionData: CreateObservacionRequest = {
        IdTareaOt: Number(idTarea),
        IdUsuario: 1, // Obtener del servicio de autenticación
        Detalle: this.observacionDetalle.trim(),
        IdAdjunto: idAdjunto
      };

      console.log('Datos de observación a enviar:', observacionData);

      this.tareaService.crearObservacion(observacionData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Observación creada exitosamente', 'Éxito');
            this.limpiarFormularioObservacion();
            this.getTareaOT();
          }
          this.loadingCrearObservacion = false;
        },
        error: (error) => {
          console.error('Error al crear observación:', error);
          
          if (error.status === 400) {
            this.toastr.error(error.error || 'Datos inválidos', 'Error de Validación');
          } else {
            this.toastr.error('No se pudo crear la observación', 'Error');
          }
          
          this.loadingCrearObservacion = false;
        }
      });

    } catch (error) {
      console.error('Error general al crear observación:', error);
      this.toastr.error('Error inesperado al crear la observación', 'Error');
      this.loadingCrearObservacion = false;
    }
  }

  limpiarFormularioObservacion() {
    this.observacionDetalle = '';
    this.selectedFile = null;
    this.loadingSubirImagen = false;
  }

  mostrarObservaciones(lista: any[], codigo: string) {
    this.dialogService.open(DialogObservacionesComponent, {
      header: `Observaciones de ${codigo}`,
      width: '450px',
      modal: true,
      dismissableMask: true,
      closable: true,
      data: {
        observaciones: lista
      }
    });
  }

  agregarMecanicoTarea() {  
  const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
    header: 'Código de Autenticación',
    width: '400px',
    modal: true,
    dismissableMask: false,
    closable: false,
    data: {
      accion: 'AgregarMecanicoTarea',
    }
  });

  dialogRef.onClose.subscribe((result: { acceso: boolean }) => {
    this.modalActivo = false;
    if (result?.acceso) {
      const peticion = {
        idTareaOt: this.selectedTarea.idTareaOt,
        mecanicos: [{
          idMecanico: this.formMecanico,
          duracionEstimada: this.duracionEstimadaMecanicosDialogEdit
        }]
      };
      this.tareaService.agregarMecanicosTarea(peticion.idTareaOt, peticion.mecanicos).subscribe({
        next: (response) => {
          this.toastr.success('Mecánico agregado a la tarea exitosamente', 'Éxito');
          const mecanico = this.mecanicosDisponibles.find(m => m.idMecanico == peticion.mecanicos[0].idMecanico);
          this.getTareaOT(); 
          
          // ✅ Objeto completo con duracionEstimada y especialidad
          const mecanicoFormat = {
            idMecanico: mecanico.idMecanico,
            nombreCompleto: mecanico.nombre + ' ' + (mecanico.apellidos || ''),
            duracionEstimada: this.duracionEstimadaMecanicosDialogEdit, // ✅ INCLUIR DURACIÓN
            especialidad: mecanico.especialidad || null // ✅ INCLUIR ESPECIALIDAD
          }
          this.mecanicosTarea.push(mecanicoFormat); 
          
          // ✅ Actualizar también la lista de mecánicos disponibles
          this.mecanicosDisponiblesAux = this.filtrarMecanicosDisponibles();
          
          // Limpiar formulario
          this.duracionEstimadaMecanicosDialogEdit = null;
          this.formMecanico = null;
        },
        error: (error) => {
          console.error('Error al agregar mecánico a la tarea:', error);
          this.toastr.error('No se pudo agregar el mecánico a la tarea', 'Error');
          this.getTareaOT(); 
        }
      });
    } else {
      this.toastr.error('Código incorrecto o cancelado', 'Error');
    }
  });
}
  filtrarMecanicosDisponibles() {
    const idsAsignados = this.mecanicosTarea.map(m => m.idMecanico);

    const mecanicosDisponiblesFiltrados = this.mecanicosDisponibles
      .filter(m => !idsAsignados.includes(m.idMecanico))
      .map(m => ({
        ...m,
        nombreCompleto: `${m.nombre} ${m.apellidos || ''}` 
      }));

    return mecanicosDisponiblesFiltrados;
  }
  eliminarMecanicoTarea(mecanico: any) {    
    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: {
        accion: 'EliminarMecanicoTarea',
      }
    });

    dialogRef.onClose.subscribe((result: { acceso: boolean }) => {
      this.modalActivo = false;
      if (result.acceso) {
        this.tareaService.eliminarMecanicoTarea(this.selectedTarea.idTareaOt, mecanico.idMecanico).subscribe({
          next: (response) => {
            this.toastr.success('Mecánico eliminado de la tarea', 'Éxito');
            this.getTareaOT();
            this.mecanicosTarea = this.mecanicosTarea.filter(m => m !== mecanico);
          },
          error: (err) => {
            console.error('Error al eliminar mecánico:', err);
            this.toastr.error('No se pudo eliminar el mecánico', 'Error');
          }
        });
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
      }
    });
  }

  agregarRepuestoTarea() {
    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: { accion: 'AgregarRepuestoTarea' }
    });

    const repuesto = this.repuestosDisponibles.find(r => r.idRepuesto === this.formRepuesto);

    dialogRef.onClose.subscribe((result: { acceso: boolean, idUsuario: any }) => {
      if (result?.acceso) {
        const repuestos = [{
            idItem: this.formRepuesto,
            cantidad: this.cantidadRepuesto
          }];
        
        this.tareaService.agregarRepuestosTarea(this.selectedTarea.idTareaOt, parseInt(result.idUsuario, 10) , repuestos).subscribe({
          next: () => {
            this.toastr.success('Repuesto agregado exitosamente', 'Éxito');
            this.GetItemsByTarea(this.selectedTarea.idTareaOt);
            this.repuestosTarea.push({ ...repuesto, cantidad: this.cantidadRepuesto });
          },
          error: (err) => {
            console.error('Error al agregar repuesto:', err);
            this.toastr.error('No se pudo agregar el repuesto', 'Error');
          }
        });
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
      }
    });
  }

  eliminarRepuestoTarea(repuesto: any) {
    const dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false,
      closable: false,
      data: { accion: 'EliminarRepuestoTarea' }
    });
    dialogRef.onClose.subscribe((result: { acceso: boolean }) => {
      if (result?.acceso) {
        console.log(this.selectedTarea.idTarea, repuesto.idRepuesto)
        this.tareaService.eliminarRepuestoTarea(this.selectedTarea.idTareaOt, repuesto.idRepuestoOt).subscribe({
          next: () => {
            this.toastr.success('Repuesto eliminado de la tarea', 'Éxito');
            this.repuestosTarea = this.repuestosTarea.filter(r => r.idRepuesto !== repuesto.idRepuesto);
          },
          error: (err) => {
            console.error('Error al eliminar repuesto:', err);
            this.toastr.error('No se pudo eliminar el repuesto', 'Error');
          }
        });
      } else {
        this.toastr.error('Código incorrecto o cancelado', 'Error');
      }
    });
  }
onTareaCreada(success: boolean) {
    if (success) {
      console.log('✅ Tarea creada exitosamente, refrescando datos...');
      // Recargar las tareas de la OT
      this.getTareaOT();
      // Opcional: también recargar la información completa de la OT
      // this.getOrdenTrabajo();
    } else {
      console.log('❌ Error al crear la tarea');
      // Aquí puedes manejar errores adicionales si es necesario
    }
  }
}