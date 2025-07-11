import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { OrdenTrabajoService } from '../../services/orden-trabajo.service';
import { OrdenTrabajo, ordenTrabajoList } from '../../../../domain/response/OrdenTrabajoResponse.model';
import { Column, HeadersTables } from '../../shared/util/tables';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../auth/service/auth.service';
import { TextareaModule } from 'primeng/textarea';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MecanicoService } from '../../services/mecanico.service';
import { EstadosOTs, EstadosVehiculo, genericT, PrioridadesOT } from '../../shared/util/genericData';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ValidacionService } from '../../services/validacion.service';
import { ToastrService } from 'ngx-toastr';
import { ActualizarOrdenRequest, AgendarOrdenTrabajo } from '../../../../domain/request/OrdenTrabajoRequest.model';
import { DividerModule } from 'primeng/divider';
import { SkeletonExpandInfoComponent } from '../../shared/components/skeleton/skeleton-expand-info.component';
import { SkeletonSimpleComponent } from '../../shared/components/skeleton/skeleton-simple.component';
import { TareasService } from '../../services/tareas.service';
import { RepuestoService } from '../../services/repuesto.service';
import { SolicitudService } from '../../services/solicitud.service';
import { AdjuntoService } from '../../services/adjunto.service';
import { Adjunto } from '../../../../domain/response/Adjunto.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DatePipe } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { Image, ImageModule } from 'primeng/image';
import { ArchivosService } from '../../services/archivos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TooltipModule } from 'primeng/tooltip';

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

@Component({
  selector: 'app-orden-trabajo',
  imports: [
    CommonModule,
    TableModule,
    NgFor,
    NgIf,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormsModule,
    DialogModule,
    TextareaModule,
    ReactiveFormsModule,
    FloatLabel,
    SelectModule,
    DatePickerModule,
    TagModule,
    SelectButtonModule,
    BadgeModule,
    DropdownModule,
    ProgressSpinnerModule,
    DividerModule,
    SkeletonExpandInfoComponent,
    SkeletonSimpleComponent,
    ImageModule,
    TooltipModule
  ],
  standalone: true,
  templateUrl: './orden-trabajo.component.html',
  styleUrl: './orden-trabajo.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})

export class OrdenTrabajoComponent implements OnInit {
  @ViewChild('dt1') dt1!: Table;
  ordenes: ordenTrabajoList[] = [];
  cols!: Column[];

  expandDataTables: any[]=[]
  expandCols: Column[] = [];

  loading: boolean = true;
  loadingEditDialog: boolean = true;
  loadingExpandDialog: boolean = true;

  visibleAdd: boolean = false;   
  visibleEdit: boolean = false;   
  visibleExpand: boolean = false;

  fb_addOt!: FormGroup;
  fb_editOt!: FormGroup;

  estado!: genericT[];
  prioridad!: genericT[];
  supervisor!: genericT[];
  estadoVehiculo!: genericT[];
  fechaProgramada: Date | string | null = null;

  selectedCodeObservacion!: string;

  selectedEstadoFilter!: genericT;
  selectedPrioridadFilter!: genericT;

  minDate: Date | undefined;

  codeEditDialog: string = '';
  codeExpandDialog: string = '';

  archivoUrl: SafeResourceUrl | null = null;;
  tipoArchivo: string = '';
  displayImage: boolean = false;
  

  ExpandOptionsValue!: string;
  ExpandOptions!: genericT[];
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
    idSupervisor: 0,
    supervisor: ''
  };

  iconValidarDocumento: string = 'pi pi-search';
  adjuntoImages: { id: number, dataUrl: string }[] = [];
  adjuntos: Adjunto[] = [];
  iconValidarPlaca: string = 'pi pi-search';

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
estadosTarea = [
  { name: 'Pendiente', code: 1 },
  { name: 'En Progreso', code: 2 },
  { name: 'Cancelado', code: 3 },
  { name: 'Finalizado', code: 4 },
  { name: 'Finalizado sin éxito', code: 5 },
  { name: 'Espera Repuesto', code: 6 },
  { name: 'Espera Mecánico', code: 7 },
  { name: 'Espera Aprobación', code: 8 }
];

  constructor(
    private otService: OrdenTrabajoService,
    private auth: AuthService,
    private mecService: MecanicoService,  
    private validacionService: ValidacionService,
    private toastr: ToastrService,
    private tareaService: TareasService,
    private repuestoService: RepuestoService,
    private solicitudService: SolicitudService,
    private datePipe: DatePipe,
    private adjuntoService: AdjuntoService,
    private archivoService: ArchivosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {    
    this.cols = HeadersTables.OrdenesTrabajoList;
    this.estado = EstadosOTs;
    this.prioridad = PrioridadesOT;
    this.estadoVehiculo = EstadosVehiculo;
    this.minDate = new Date();
    this.GetOrdenesTrabajoList();
    this.mecService.getSupervisores().subscribe({
      next: (response) => {
        this.supervisor = response.map(x => ({
          name: x.nombre,
          code: x.idMecanico
        }));        
      },
      error: (err) => {
        console.log("Error al solicitar Supervisores: ", err);
      },
    })
    
    this.fb_addOt = new FormGroup({
      detalle: new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]),
      num_documento: new FormControl<string | null>(null, [Validators.required, Validators.minLength(10), Validators.maxLength(16)]),
      clienteId: new FormControl<number | null>(null, [Validators.required]),
      placa: new FormControl<string | null>(null, [Validators.required, Validators.minLength(7), Validators.maxLength(8)]),
      vehiculoId: new FormControl<number | null>(null, [Validators.required]),
      prioridad: new FormControl<genericT | null>(null, [Validators.required]),
      supervisor: new FormControl<genericT | null>(null, [Validators.required]),
      fechaProgramada: new FormControl<Date | null>(null, [Validators.required]),
      observacion: new FormControl<string | null>(null),
    }); 

    this.fb_editOt = new FormGroup({
      detalle: new FormControl<string | null>(null),
      nombreCliente: new FormControl<string | null>(null),
      placa: new FormControl<string | null>(null),
      estado: new FormControl<genericT | null>(null, [Validators.required]),
      prioridad: new FormControl<genericT | null>(null, [Validators.required]),
      supervisor: new FormControl<genericT | null>(null, [Validators.required]),
      fechaProgramada: new FormControl<Date | null>(null, [Validators.required]),
      observacion: new FormControl<string | null>(null),
    }); 

    this.fb_addOt.get('num_documento')?.valueChanges.subscribe(() => {
      this.fb_addOt.patchValue({clienteId: null});;
      this.iconValidarDocumento = 'pi pi-search';
    });

    this.fb_addOt.get('placa')?.valueChanges.subscribe(() => {
      this.fb_addOt.patchValue({vehiculoId: null})
      this.iconValidarPlaca = 'pi pi-search';
    })
  }
  GetOrdenesTrabajoList() {
    this.otService.getOrdenesTrabajoListado().subscribe({
      next: (response) => {
        this.ordenes = response.ordenes.map(x => ({
          ...x,
          fechaProgramada: this.formatDate(x.fechaProgramada)
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.log("Error al solicitar Ordenes de Trabajo: ", err);
      },
    });
  }
  formatDate(dateString: string): string {
    if(dateString === 'Vacío') return 'Vacío';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses van de 0 a 11
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  filterGlobal(event: Event, dt: any) { //filtro para barra de busqueda
    const inputValue = (event.target as HTMLInputElement)?.value || '';
    dt.filterGlobal(inputValue, 'contains');
  }
  clear(table: Table) {
    table.clear();
  }
  showDialogAdd() {
    this.visibleAdd = true;
  }  
showDialogEdit(code: string) {
  this.visibleEdit = true;
  this.loadingEditDialog = true;
  this.codeEditDialog = code;
  this.otService.getOrdenTrabajoCodigo(code).subscribe({
    next: (response: OrdenTrabajo) => {      
      console.log("Orden de Trabajo: ", response);  
      
      this.fb_editOt.patchValue({
        detalle: response.detalle,
        nombreCliente: response.nombreCliente,
        placa: response.placa,
        estado: response.estado, // ✅ Solo el código
        prioridad: response.prioridad, // ✅ Solo el código
        supervisor: response.idSupervisor, // ✅ Solo el código
        fechaProgramada: new Date(response.fechaProgramada),
        observacion: response.observacion,
      })
      
      this.fb_editOt.get('detalle')?.disable();
      this.fb_editOt.get('nombreCliente')?.disable();
      this.fb_editOt.get('placa')?.disable();

      this.loadingEditDialog = false;
    },
    error: (err) => {
      console.log("Error al solicitar Orden de Trabajo: ", err);
    }
  }) 
}
showDialogExpand(code: string){
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
      next: (response) =>{
        this.ExpandItem = response;
        this.otService.getResumen(code).subscribe({
          next: (response) => {        
            this.ExpandOptions =[
              {code: response.totalTareas, name: 'Tareas'},
              {code: response.totalRepuestos, name: 'Repuestos'},
              {code: response.totalRepuestos, name: 'Mecanicos'},
              {code: response.totalTrabajosExternos, name: 'Trab. Externos'},
              {code: response.totalObservaciones, name: 'Observaciones'},
              {code: response.totalSolicitudes, name: 'Solicitudes'}
            ];
            this.loadingExpandDialog = false;
          },
          error: (err) => {
            console.log("Error al solicitar Resumen de Orden de Trabajo: ", err);
          }
        });
      }
    })
  }
  createOT(): void {
  const fecha = this.fb_addOt.get('fechaProgramada')?.value;
  const ot: AgendarOrdenTrabajo = {
    codigoUsuario: this.auth.getUserCode() ?? '',
    idCliente: Number(this.fb_addOt.get('clienteId')?.value),
    idVehiculo: Number(this.fb_addOt.get('vehiculoId')?.value),
    idMecanico: Number(this.fb_addOt.get('supervisor')?.value),
    detalle: this.fb_addOt.get('detalle')?.value ?? '',
    prioridad: Number(this.fb_addOt.get('prioridad')?.value),
    estado: 0,
    fechaProgramada: fecha instanceof Date
      ? fecha.toISOString()
      : (fecha ? fecha : ''),
    observacion: this.fb_addOt.get('observacion')?.value ?? ''
  };
  console.log(ot);
  this.otService.createOrdenTrabajo(ot).subscribe({
    next: (response) => {
      this.toastr.success(response.message, "Orden de Trabajo agendada exitosamente!");
      this.visibleAdd = false;
      this.GetOrdenesTrabajoList();
    },
    error: (err) => {
      this.toastr.error(err.error, "Orden de Trabajo no pudo ser agendada!");
       }
  });
}
updateOT(): void {
  const ot: ActualizarOrdenRequest = {
    codigo: this.codeEditDialog,
    estado: this.fb_editOt.get('estado')?.value, 
    prioridad: this.fb_editOt.get('prioridad')?.value, 
    idMecanico: this.fb_editOt.get('supervisor')?.value, 
    fechaProgramada: this.fb_editOt.get('fechaProgramada')?.value,
    observacion: this.fb_editOt.get('observacion')?.value,
  }
  console.log(ot);
  this.otService.updateOrdenTrabajo(ot).subscribe({
    next: (response) => {
      this.toastr.success(response.message, "Actualización exitosa!");
      this.visibleEdit = false;
      this.GetOrdenesTrabajoList();
    },
    error: (err) => {
      this.toastr.error(err.error, "Actualización sin éxito!");
      console.log(err);
    }
  });
}
  GetEstado(id: number)  {
    const item = this.estado.find(x => x.code === id);  
    return item?.name;
  }
  GetPrioridad(id: number)  {
    const item = this.prioridad.find(x => x.code === id);  
    return item?.name;
  }
  getSeverityEstado(status: number) {
    switch (status) {
      case 0: return undefined;
      case 1: return 'success';
      case 2: return 'warn';
      case 3: return 'danger';
      default:
        return 'secondary';
    }
  }
  getSeverityPrioridad(status: number) {
    switch (status) {
      case 4: return 'secondary';
      case 3: return 'info';
      case 2: return 'contrast';
      case 1: return 'warn';
      case 0: return 'danger';  
      default: 
        return undefined;
    }
  }
  exportCSV() {
    // Obtener solo los datos filtrados (o todos si no hay filtro)
    const datosParaExportar = this.dt1.filteredValue || this.ordenes;
    // Preparar datos para exportación
    const exportData = datosParaExportar.map(orden => {
      // Crear un nuevo objeto para exportación
      const ordenExport: Record<string, any> = {};
      // Procesar cada columna
      this.cols.forEach(col => {
        if (!col.field || !col.header) return;
        // Caso especial para estado
        if (col.field === 'estado') {
          ordenExport[col.header] = this.GetEstado(Number(orden[col.field])) || '';
        }
        // Caso especial para prioridad
        else if (col.field === 'prioridad') {
          ordenExport[col.header] = this.GetPrioridad(Number(orden[col.field])) || '';
        }
        // Caso especial para fechas
         else if (col.field.includes('fecha') && orden[col.field]) {
        // Si la fecha ya está formateada (como string dd/MM/yyyy), usarla directamente
        if (typeof orden[col.field] === 'string' && orden[col.field].includes('/')) {
          ordenExport[col.header] = orden[col.field];
        } 
        // Si es una fecha sin formatear, formatearla
        else if (orden[col.field] !== 'Vacío') {
          ordenExport[col.header] = this.formatDate(orden[col.field]) || '';
        }
        // Si es 'Vacío', mantenerlo
        else {
          ordenExport[col.header] = orden[col.field];
        }
      }
        // Caso especial para supervisor
        else if (col.field === 'supervisor' && orden[col.field]) {
          ordenExport[col.header] = this.getSupervisor(orden[col.field]) || '';
        }
        // Caso general para otros campos
        else {
          ordenExport[col.header] = orden[col.field] || '';
        }
      });
      return ordenExport;
    });
    // Exportar a Excel
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { 'Ordenes_Trabajo': worksheet }, SheetNames: ['Ordenes_Trabajo'] };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      this.saveAsExcelFile(excelBuffer, "ordenes_trabajo");
    }).catch(err => {
      console.error('Error al exportar a Excel:', err);
      this.toastr.error('Hubo un problema al exportar los datos', 'Error');
    });
  }
  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName + '_' + this.datePipe.transform(new Date(), 'yyyy-MM-dd') + EXCEL_EXTENSION;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  OnExportButton() {
    this.exportCSV();
  }
  validarDocumento() {
    this.iconValidarDocumento = ''
    const numDocumento = this.fb_addOt.get('num_documento')?.value;
    this.validacionService.validarClienteXDoc(numDocumento).subscribe({
      next: (response) => {
        if(response.esClienteActivo){
          this.fb_addOt.patchValue({clienteId: response.idPersona});
          this.iconValidarDocumento = 'pi pi-check';
        }
        this.iconValidarDocumento = 'pi pi-check';  
      },
      error: (err) => {
        this.iconValidarDocumento = 'pi pi-search';
        this.toastr.warning(err.error, "Persona no encontrada!");
      }
    })
  }
  validarPlaca() {
    const placa = this.fb_addOt.get('placa')?.value;
    this.validacionService.validarVehiculoXPlaca(placa).subscribe({
      next: (response) => {
        this.fb_addOt.patchValue({vehiculoId: response.idVehiculo});  
        this.iconValidarPlaca = 'pi pi-check';
      },
      error: (err) => {
        this.iconValidarPlaca = 'pi pi-search';
        this.toastr.warning(err.error, "Vehiculo no encontrado!");
      }
    });
  }
  redirectObservaciones(code: string){
    this.ExpandOptionsValue = 'Observaciones';
    this.selectedCodeObservacion = code;
    this.tareaService.getObservacionesTarea(this.codeExpandDialog).subscribe({
      next: (response) => {
        this.expandDataTables = response;
        this.expandCols = HeadersTables.ObservacionesTareaList;
      },
      error: (err) => console.log(err)
    })
  }
  getSupervisor(id: number) {
    return this.supervisor.find(s => s.code === id)?.name;
  }
  getEstadoVehiculo(id:string) {
    return this.estadoVehiculo.find(e => e.code.toString() == id)?.name;
  }
  getAdjuntoNameById(id:number) {
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
        // Sanitizamos la URL antes de asignarla
        const url = URL.createObjectURL(blob);
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.tipoArchivo = 'pdf';
      } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.tipoArchivo = 'word';
      } else if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.tipoArchivo = 'excel';
      } else {
        this.tipoArchivo = 'desconocido';
        console.warn('Tipo de archivo no soportado:', mimeType);
      }
    });
  }
  showExpandImage() {
    this.archivoUrl = '';
    this.displayImage = true;
  }
 tablesOptionHandler(){
    this.selectedCodeObservacion = '';
    this.expandDataTables = [];
    this.expandCols = [];
    
    switch(this.ExpandOptionsValue){
      case 'Tareas':
        this.tareaService.getTareasByOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            console.log(response);
            this.expandDataTables = response;
            this.expandCols = HeadersTables.TareasList;
          },
          error: (err) => {
            this.expandDataTables = [];
            this.expandCols = [];
          }
        })
        break;
      case 'Repuestos':
        this.repuestoService.getRepuestosInsumosByOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;            
            this.expandCols = HeadersTables.RepuestoseInsumosList;
          },
          error: (err) => {
            console.log(err);
            this.expandDataTables = [];
            this.expandCols = [];
          }
        })
        break;
      case 'Mecanicos':
        this.mecService.getManoObraOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;
            this.expandCols = HeadersTables.ManoDeObraList;
          },
          error: (err) => {
            console.log(err);
            this.expandDataTables = [];
            this.expandCols = [];
          }
        });
        break;
      case 'Trab. Externos':
        this.tareaService.getTareaExternaByOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            console.log(response);
            this.expandDataTables = response;
            this.expandCols = HeadersTables.TrabajoExternoList;
          },
          error: (err) => {
            console.log(err);
            this.expandDataTables = [];
            this.expandCols = [];
          }
        })
        break;
      case 'Observaciones': 
        this.tareaService.getObservacionesTarea(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;
            this.expandCols = HeadersTables.ObservacionesTareaList;
          },
          error: (err) => {
            console.log(err);
            this.expandDataTables = [];
            this.expandCols = [];
          }
        })
        break;
      case 'Solicitudes':
        this.solicitudService.getSolicitudRepuestoTablaExpandOT(this.codeExpandDialog).subscribe({
          next: (response) => {
            this.expandDataTables = response;
            this.expandCols = HeadersTables.SolicitudTareaList;
          },
          error: (err) => {
            console.log(err);
            this.expandDataTables = [];
            this.expandCols = [];
          }
        })
        break;
    }
  }
  exportCompletePDF() {
    // Cargar todos los datos necesarios para el PDF
    const requests = {
      tareas: this.tareaService.getTareasByOT(this.codeExpandDialog),
      repuestos: this.repuestoService.getRepuestosInsumosByOT(this.codeExpandDialog),
      mecanicos: this.mecService.getManoObraOT(this.codeExpandDialog),
      trabajosExternos: this.tareaService.getTareaExternaByOT(this.codeExpandDialog),
      observaciones: this.tareaService.getObservacionesTarea(this.codeExpandDialog),
      solicitudes: this.solicitudService.getSolicitudRepuestoTablaExpandOT(this.codeExpandDialog)
    };
  
    forkJoin(requests).subscribe({
      next: (results) => {
        this.allTablesData = results;
        
        // Procesar observaciones y solicitudes para extraer los IDs de adjuntos
        const adjuntoIds: number[] = [];
        
        // Extraer IDs de adjuntos de observaciones
        if (results.observaciones && results.observaciones.length > 0) {
          results.observaciones.forEach(obs => {
            if (obs.idAdjunto) {
              adjuntoIds.push(obs.idAdjunto);
            }
          });
        }
        
        // Extraer IDs de adjuntos de solicitudes
        if (results.solicitudes && results.solicitudes.length > 0) {
          results.solicitudes.forEach(sol => {
            if (sol.idAdjunto) {
              adjuntoIds.push(Number(sol.idAdjunto));
            }
          });
        }
        
        // Si hay adjuntos, cargarlos
        if (adjuntoIds.length > 0) {
          this.loadAdjuntos(adjuntoIds);
        } else {
          // Si no hay adjuntos, generar el PDF directamente
          this.generateCompletePDF();
        }
      },
      error: (err) => {
        console.error('Error al cargar datos para el PDF:', err);
        this.toastr.error('No se pudieron cargar todos los datos para el PDF', 'Error');
      }
    });
  }
  // 3. Opcional: añadir un método para depurar las URLs de las imágenes
  private logImageUrls() {
    if (this.adjuntos && this.adjuntos.length > 0) {
      console.log("URLs de las imágenes:");
      this.adjuntos.forEach(adjunto => {
        const url = this.adjuntoService.getImagenUrl(adjunto.ruta);
        console.log(`- ID ${adjunto.idAdjunto}: ${url}`);
      });
    }
  }
  // 4. Modificar el método loadAdjuntos para incluir el logging
  private loadAdjuntos(adjuntoIds: number[]) {

    const adjuntoRequests: Observable<Adjunto>[] = [];
    
    adjuntoIds.forEach(id => {
      adjuntoRequests.push(this.adjuntoService.getAdjuntoById(id));
    });
    
    forkJoin(adjuntoRequests).subscribe({
      next: (adjuntos) => {
        this.adjuntos = adjuntos;
        console.log("Adjuntos cargados:", adjuntos.length);
        this.logImageUrls(); // Añadido para depuración
        this.loadAdjuntoImages();
      },
      error: (err) => {
        console.error('Error al cargar adjuntos:', err);
        this.toastr.warning('Algunos adjuntos no pudieron ser cargados', 'Advertencia');
        this.generateCompletePDF();
      }
    });
  }
  // Modificar el método loadAdjuntoImages para limpiar las rutas de archivos incorrectas
  private loadAdjuntoImages() {
    if (!this.adjuntos || this.adjuntos.length === 0) {
      this.generateCompletePDF();
      return;
    }
  
    console.log("Procesando adjuntos:", this.adjuntos);
    
    try {
      // Usar el servicio para generar URLs completas de los archivos
      this.adjuntoImages = this.adjuntos.map(adjunto => {
        const fileUrl = this.adjuntoService.getArchivoUrl(adjunto.ruta);
        console.log(`URL generada para el adjunto ${adjunto.idAdjunto}: ${fileUrl}`);
        
        return {
          id: adjunto.idAdjunto,
          dataUrl: fileUrl,
          nombre: adjunto.nombre || `Adjunto ${adjunto.idAdjunto}`,
          tipoArchivo: adjunto.tipoArchivo || 'application/octet-stream'
        };
      });
      
      console.log("URLs de archivos generadas:", this.adjuntoImages.map(img => ({id: img.id, url: img.dataUrl})));
    } catch (error) {
      console.error("Error procesando adjuntos:", error);
      this.toastr.warning("Algunos adjuntos podrían no mostrarse correctamente en el PDF", "Advertencia");
    }
    
    // Generar el PDF independientemente de si hubo errores o no
    this.generateCompletePDF();
  }
   // Método para agregar logo a todas las páginas - con manejo de errores
  private addLogoToAllPages(doc: jsPDF) {
    try {
      // Logo en formato base64 (reemplazar con el logo real de ISTPET)
      const logoBase64 = 'data:image/png;base64,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';
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.addImage(logoBase64, 'PNG', 10, 10, 50, 20);
      }
      console.log("Logo añadido correctamente");
    } catch (error) {
      console.error("Error al agregar el logo:", error);
    }
  }
  // Método para aplicar fondo y decoraciones a todas las páginas
  private applyBackgroundToAllPages(doc: jsPDF) {
    const totalPages = doc.getNumberOfPages() || 1;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Para cada página existente y posibles nuevas páginas
    const applyToPage = (pageNum: number) => {
      doc.setPage(pageNum);
      
      // Eliminar fondos oscuros y usar fondo blanco limpio
      
      // Borde sutil en la parte inferior para el footer
      const rgb = this.hexToRgb('#1f295b'); // Nuevo color institucional
      doc.setDrawColor(rgb.r, rgb.g, rgb.b);
      doc.setLineWidth(0.5);
      doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
    };
    
    // Aplicar a las páginas existentes
    for (let i = 1; i <= totalPages; i++) {
      applyToPage(i);
    }
    
    // Capturar evento de nueva página para aplicar el mismo estilo
    const originalAddPage = doc.addPage;
    doc.addPage = function() {
      originalAddPage.call(this);
      applyToPage(this.getNumberOfPages());
      return this;
    };
  }
  hexToRgb(hex: string): { r: number, g: number, b: number } {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  // Método para agregar una sección con una caja decorativa
  private addSectionWithBox(doc: jsPDF, title: string, y: number, width: number = 190, xOffset: number = 10): number {
    const rgb = this.hexToRgb('#1f295b');
    
    // Título de la sección en MAYÚSCULAS
    doc.setFontSize(12); // Aumentado de 11 a 12
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text(title.toUpperCase(), xOffset + 5, y);
    
    // Dibujar borde para la caja con más grosor
    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    doc.setLineWidth(0.8); // Aumentado grosor de línea
    doc.roundedRect(xOffset, y - 5, width, 8, 1, 1, 'S');
    
    // Restaurar colores
    doc.setTextColor(0);
    doc.setLineWidth(0.3);
    
    return y;
  }
  // Método para agregar una tabla de clave-valor con más espacio
  private addKeyValueTable(doc: jsPDF, data: {key: string, value: string}[], y: number, width: number = 190, xOffset: number = 10): number {
    const rgb = this.hexToRgb('#1f295b');
    
    // Calculate height based on actual content
    const rowHeight = 8; // Reduced from 12 to 8
    const rowPadding = 2; // Additional padding between rows
    const boxPadding = 6; // Padding inside the box (reduced from 10)
    
    // Calculate exact height needed for content
    const boxHeight = (data.length * (rowHeight + rowPadding)) + boxPadding;
    
    // Draw box with exact height
    doc.setDrawColor(rgb.r, rgb.g, rgb.b, 0.5);
    doc.setLineWidth(0.3);
    doc.roundedRect(xOffset, y, width, boxHeight, 2, 2, 'S');
    
    // Create table with content-appropriate spacing
    autoTable(doc, {
      body: data.map(item => [
        {content: item.key+':', styles: {fontStyle: 'bold'}}, 
        {content: item.value, styles: {cellWidth: 'wrap'}}
      ]),
      startY: y + 3, // Reduced top padding
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 2, // Reduced padding
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: {
          cellWidth: 40, // Reduced width for labels
          textColor: [rgb.r, rgb.g, rgb.b],
          fontStyle: 'bold'
        },
        1: {
          cellWidth: 'auto',
          minCellWidth: 100
        }
      },
      margin: { left: xOffset + 5, right: xOffset + 5 }
    });
    
    // Get the exact final Y position
    return (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || (y + boxHeight);
  }
  // Generar el PDF completo con el nuevo layout
    generateCompletePDF() {
      const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Aplicar fondo y decoraciones
      this.applyBackgroundToAllPages(doc);
      
      // Agregar logo 
      this.addLogoToAllPages(doc);
      
      // Dejar más espacio para el logo
      let y = 40; // Aumentado de 30 a 40
      
      // Título en MAYÚSCULAS y con más destaque
      const titleRgb = this.hexToRgb('#1f295b');
      doc.setFontSize(20); // Aumentado tamaño de fuente
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(titleRgb.r, titleRgb.g, titleRgb.b);
      doc.text('ORDEN DE TRABAJO: ' + this.codeExpandDialog.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 20; // Más espacio después del título
      
      // Fecha de generación
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
      doc.text(`Generado el: ${currentDate}`, pageWidth - 15, 15, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const fullWidth = 190;
      const leftMargin = 10;
      
      // Sección: Descripción
    this.addSectionTitle(doc, 'Descripción', y);
    y += 7;
    this.addKeyValueTable(doc, [
      { key: 'Detalle', value: this.ExpandItem.detalle || 'No disponible' },
      { key: 'Prioridad', value: this.GetPrioridad(this.ExpandItem.prioridad) || 'No disponible' },
      { key: 'Estado', value: this.GetEstado(this.ExpandItem.estado) || 'No disponible' },
      { key: 'Fecha inicio', value: this.formatDate(this.ExpandItem.fechaCreada ? this.ExpandItem.fechaCreada.toString() : 'Vacío') },
      { key: 'Fecha programada', value: this.formatDate(this.ExpandItem.fechaProgramada ? this.ExpandItem.fechaProgramada.toString() : 'Vacío') },
      { key: 'Fecha fin', value: this.formatDate(this.ExpandItem.fechaFinalizacion ? this.ExpandItem.fechaFinalizacion.toString() : 'Vacío') }
    ], y);
    y += 70; 
        // Sección: Vehículo
    this.addSectionTitle(doc, 'Vehículo', y);
    y += 7;
    this.addKeyValueTable(doc, [
      { key: 'Código', value: this.ExpandItem.codigoVehiculo || 'No disponible' },
      { key: 'Placa', value: this.ExpandItem.placa || 'No disponible' },
      { key: 'Kilometraje', value: (this.ExpandItem.kilometraje || '0') + ' km' },
      { key: 'Año', value: this.formatDate(this.ExpandItem.anio ? this.ExpandItem.anio.toString() : 'Vacío') },
      { key: 'Estado (Institucional)', value: this.getEstadoVehiculo(this.ExpandItem.estadoVehiculo) || 'No disponible' },
      { key: 'Propietario', value: this.ExpandItem.propietario || 'No disponible' }
    ], y);
    y += 70;
  
  // Sección: Cliente
  this.addSectionTitle(doc, 'Cliente', y);
  y += 7;
  this.addKeyValueTable(doc, [
    { key: 'Nombre', value: this.ExpandItem.nombreCliente || 'No disponible' },
    { key: 'Celular', value: this.ExpandItem.celular || 'No disponible' },
    { key: 'Correo', value: this.ExpandItem.correo || 'No disponible' },
    { key: 'Dirección', value: this.ExpandItem.direccion || 'No disponible' },
    { key: 'Supervisor', value: this.getSupervisor(this.ExpandItem.idSupervisor) || 'No disponible' }
  ], y);
  y += 30;
    // 1. Tareas
    if (this.allTablesData.tareas && this.allTablesData.tareas.length > 0) {
      y = this.checkAndAddPage(doc, y, 40);
      y = this.addTableToDocument(doc, 'Tareas', this.allTablesData.tareas, HeadersTables.TareasList, y);
      y += 15;
    }
    
    // 2. Repuestos
    if (this.allTablesData.repuestos && this.allTablesData.repuestos.length > 0) {
      y = this.checkAndAddPage(doc, y, 40);
      y = this.addTableToDocument(doc, 'Repuestos', this.allTablesData.repuestos, HeadersTables.RepuestoseInsumosList, y);
      y += 15;
    }
    
    // 3. Mecánicos
    if (this.allTablesData.mecanicos && this.allTablesData.mecanicos.length > 0) {
      y = this.checkAndAddPage(doc, y, 40);
      y = this.addTableToDocument(doc, 'Mecánicos', this.allTablesData.mecanicos, HeadersTables.ManoDeObraList, y);
      y += 15;
    }
    
    // 4. Trabajos Externos
    if (this.allTablesData.trabajosExternos && this.allTablesData.trabajosExternos.length > 0) {
      y = this.checkAndAddPage(doc, y, 40);
      y = this.addTableToDocument(doc, 'Trabajos Externos', this.allTablesData.trabajosExternos, HeadersTables.TrabajoExternoList, y);
      y += 15;
    }
    
      // 5. Observaciones con adjuntos
if (this.allTablesData.observaciones && this.allTablesData.observaciones.length > 0) {
  y = this.checkAndAddPage(doc, y, 40);
  y = this.addTableToDocument(doc, 'Observaciones', this.allTablesData.observaciones, HeadersTables.ObservacionesTareaList, y);
  
  // Agregar imágenes de adjuntos de observaciones
  if (this.adjuntoImages && this.adjuntoImages.length > 0) {
    y += 10;
    y = this.addAdjuntosToDocument(
      doc, 
      { text: 'Adjunto de Observaciones', style: 'subheading' },
      this.allTablesData.observaciones
        .filter(obs => obs.idAdjunto)
        .map(obs => obs.idAdjunto), 
      y
    );
    y += 15;
  }
}

// 6. Solicitudes con adjuntos
if (this.allTablesData.solicitudes && this.allTablesData.solicitudes.length > 0) {
  y = this.checkAndAddPage(doc, y, 40);
  y = this.addTableToDocument(doc, 'Solicitudes', this.allTablesData.solicitudes, HeadersTables.SolicitudTareaList, y);
  
  // Agregar imágenes de adjuntos de solicitudes
  if (this.adjuntoImages && this.adjuntoImages.length > 0) {
    y += 10;
    y = this.addAdjuntosToDocument(
      doc, 
      { text: 'Adjunto de Solicitudes', style: 'subheading' },
      this.allTablesData.solicitudes
        .filter(sol => sol.idAdjunto)
        .map(sol => sol.idAdjunto), 
      y
    );
  }
}
    
    // Agregar numeración de páginas con estilo mejorado
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 10);
      
      // Agregar un footer o pie de página en cada página
      this.addFooter(doc, pageHeight);
    }
    
    // Guardar el PDF
    doc.save(`Orden_Trabajo_${this.codeExpandDialog}_Completo.pdf`);
  }   
  // Método para agregar un pie de página
  private addFooter(doc: jsPDF, pageHeight: number) {
    const rgb = this.hexToRgb('#1f295b'); // Nuevo color institucional
    doc.setFontSize(8);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Confidencial - Uso exclusivo de ISTPET', 10, pageHeight - 10);
  }
  // Método para el manejo de texto largo
  private truncateText(text: string, maxLength: number): string {
    if (!text) return 'No disponible';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  // Método para verificar y agregar una nueva página si es necesario
  private checkAndAddPage(doc: jsPDF, y: number, requiredSpace: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + requiredSpace > pageHeight - 20) { // 20 es el margen inferior
      doc.addPage();
      return 20; // Reiniciar la posición Y en la nueva página
    }
    return y;
  }
  // Método para agregar una tabla al documento con estilo mejorado
  private addTableToDocument(doc: jsPDF, title: string, data: any[], headers: any[], y: number): number {
    // Agregar título de sección con caja
    y = this.addSectionWithBox(doc, title, y);
    y += 7;
    
    // Preparar cabeceras y datos para la tabla
    const tableHeaders = headers.map(col => col.header);
    const tableData = data.map(item => 
      headers.map(col => {
        // Transformar el valor según el campo
        if (col.field.includes('fecha') && item[col.field]) {
          return this.datePipe.transform(item[col.field], 'dd/MM/yyyy') || 'N/A';
        }
        return item[col.field] !== undefined && item[col.field] !== null ? item[col.field].toString() : 'N/A';
      })
    );
    
    // Convertir color hex a decimal
    const rgb = this.hexToRgb('#1f295b');
    
    // Agregar la tabla al PDF con estilo mejorado
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: y,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [220, 220, 220]
      },
      headStyles: {
        fillColor: [rgb.r, rgb.g, rgb.b],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 248, 252]
      },
      columnStyles: {
        0: {cellWidth: 'auto'}, // Primera columna con ancho automático
      },
      margin: { left: 10, right: 10 },
      didParseCell: function(data) {
        if (data.row.index === 0) {
          data.cell.styles.lineWidth = 0.5;
        }
      }
    });
    
    // Usar aserción de tipo para acceder a lastAutoTable
    return (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 5;
  }
  private addSectionTitle(doc: jsPDF, title: string, y: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text(title, 10, y);
    doc.setTextColor(0);
    doc.setDrawColor(0, 102, 204);
    doc.line(10, y + 1, 200, y + 1);
  }
  // Modificación del método para agregar adjuntos al documento
  private addAdjuntosToDocument(doc: jsPDF, title: string | { text: string, style: string }, adjuntosIds: number[], y: number): number {
  // No hacer nada si no hay adjuntos o imágenes cargadas
  if (!adjuntosIds || adjuntosIds.length === 0 || !this.adjuntoImages || this.adjuntoImages.length === 0) {
    return y;
  }
  
  // Determinar el texto del título
  const titleText = typeof title === 'string' ? title : title.text;
  const isSubheading = typeof title === 'object' && title.style === 'subheading';
  
  // Agregar título de sección con caja pero con estilo diferente si es subheading
  if (isSubheading) {
    // Aplicar estilo de subtítulo (sin caja o con estilo diferente)
    doc.setFontSize(12); // Tamaño más pequeño para subtítulo
    doc.setFont('helvetica', 'bold');
    doc.text(titleText, 20, y);
    y += 5;
  } else {
    // Estilo original con caja
    y = this.addSectionWithBox(doc, titleText, y);
  }
  
  y += 10;
  
  // Tamaño máximo para las imágenes
  const maxWidth = 120;
  const maxHeight = 80;
  
  // Agregar cada adjunto que corresponda a las IDs proporcionadas
  for (const id of adjuntosIds) {
    // Buscar la imagen cargada que corresponde a este ID
    const adjuntoInfo = this.adjuntoImages.find(img => img.id === id);
    if (adjuntoInfo) {
      // Verificar si es necesario cambiar de página
      y = this.checkAndAddPage(doc, y, maxHeight + 30);
      
      // Encontrar el adjunto correspondiente para obtener su nombre y tipo
      const adjunto = this.adjuntos.find(adj => adj.idAdjunto === id);
      const nombre = adjunto ? adjunto.nombre : `Adjunto #${id}`;
      const tipoArchivo = adjunto ? adjunto.tipoArchivo : '';
      
      // Agregar un subtítulo para el adjunto
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(nombre, 20, y);
      y += 5;
      
      // Determinar si es una imagen o un archivo para descargar
      const esImagen = this.esArchivoImagen(tipoArchivo);
      
      if (esImagen) {
        try {
          // Intentar agregar la imagen
          doc.addImage(adjuntoInfo.dataUrl, 'JPEG', 20, y, maxWidth, maxHeight, undefined, 'FAST');
          y += maxHeight + 15;
        } catch (error) {
          console.error(`Error al agregar imagen ${id} al PDF:`, error);
          y = this.agregarPlaceholderImagen(doc, nombre, adjuntoInfo.dataUrl, 20, y, maxWidth, maxHeight);
        }
      } else {
        // Es un archivo para descargar, agregar un botón/enlace
        y = this.agregarEnlaceDescarga(doc, nombre, tipoArchivo, adjuntoInfo.dataUrl, 20, y);
      }
    }
  }
  
  return y;
  }
  // Método para verificar si un archivo es una imagen
  private esArchivoImagen(tipoArchivo: string): boolean {
    if (!tipoArchivo) return false;
    
    const tiposImagen = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    
    // Si el tipo MIME está disponible directamente
    if (tiposImagen.includes(tipoArchivo.toLowerCase())) {
      return true;
    }
    
    // Si solo tenemos la extensión
    const extensiones = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = tipoArchivo.toLowerCase().split('.').pop();
    return extension ? extensiones.includes(extension) : false;
  }
  // Método para agregar un placeholder de imagen cuando hay error
  private agregarPlaceholderImagen(doc: jsPDF, nombre: string, url: string, x: number, y: number, width: number, height: number): number {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y, width, height, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`[Imagen no disponible: ${nombre}]`, x + 20, y + 30);
    
    // Truncar la URL si es muy larga
    const urlCorta = url.length > 60 ? url.substring(0, 57) + '...' : url;
    doc.text(`Referencia: ${urlCorta}`, x + 20, y + 45);
    
    return y + height + 15;
  }
  // Método para agregar un enlace de descarga para archivos no-imagen
  private agregarEnlaceDescarga(doc: jsPDF, nombre: string, tipoArchivo: string, url: string, x: number, y: number): number {
    // Obtener ícono según tipo de archivo
    const icono = this.obtenerIconoTipoArchivo(tipoArchivo);
    
    // Crear un recuadro para el archivo
    const rgb = this.hexToRgb('#f2f6fc');
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(x, y, 170, 40, 3, 3, 'FD');
    
    // Dibujar ícono
    doc.setFontSize(20);
    doc.setTextColor(80, 80, 80);
    doc.text(icono, x + 15, y + 20);
    
    // Información del archivo
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(nombre, x + 40, y + 15);
    
    // Tipo de archivo y tamaño (si está disponible)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const infoArchivo = tipoArchivo || 'Documento';
    doc.text(infoArchivo, x + 40, y + 25);
    
    // Agregar un enlace clicable para descargar
    const linkWidth = 80;
    const linkHeight = 12;
    const linkX = x + 40;
    const linkY = y + 27;
    
    // Dibujar botón de descarga
    const linkRgb = this.hexToRgb('#1f295b');
    doc.setFillColor(linkRgb.r, linkRgb.g, linkRgb.b);
    doc.roundedRect(linkX, linkY, linkWidth, linkHeight, 2, 2, 'F');
    
    // Texto del botón
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("DESCARGAR ARCHIVO", linkX + linkWidth/2, linkY + linkHeight/2 + 2, { align: 'center' });
    
    // Asegurarse de que la URL no tenga la referencia a C:// o rutas locales
    const cleanedUrl = this.cleanFileUrl(url);
    
    // Agregar link con URL del archivo para descarga
    doc.link(linkX, linkY, linkWidth, linkHeight, { url: cleanedUrl });
    
    return y + 50; // Espacio para el siguiente elemento
  }
  // Método para limpiar una URL de archivo de rutas del sistema
  private cleanFileUrl(url: string): string {
    // Si la URL ya es una URL HTTP/HTTPS completa, devolverla sin cambios
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Obtener la base URL del servicio
    const baseUrl = 'http://localhost:7267';
    
    // Si la URL tiene referencias a rutas del sistema
    if (url.includes('c://') || url.includes('C://') || url.includes('c:\\') || url.includes('C:\\')) {
      // Extraer la parte después de "Uploads/"
      const uploadMatch = url.match(/Uploads[\/\\](.+)$/);
      if (uploadMatch && uploadMatch[1]) {
        return `${baseUrl}/api/archivos/Uploads/${uploadMatch[1]}`;
      }
      
      // Si no hay un patrón de "Uploads", extraer solo el nombre del archivo
      const fileMatch = url.match(/[\/\\]([^\/\\]+\.[a-zA-Z0-9]+)$/);
      if (fileMatch && fileMatch[1]) {
        return `${baseUrl}/api/archivos/Uploads/${fileMatch[1]}`;
      }
    }
    
    // Si la URL no tiene un patrón reconocible, devolverla con el prefijo API correcto
    if (url.includes('/api/archivos/')) {
      return url;
    }
    
    // Caso predeterminado: asegurarse de que tenga el prefijo correcto
    return `${baseUrl}/api/archivos/Uploads/${url.split('/').pop()}`;
  }
  // Método para obtener un ícono según el tipo de archivo
  private obtenerIconoTipoArchivo(tipoArchivo: string): string {
    if (!tipoArchivo) return '[DOC]'; // Documento genérico
    
    const tipo = tipoArchivo.toLowerCase();
    
    if (tipo.includes('pdf') || tipo.endsWith('.pdf')) {
      return '[PDF]';
    } else if (tipo.includes('excel') || tipo.includes('spreadsheet') || 
              tipo.endsWith('.xls') || tipo.endsWith('.xlsx') || tipo.endsWith('.csv')) {
      return '[XLS]';
    } else if (tipo.includes('word') || tipo.includes('document') || 
              tipo.endsWith('.doc') || tipo.endsWith('.docx')) {
      return '[DOC]';
    } else if (tipo.includes('zip') || tipo.includes('rar') || tipo.includes('compressed') ||
              tipo.endsWith('.zip') || tipo.endsWith('.rar') || tipo.endsWith('.7z')) {
      return '[ZIP]';
    } else if (tipo.includes('audio') || tipo.endsWith('.mp3') || tipo.endsWith('.wav')) {
      return '[AUD]';
    } else if (tipo.includes('video') || tipo.endsWith('.mp4') || tipo.endsWith('.avi')) {
      return '[VID]';
    } else if (tipo.includes('image') || tipo.endsWith('.jpg') || tipo.endsWith('.jpeg') || 
              tipo.endsWith('.png') || tipo.endsWith('.gif')) {
      return '[IMG]';
    } else {
      return '[DOC]';
    }
  }
// Actualizar el método getSeverityAprobacion para que devuelva el tipo correcto

// Método para obtener la severidad del estado de aprobación
getSeverityAprobacion(aprobado: boolean | null): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
  if (aprobado === null) return 'warning' as "warn"; // PrimeNG usa 'warn' no 'warning'
  return aprobado ? 'success' : 'danger';
}

// También agrega estos métodos si no los tienes:
getEstadoAprobacion(aprobado: boolean | null): string {
  if (aprobado === null) return 'Pendiente';
  return aprobado ? 'Aprobado' : 'Rechazado';
}

aprobarSolicitud(codigo: string) {
  this.solicitudService.actualizarAprobacionSolicitud(codigo, true).subscribe({
    next: (response) => {
      this.toastr.success('Solicitud aprobada exitosamente', 'Éxito');
      // Recargar los datos de la tabla
      this.tablesOptionHandler();
    },
    error: (error) => {
      console.error('Error al aprobar solicitud:', error);
      this.toastr.error('Error al aprobar la solicitud', 'Error');
    }
  });
}

rechazarSolicitud(codigo: string) {
  this.solicitudService.actualizarAprobacionSolicitud(codigo, false).subscribe({
    next: (response) => {
      this.toastr.success('Solicitud rechazada exitosamente', 'Éxito');
      // Recargar los datos de la tabla
      this.tablesOptionHandler();
    },
    error: (error) => {
      console.error('Error al rechazar solicitud:', error);
      this.toastr.error('Error al rechazar la solicitud', 'Error');
    }
  });
}
getEstadoTareaTexto(estado: number | undefined | null): string {
  if (estado === undefined || estado === null) return 'Cargando...';
  
  switch (estado) {
    case 1: return 'Pendiente';
    case 2: return 'En Progreso';
    case 3: return 'Cancelado';
    case 4: return 'Finalizado';
    case 5: return 'Finalizado sin éxito';
    case 6: return 'Espera Repuesto';
    case 7: return 'Espera Mecánico';
    case 8: return 'Espera Aprobación';
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
}
