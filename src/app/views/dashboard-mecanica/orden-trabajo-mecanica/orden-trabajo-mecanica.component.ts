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
import { InputTextarea } from 'primeng/inputtextarea';
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
    ProgressSpinnerModule
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

  displayModal = false;
  formEstado: number | null = null;
  formMecanicos: any[] = [];

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
    private ordenMecanicoService : OrdenMecanicoService
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
    if (!this.codigo) {
      this.toastr.error('La orden de trabajo no existe', 'Error');
      this.router.navigate(['mecanico']);
    }
    this.getOrdenTrabajo();
    this.cols = HeadersTablesMecanico.Tareas;
    this.estadosFilter = EstadoTarea;
  }

  getOrdenTrabajo() {
    this.loadingGeneral = true;
    this.ordenTrabajoService.getOrdenTrabajoCodigoMec(this.codigo!).subscribe({
      next: (response) => {
        this.OrdenTrabajo = response;
        this.loadingGeneral = false;
        this.getTareaOT();
        if (this.OrdenTrabajo.estado === 6 || this.OrdenTrabajo.estado === 7 || this.OrdenTrabajo.estado === 8) {
          this.toastr.error('La orden de trabajo no está disponible', 'Error');
          this.router.navigate(['mecanico']);
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
    this.tareaService.getTareasByOTMec(this.codigo!).subscribe({
      next: (response) => {
        this.TareasOT = response;
        this.loadingTable = false;
      },
    });
  }

  getSeverityEstado(status: number) {
    switch (status) {
      case 0: return 'success';
      case 1: return 'warn';
      case 2: return 'danger';
      default:
        return 'secondary';
    }
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

  // Método para mostrar el diálogo de edición
  showEditDialog() {
    this.loadingEditDialog = true;
    this.visibleEdit = true;

    // Cargar solo los campos editables en el formulario
    if (this.OrdenTrabajo) {
      this.fb_editOt.patchValue({
        estado: parseInt(this.OrdenTrabajo.estado) || 0,
        prioridad: parseInt(this.OrdenTrabajo.prioridad) || 0,
        supervisor: parseInt(this.OrdenTrabajo.supervisor) || null,
        fechaProgramada: new Date(this.OrdenTrabajo.fechaProgramada),
        observacion: this.OrdenTrabajo.observacion || ''
      });
    }

    this.loadingEditDialog = false;
  }

  // Método para actualizar la orden de trabajo
  updateOT() {
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
          // Recargar los datos de la OT para mostrar los cambios
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
        // Recargar los datos para mostrar el nuevo estado
        this.getOrdenTrabajo();
      },
      error: (error) => {
        console.error('Error al finalizar la orden de trabajo:', error);
        this.toastr.error('No se pudo finalizar la orden de trabajo', 'Error');
      }
    });
  }

  abrirModalEdicion(codigo: string) {
    this.selectedTarea = this.TareasOT.find(t => t.codigo === codigo);
    if (!this.selectedTarea) return;

    this.formEstado = this.selectedTarea.estado;
    this.formMecanicos = [...this.selectedTarea.mecanicos];
    this.displayModal = true;
  }

  guardarCambios() {
    console.log('Enviar al backend:', {
      codigo: this.selectedTarea.codigo,
      estado: this.formEstado,
      mecanicos: this.formMecanicos
    });

    this.cerrarModalEditTarea();
  }

  cerrarModalEditTarea() {
    this.displayModal = false;
    this.selectedTarea = null;
    this.formEstado = null;
    this.formMecanicos = [];
  }

  autorizacionTareaOT(codigo: string) {
    const tarea = this.TareasOT.find(t => t.codigo === codigo);
    if (!tarea) {
      this.toastr.error('No se encontró la tarea', 'Error');
      return;
    }
    const estado = tarea.estado;   

    const dialogRef = this.dialogService.open(DialogAutorizacionOTComponent, {
      header: 'Estado de Autorización',
      width: '450px',
      modal: true,
      dismissableMask: true,
      data: {
        estado,
        codigo
      }
    });

    dialogRef.onClose.subscribe((autorizado: boolean) => {
      if (autorizado) {
        this.autorizarTareaOT(codigo);
      }
    });
  }
  
  autorizarTareaOT(codigo: string) { //modificar cuando haya una funciuon para cambiar el estado
    this.toastr.info('Procesando su solicitud...', 'Autorizando tarea');
  }

}