import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrdenTrabajo, ordenTrabajoList } from '../../../domain/response/OrdenTrabajoResponse.model';
import { EstadosOTs, EstadosVehiculo, genericT, PrioridadesOT } from '../shared/util/genericData';
import { Column, HeadersTables } from '../shared/util/tables';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { MecanicoService } from '../services/mecanico.service';
import { PickListModule } from 'primeng/picklist';
import { OrdenMecanicoService } from '../services/ordenMecanico.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthMecanicaComponent } from '../auth/components/auth-mecanica/auth-mecanica.component';
import { ToastrService } from 'ngx-toastr';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Adjunto } from '../../../domain/adjunto.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OrdenTrabajoService } from '../services/orden-trabajo.service';
import { TareasService } from '../services/tareas.service';
import { RepuestoService } from '../services/repuesto.service';
import { SolicitudService } from '../services/solicitud.service';
import { AdjuntoService } from '../services/adjunto.service';
import { ArchivosService } from '../services/archivos.service';
import { SkeletonExpandInfoComponent } from "../shared/components/skeleton/skeleton-expand-info.component";

interface TableColumn {
  field: string;
  header: string;
  sort: boolean;
  type: string;
}

interface Mecanico {
  idMecanico: number;
  nombre: string;
  apellidos: string;
}

@Component({
  selector: 'app-dashboard-mecanica',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DropdownModule,
    FormsModule,
    PickListModule,
    IconField,
    InputIcon,
    DividerModule,
    ToastModule,
    DialogModule,
    SelectButtonModule,
    BadgeModule,
    TooltipModule,
    ProgressSpinnerModule,
    SkeletonExpandInfoComponent
],
  providers: [DatePipe, MecanicoService, OrdenMecanicoService, MessageService, DialogService],
  templateUrl: './dashboard-mecanica.component.html',
  styleUrls: ['./dashboard-mecanica.component.scss']
})
export class DashboardMecanicaComponent implements OnInit {
  ordenes: ordenTrabajoList[] = [];
  cols!: TableColumn[];
  loading: boolean = true;
  
  estado!: genericT[];
  prioridad!: genericT[];
  estadoVehiculo!: genericT[];
  minDate!: Date;
  selectedEstadoFilter!: genericT;
  selectedPrioridadFilter!: genericT;
  
  todosMecanicos: Mecanico[] = [];
  mecanicosFiltrados: Mecanico[] = [];
  
  mostrarValidacion: boolean = false;
  codigoOTPendiente: string = '';
  cargandoValidacion: boolean = false;
  isDarkModeEnabled = false;
  permisosRequeridos: string[] = []; 
  rutaPendiente: string = ''; 
  
  // Dialogo dinamico
  dialogRef: DynamicDialogRef | undefined;
  // Variables para el dialogo
  visibleExpand: boolean = false;
  loadingExpandDialog: boolean = true;
  codeExpandDialog: string = '';
  
  // Variables para las tablas
  expandDataTables: any[] = [];
  expandCols: Column[] = [];
  ExpandOptionsValue: string = '';
  ExpandOptions: genericT[] = [];
  selectedCodeObservacion: string = '';
  
  // Variables para los datos
  ExpandItem: OrdenTrabajo = {
    codigo: '',
    detalle: '',
    prioridad: 0,
    estado: 0,
    fechaCreada: new Date(),
    fechaProgramada: new Date(),
    fechaFinalizacion: new Date(),
    observacion: '',
    codigoVehiculo: '',
    kilometraje: 0,
    numeroVehiculo: 0,
    anio: new Date(),
    estadoVehiculo: '',
    propietario: '',
    placa: '',
    nombreCliente: '',
    celular: '',
    correo: '',
    direccion: '',
    supervisor: '',
    idSupervisor: 0
  };
  
  // Variables para adjuntos
  adjuntoImages: { id: number, dataUrl: string }[] = [];
  adjuntos: Adjunto[] = [];
  archivoUrl: SafeResourceUrl | null = null;
  tipoArchivo: string = '';
  displayImage: boolean = false;
  
  // Variables para datos de tablas
  allTablesData: {
    tareas: any[];
    repuestos: any[];
    mecanicos: any[];
    trabajosExternos: any[];
    observaciones: any[];
    solicitudes: any[];
  } = {
    tareas: [],
    repuestos: [],
    mecanicos: [],
    trabajosExternos: [],
    observaciones: [],
    solicitudes: []
  };
  
  supervisor: genericT[] = [];
  
  estadosTarea = [
    { name: 'Pendiente', code: 1 },
    { name: 'En Progreso', code: 2 },
    { name: 'Cancelado', code: 3 },
    { name: 'Finalizado', code: 4 },
    { name: 'Finalizado sin Exito', code: 5 },
    { name: 'Espera Repuesto', code: 6 },
    { name: 'Espera Mecanico', code: 7 },
    { name: 'Espera Aprobacion', code: 8 }
  ];
  constructor(
    private datePipe: DatePipe,
    private mecanicoService: MecanicoService,
    private ordenMecanicoService: OrdenMecanicoService,
    private router: Router,
    private messageService: MessageService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private otService: OrdenTrabajoService,
    private tareaService: TareasService,
    private repuestoService: RepuestoService,
    private mecService: MecanicoService,
    private solicitudService: SolicitudService,
    private adjuntoService: AdjuntoService,
    private archivoService: ArchivosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cols = HeadersTables.OrdenesTrabajoList as TableColumn[];
    this.estado = EstadosOTs;
    this.prioridad = PrioridadesOT;
    this.estadoVehiculo = EstadosVehiculo;
    this.minDate = new Date();
    localStorage.removeItem('mecanico-token');
    this.mecService.getSupervisores().subscribe({
      next: (response) => {
        this.supervisor = response.map(x => ({
          name: x.nombre,
          code: x.idMecanico
        }));        
      },
      error: (err) => {
        console.log("Error al solicitar Supervisores: ", err);
      }
    });
    this.cargarMecanicos();
  }

  cargarMecanicos(): void {
    this.mecanicoService.getMecanicos().subscribe({
      next: (response) => {
        this.todosMecanicos = response || [];
        this.mecanicosFiltrados = [];
        this.cargarOrdenes();
      },
      error: () => {
        this.cargarOrdenes();
      }
    });
  }

  cargarOrdenes(): void {
    this.loading = true;
    const idMecanicosSeleccionados = this.mecanicosFiltrados.length > 0 
      ? this.mecanicosFiltrados.map(m => m.idMecanico)
      : undefined;
    this.ordenMecanicoService.getOrdenesByMecanicos(idMecanicosSeleccionados).subscribe({
      next: (response) => {
        let ordenesTemp: any[] = [];
        if (Array.isArray(response)) {
          for (const item of response) {
            if (item && typeof item === 'object') {
              if (item.ordenes && Array.isArray(item.ordenes)) {
                ordenesTemp = [...ordenesTemp, ...item.ordenes];
              } 
              else {
                ordenesTemp.push(item);
              }
            }
          }
        } 
        else if (response && response.ordenes && Array.isArray(response.ordenes)) {
          ordenesTemp = response.ordenes;
        }
        this.ordenes = ordenesTemp.map((x: any) => ({
          ...x,
          fechaProgramada: this.formatDate(x.fechaProgramada)
        }));
        this.loading = false;
      },
      error: () => {
        this.ordenes = [];
        this.loading = false;
      },
    });
  }
  filterGlobal(event: Event, dt: any) { 
    const inputValue = (event.target as HTMLInputElement)?.value || '';
    dt.filterGlobal(inputValue, 'contains');
  }

  filterMecHandler(mec: any) {
    const index1 = this.todosMecanicos.indexOf(mec);
    const index2 = this.mecanicosFiltrados.indexOf(mec);
  
    if (index1 !== -1) {
      this.todosMecanicos.splice(index1, 1);
      this.mecanicosFiltrados.push(mec);
    } else if (index2 !== -1) {
      this.mecanicosFiltrados.splice(index2, 1);
      this.todosMecanicos.push(mec);
    }
    this.cargarOrdenes();
  }

  clear(table: Table) {
    table.clear();
  }

  redirectToOTHandler(codigo: any) {
    this.codigoOTPendiente = codigo;
    this.mostrarValidacion = true;
  }

  validarYEditarOT(codigo: any) {
    this.dialogRef = this.dialogService.open(AuthMecanicaComponent, {
        header: 'Codigo de Autenticacion',
        width: '400px',
        modal: true,
        dismissableMask: false, 
        closable: false,
        data: {
          accion: 'AccederEditarOT'
        }
      });

    this.dialogRef.onClose.subscribe((result: { acceso: boolean,  token: any }) => {
      if (result.acceso) {
        this.codigoOTPendiente = codigo;
        this.onValidacionExitosa(result.token);
      } else {
        this.toastr.error('Codigo incorrecto', 'Error');
      }
    });
  }

  onValidacionExitosa(mecanicoAuth: any) {
    if (this.codigoOTPendiente) {
      this.messageService.add({
        severity: 'success',
        summary: 'Acceso Autorizado',
        detail: `Abriendo orden de trabajo ${this.codigoOTPendiente}`,
        life: 3000
      });
      
      this.router.navigate([`mecanica/${this.codigoOTPendiente}`]);
      
      this.codigoOTPendiente = '';
      this.permisosRequeridos = [];
    } else if (this.rutaPendiente) {
      this.messageService.add({
        severity: 'success',
        summary: 'Acceso Autorizado',
        detail: 'Redirigiendo...',
        life: 3000
      });
      this.router.navigate([this.rutaPendiente]);
      this.rutaPendiente = '';
      this.permisosRequeridos = [];
    }
  }

  onValidacionSinPermisos(mecanicoAuth: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Acceso Denegado',
      detail: `${mecanicoAuth.name} no tiene permisos para esta accion`,
      life: 5000
    });
    this.codigoOTPendiente = '';
    this.permisosRequeridos = [];
    this.rutaPendiente = '';
  }

  onCerrarValidacion() {
    this.mostrarValidacion = false;
    this.codigoOTPendiente = '';
    this.permisosRequeridos = [];
    this.rutaPendiente = '';
    }
  irANuevaOrden() {
    this.dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Codigo de Autenticacion',
      width: '400px',
      modal: true,
      dismissableMask: false, 
      closable: false,
      data: {
        accion: 'AgregarOT'
      }
    });
    
    this.dialogRef.onClose.subscribe((result: { acceso: boolean,  token: any }) => {
      if(result.acceso){
        this.router.navigate(['/mecanica/agregar-orden']);
      }
      else{
        this.messageService.add({
          severity: 'error',
          summary: 'Codigo incorrecto',
          detail: 'No se pudo autenticar el acceso a esta pagina',
          life: 5000
        });
      }
    });
  }
   showDialogExpand(code: string) {
    this.visibleExpand = true;
    this.loadingExpandDialog = true;
    this.codeExpandDialog = code;
    this.expandDataTables = [];
    this.expandCols = [];
    this.ExpandOptionsValue = '';
    this.selectedCodeObservacion = '';
    
    this.adjuntoImages = [];
    this.adjuntos = [];
    this.allTablesData = {
      tareas: [],
      repuestos: [],
      mecanicos: [],
      trabajosExternos: [],
      observaciones: [],
      solicitudes: []
    };
    
    this.otService.getOrdenTrabajoCodigo(code).subscribe({
      next: (response) => {
        this.ExpandItem = response;
        this.otService.getResumen(code).subscribe({
          next: (response) => {        
            this.ExpandOptions = [
              {code: response.totalTareas, name: 'Tareas'},
              {code: response.totalRepuestos, name: 'Repuestos'},
              {code: response.totalTrabajosExternos, name: 'Trab. Externos'},
              {code: response.totalObservaciones, name: 'Observaciones'},
              {code: response.totalSolicitudes, name: 'Solicitudes'}
            ];
            this.loadingExpandDialog = false;
          },
          error: (err) => {
            console.log("Error al solicitar Resumen de Orden de Trabajo: ", err);
            this.loadingExpandDialog = false;
          }
        });
      },
      error: (err) => {
        console.log("Error al solicitar Orden de Trabajo: ", err);
        this.loadingExpandDialog = false;
      }
    });
  }

  // Utilidades de formato
  formatDate(dateString: string): string {
    if (!dateString || dateString === 'Vacio') return 'Vacio';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Vacio';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  GetEstado(id: number) {
    const item = this.estado.find(x => x.code === id);  
    return item?.name;
  }

  GetPrioridad(id: number) {
    const item = this.prioridad.find(x => x.code === id);  
    return item?.name;
  }

  getSeverityEstado(status: number) {
    switch (status) {
      case 0: return undefined;
      case 1: return 'success';
      case 2: return 'warn';
      case 3: return 'danger';
      default: return 'secondary';
    }
  }

  getSeverityPrioridad(status: number) {
    switch (status) {
      case 4: return 'secondary';
      case 3: return 'info';
      case 2: return 'contrast';
      case 1: return 'warn';
      case 0: return 'danger';  
      default: return undefined;
    }
  }

  getEstadoVehiculo(id: string) {
    return this.estadoVehiculo.find(e => e.code.toString() == id)?.name;
  }

  getSupervisor(id: number) {
    return this.supervisor.find(s => s.code === id)?.name;
  }

  tablesOptionHandler() {
    this.selectedCodeObservacion = '';
    this.expandDataTables = [];
    this.expandCols = [];
    
    switch(this.ExpandOptionsValue) {
      case 'Tareas':
        this.tareaService.getTareasByOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;
            this.expandCols = HeadersTables.TareasList;
          },
          error: (err) => {
            this.expandDataTables = [];
            this.expandCols = [];
          }
        });
        break;
      case 'Repuestos':
        this.repuestoService.getRepuestosInsumosByOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;            
            this.expandCols = HeadersTables.RepuestoseInsumosList;
          },
          error: (err) => {
            this.expandDataTables = [];
            this.expandCols = [];
          }
        });
        break;
      case 'Trab. Externos':
        this.tareaService.getTareaExternaByOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;
            this.expandCols = HeadersTables.TrabajoExternoList;
          },
          error: (err) => {
            this.expandDataTables = [];
            this.expandCols = [];
          }
        });
        break;
      case 'Observaciones': 
        this.tareaService.getObservacionesTarea(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;
            this.expandCols = HeadersTables.ObservacionesTareaList;
          },
          error: (err) => {
            this.expandDataTables = [];
            this.expandCols = [];
          }
        });
        break;
      case 'Solicitudes':
        this.solicitudService.getSolicitudRepuestoTablaExpandOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;
            // Filtrar las columnas para excluir el campo 'actions'
            this.expandCols = HeadersTables.SolicitudTareaList.filter(col => col.field !== 'actions');
          },
          error: (err) => {
            this.expandDataTables = [];
            this.expandCols = [];
          }
        });
        break;
    }
  }

  redirectObservaciones(code: string) {
    this.ExpandOptionsValue = 'Observaciones';
    this.selectedCodeObservacion = code;
    this.tareaService.getObservacionesTarea(this.codeExpandDialog).subscribe({
      next: (response) => {
        this.expandDataTables = response;
        this.expandCols = HeadersTables.ObservacionesTareaList;
      },
      error: (err) => console.log(err)
    });
  }

  getAdjuntoNameById(id: number) {
    this.adjuntoService.getAdjuntoById(id).subscribe({
      next: (response) => {
        this.cargarArchivo(response.ruta);
      }
    });
  }

  cargarArchivo(fileName: string) {
    this.archivoService.getArchivo(fileName).subscribe(blob => {
      const mimeType = blob.type;

      if (mimeType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.archivoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
          this.tipoArchivo = 'imagen';
        };
        reader.readAsDataURL(blob);
      } else if (mimeType === 'application/pdf') {
        const url = URL.createObjectURL(blob);
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.tipoArchivo = 'pdf';
      }
    });
  }

  showExpandImage() {
    this.archivoUrl = '';
    this.displayImage = true;
  }

  getEstadoAprobacion(aprobado: boolean | null): string {
    if (aprobado === null) return 'Pendiente';
    return aprobado ? 'Aprobado' : 'Rechazado';
  }

  getSeverityAprobacion(aprobado: boolean | null): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    if (aprobado === null) return 'warn';
    return aprobado ? 'success' : 'danger';
  }

  getEstadoTareaTexto(estado: number | undefined | null): string {
    if (estado === undefined || estado === null) return 'Cargando...';
    
    switch (estado) {
      case 1: return 'Pendiente';
      case 2: return 'En Progreso';
      case 3: return 'Cancelado';
      case 4: return 'Finalizado';
      case 5: return 'Finalizado sin Exito';
      case 6: return 'Espera Repuesto';
      case 7: return 'Espera Mecanico';
      case 8: return 'Espera Aprobacion';
      default: return 'Sin definir';
    }
  }

  getEstadoTareaSeverity(estado: number | undefined | null): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    if (estado === undefined || estado === null) return 'secondary';
    
    switch (estado) {
      case 1: return 'info';      
      case 2: return 'warn';      
      case 3: return 'danger';    
      case 4: return 'success';   
      case 5: return 'danger';    
      case 6: return 'warn';      
      case 7: return 'warn';      
      case 8: return 'info';      
      default: return 'secondary';
    }
  }
   abrirDialogoOrdenTrabajo(codigoOT: string) {
    this.showDialogExpand(codigoOT);
  }
  formatCurrency(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  return typeof value === 'number' ? value : parseFloat(value) || 0;
}
}
