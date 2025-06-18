import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ordenTrabajoList } from '../../../domain/response/OrdenTrabajoResponse.model';
import { OrdenTrabajoService } from '../services/orden-trabajo.service';
import { EstadosOTs, EstadosVehiculo, genericT, PrioridadesOT } from '../shared/util/genericData';
import { HeadersTables } from '../shared/util/tables';
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
import { ValidarAccionMecanicoComponent } from '../shared/components/validar-accion-mecanico/validar-accion-mecanico.component';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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
    ValidarAccionMecanicoComponent,
    ToastModule
],
  providers: [DatePipe, MecanicoService, OrdenMecanicoService, MessageService],
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
  constructor(
    private datePipe: DatePipe,
    private mecanicoService: MecanicoService,
    private ordenMecanicoService: OrdenMecanicoService,
    private router: Router,
     private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cols = HeadersTables.OrdenesTrabajoList as TableColumn[];
    this.estado = EstadosOTs;
    this.prioridad = PrioridadesOT;
    this.estadoVehiculo = EstadosVehiculo;
    this.minDate = new Date();
    this.cargarMecanicos();
  }
  cargarMecanicos(): void {
    this.mecanicoService.getMecanicos().subscribe({
      next: (response) => {
        this.todosMecanicos = response || [];
        this.mecanicosFiltrados = [];
        this.cargarOrdenes();
      },
      error: (err) => {
        console.error('Error al cargar mecánicos:', err);
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
        if (ordenesTemp.length === 0) {
          console.warn('No se encontraron órdenes en la respuesta:', response);
        }
        this.ordenes = ordenesTemp.map((x: any) => ({
          ...x,
          fechaProgramada: this.formatDate(x.fechaProgramada)
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error("Error al solicitar Ordenes de Trabajo: ", err);
        this.ordenes = [];
        this.loading = false;
      },
    });
  }
  formatDate(dateString: string): string {
    if(dateString === 'Vacío') return 'Vacío';
    // Usar DatePipe para formatear la fecha
    const formattedDate = this.datePipe.transform(dateString, 'dd/MM/yyyy');
    return formattedDate || 'Fecha inválida';
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
    } else {
      console.warn('El valor no se encuentra en ninguno de los dos arreglos.');
    }
    this.cargarOrdenes();  }
  clear(table: Table) {
    table.clear();
  }
redirectToOTHandler(codigo: any) {
  this.codigoOTPendiente = codigo;
  this.mostrarValidacion = true;
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
validarYEditarOT(codigo: any) {
    console.log('🚀 Iniciando validación para editar OT:', codigo);
    
    // Guardar el código y mostrar modal
    this.codigoOTPendiente = codigo;
    this.permisosRequeridos = ['Ordenes de Trabajo.Editar']; // ✅ Pasar los permisos requeridos
    this.mostrarValidacion = true;
  }

  // ✅ MÉTODO PARA VER DETALLES (sin validación de permisos)
  verDetallesOT(codigo: any) {
    console.log('👁️ Ver detalles de OT:', codigo);
    // Aquí puedes agregar lógica para ver detalles sin validación
    // Por ejemplo: abrir modal de detalles, navegar a vista de solo lectura, etc.
  }

onValidacionExitosa(mecanicoAuth: any) {
    console.log('✅ Validación exitosa:', mecanicoAuth);
    
    // Si hay un código de OT pendiente (viene del botón de editar)
    if (this.codigoOTPendiente) {
      console.log('📝 Abriendo OT para editar:', this.codigoOTPendiente);
      
      // ✅ MOSTRAR TOAST DE ÉXITO
      this.messageService.add({
        severity: 'success',
        summary: 'Acceso Autorizado',
        detail: `Abriendo orden de trabajo ${this.codigoOTPendiente}`,
        life: 3000
      });
      
      // Abrir la OT específica
      const url = `mecanica/${this.codigoOTPendiente}`;
      window.open(url, '_blank');
      
      // Limpiar
      this.codigoOTPendiente = '';
      this.permisosRequeridos = [];
    }
    // Si hay una ruta pendiente (viene de solicitarAcceso)
    else if (this.rutaPendiente) {
      console.log('🚀 Navegando a ruta:', this.rutaPendiente);
      
      // ✅ MOSTRAR TOAST DE ÉXITO
      this.messageService.add({
        severity: 'success',
        summary: 'Acceso Autorizado',
        detail: 'Redirigiendo...',
        life: 3000
      });
      
      // Navegar a la ruta especificada
      this.router.navigate([this.rutaPendiente]);
      
      // Limpiar
      this.rutaPendiente = '';
      this.permisosRequeridos = [];
    }
  }
  onValidacionSinPermisos(mecanicoAuth: any) {
    console.log('❌ Usuario sin permisos:', mecanicoAuth);
    
    // ✅ MOSTRAR TOAST DE ERROR
    this.messageService.add({
      severity: 'error',
      summary: 'Acceso Denegado',
      detail: `${mecanicoAuth.name} no tiene permisos para esta acción`,
      life: 5000
    });
    
    // Limpiar variables
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
}