import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrdenTrabajoService } from '../../services/orden-trabajo.service';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { HeadersTablesMecanico } from '../../shared/util/tables';
import { DropdownModule } from 'primeng/dropdown';
import { EstadosVehiculo, EstadoTarea, genericT } from '../../shared/util/genericData';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { CrudTareaMecanicaComponent } from "./crud-tarea-mecanica/crud-tarea-mecanica.component";
import { TareasService } from '../../services/tareas.service';

@Component({
  selector: 'app-orden-trabajo-mecanica',
  imports: [
    CommonModule,
    CardModule,
    FormsModule,
    TagModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    SelectModule,
    InputTextModule,
    MultiSelectModule,
    CrudTareaMecanicaComponent
],
  standalone: true,
  templateUrl: './orden-trabajo-mecanica.component.html',
  styleUrl: './orden-trabajo-mecanica.component.scss'
})
export class OrdenTrabajoMecanicaComponent implements OnInit {
  
  codigo: string | null = null;

  OrdenTrabajo: any = null;

  prioridadTexto = ['Baja', 'Media', 'Alta', 'Crítica', 'Advertencia'];
  estadoTexto = ['Pendiente', 'Progreso', 'Finalizado'];
  estadoVehiculoTexto = ['Operativo', 'Fuera de servicio'];

  cols: any[] = [];
  loadingGeneral: boolean = true;
  loadingTable: boolean = true;
  TareasOT: any[] = [];

  selectedEstadoFilter!: genericT;
  estadosFilter!: genericT[];
  
  agregar_tarea_card: boolean = true;
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private toastr: ToastrService,
    private ordenTrabajoService: OrdenTrabajoService,
    private tareaService: TareasService,
  ) {}

  ngOnInit() {
    this.initData();
  }
  
  initData(){ 
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
    this.ordenTrabajoService.getOrdenTrabajoCodigo(this.codigo!).subscribe(
      (response) => {
        this.OrdenTrabajo = response;
        this.loadingGeneral = true; 
        this.getTareaOT();
      }
    );
  }
  getTareaOT() {
    this.tareaService.getTareasByOT(this.codigo!).subscribe({
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
  GetEstado(id: number)  {
    const item = this.estadosFilter.find(x => x.code === id);  
    return item?.name;
  }
  unirStrings(array: any): string {
    if (!array) return 'Ninguno';
    const str = array.join(', '); 
    
    return str;
  }
}
