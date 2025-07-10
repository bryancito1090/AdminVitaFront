import { Component, OnInit, ViewChild } from '@angular/core';
import { Column, HeadersTables } from '../../shared/util/tables';
import { Item } from '../../../../domain/response/Item.model';
import { ItemService } from '../../services/item.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SkeletonSimpleComponent } from '../../shared/components/skeleton/skeleton-simple.component';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { MagnitudService } from '../../services/magnitud.service';
import { RadioButton, RadioButtonModule } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Divider, DividerModule } from 'primeng/divider';
import { FloatLabel, FloatLabelModule } from 'primeng/floatlabel';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { MovimientoItem } from '../../../../domain/response/Movimiento.model';
import { CreateUpdateItemRequest } from '../../../../domain/request/Item.model';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { ToastrService } from 'ngx-toastr';
import { TagModule } from 'primeng/tag';
interface Month {
  value: string;
  label: string;
  shortLabel: string;
  year: number;
  month: number;
}
interface Day {
  date: Date;
  dateStr: string;
  day: number;
  dayOfWeek: number;
  count: number;
  movimientos?: MovimientoItem[]; 
}
interface MonthData {
  month: Month;
  days: Day[];
}
@Component({
  selector: 'app-inventario',
  providers: [DatePipe], 
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    NgFor,
    NgIf,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    SkeletonSimpleComponent,
    ChipModule,
    TooltipModule,
    CalendarModule,
    RadioButton,
    Divider,
    FloatLabel,
    InputNumber,
    TextareaModule,
    DropdownModule,
    MessageModule,
    InputNumberModule,
    FloatLabelModule,
    DividerModule,
    RadioButtonModule,
    ButtonModule,
    DialogModule,
    TagModule,
    ChipModule,
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  @ViewChild('dt5') dt5!: Table; 
  Items: Item[] = [];
  cols!: Column[];

  loading: boolean = true;
  loadingMovimientosDialog: boolean = true;

  colsMovimientos!: Column[];
  movimientos: any[] = [];
  magnitudes: any[] = [];
  tiposItem: any[] = [];

  fb_item!: FormGroup;
  isntTool: boolean = true;

  visibleMovimientos: boolean = false;
  visibleCrearItem: boolean = false;

  fechaSeleccionada: Date | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  mostrandoTodosLosMeses: boolean = true;

  selectedMonths: string[] = [];
  availableMonths: Month[] = [];
  calendarData: MonthData[] = [];
  itemCodigo: string = '';
  itemNombre: string = '';

  weekdays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  selectedDate: Date | null = null;
  selectedDayMovimientos: MovimientoItem[] = [];

  mostrarMagnitud : boolean = false;
  mostrarValorUnitario : boolean = false;

  constructor( 
    private itemService: ItemService,
    private datePipe: DatePipe,
    private magnitudService: MagnitudService,
    private toastr: ToastrService,
  ){}

  ngOnInit(): void {
    this.initData();
    this.configurarMesActual();
  }
  getItems(){
    this.itemService.getItemsList().subscribe({
      next: (response) => {
        this.Items = response;
        this.loading = false;
      },
      error: (err) => console.error(err)
    })
  }
  initData(){
    this.cols = HeadersTables.InventarioList; 
    this.colsMovimientos = HeadersTables.MovimientosItemList;
    this.getItems();
    this.magnitudService.getMagnitudes().subscribe({
      next: (response) => {
        this.magnitudes = response;
      },
      error: (err) => console.error(err)
    })
    this.tiposItem = [
        { name: 'Repuesto', key: 1},
        { name: 'Insumo', key: 2},
        { name: 'Herramienta', key: 3},
    ];
    this.fb_item = new FormGroup({
      idTipoItem: new FormControl<number | null>(null, [Validators.required]),
      idMagnitud: new FormControl<number | null>(null),
      nombre: new FormControl<string | null>(null, [Validators.required]),
      descripcion: new FormControl<string | null>(null),
      valorUnitario: new FormControl<number | null>(null), // ✅ Remover required por defecto
      stockMin: new FormControl<number | null>(null, [Validators.required]),
      stockIdeal: new FormControl<number | null>(null, [Validators.required]),
    });    

    this.fb_item.get('idTipoItem')?.valueChanges.subscribe((value) => {
      this.resetForm();
      this.configurarCamposPorTipo(value);
    })
  }

configurarCamposPorTipo(value: any) {
  if (!value) return;
  
  const tipoItem = value.key || null;
  
  // Resetear validadores
  this.fb_item.get('valorUnitario')?.clearValidators();
  this.fb_item.get('idMagnitud')?.clearValidators();
  
  switch (tipoItem) {
    case 1: // Repuesto
      this.mostrarMagnitud = false;
      this.mostrarValorUnitario = false;
      this.isntTool = true; // Mantener stocks visibles
      break;
      
    case 2: // Insumo
      this.mostrarMagnitud = true;
      this.mostrarValorUnitario = false;
      this.isntTool = true; // Mantener stocks visibles
      // ✅ AGREGAR VALIDACIÓN REQUERIDA PARA MAGNITUD EN INSUMOS
      this.fb_item.get('idMagnitud')?.setValidators([Validators.required]);
      break;
      
    case 3: // Herramienta
      this.mostrarMagnitud = false; // ✅ CAMBIAR A false - Las herramientas NO tienen magnitud
      this.mostrarValorUnitario = false;
      this.isntTool = false; // Ocultar stocks
      // Para herramientas, establecer stocks en 0
      this.fb_item.get('stockMin')?.setValue(0);
      this.fb_item.get('stockIdeal')?.setValue(0);
      break;
      
    default:
      this.mostrarMagnitud = false;
      this.mostrarValorUnitario = false;
      this.isntTool = true;
      break;
  }
  
  // Actualizar validadores
  this.fb_item.get('valorUnitario')?.updateValueAndValidity();
  this.fb_item.get('idMagnitud')?.updateValueAndValidity();
}

  showMovimientosItem(codigo: number) {
    this.visibleMovimientos = true;
    this.loadingMovimientosDialog = true;
    this.itemService.getMovimientosXItems(codigo).subscribe({
      next: (response) => {
        this.movimientos = response;
        this.loadingMovimientosDialog = false;
        if (this.movimientos.length > 0) {
          this.itemCodigo = this.movimientos[0].codigo;
          this.itemNombre = this.movimientos[0].nombre;
          this.initializeMonths();
          this.configurarMesActual();
          this.aplicarFiltroMes();
        }
      },
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
        this.loadingMovimientosDialog = false;
      }
    });
  }
  clear(table: Table) {
    table.clear();
  }
  filterGlobal(event: Event, dt: any) {
    const inputValue = (event.target as HTMLInputElement)?.value || '';
    dt.filterGlobal(inputValue, 'contains');
  }
  openDialogAddItem(){
    this.visibleCrearItem = true;
    this.isntTool = true;
  }
  closeDialogCrearItem(){
    this.visibleCrearItem = false;
    this.fb_item.reset();
    this.mostrarMagnitud = false;
    this.mostrarValorUnitario = false;
    this.isntTool = true;
  }
  resetForm(){
    this.fb_item.get('idMagnitud')?.setValue(null);
    this.fb_item.get('nombre')?.setValue(null);
    this.fb_item.get('descripcion')?.setValue(null);
    this.fb_item.get('valorUnitario')?.setValue(null);
    this.fb_item.get('stockMin')?.setValue(null);
    this.fb_item.get('stockIdeal')?.setValue(null);
    this.mostrarMagnitud = false;
    this.mostrarValorUnitario = false;
  }
 crearteItem() {
  const item: CreateUpdateItemRequest = {
    idItem: 0, 
    idTipoItem: this.fb_item.value.idTipoItem.key,
    idMagnitud: this.fb_item.value.idMagnitud || null, 
    nombre: this.fb_item.value.nombre,
    descripcion: this.fb_item.value.descripcion,
    valorUnitario: this.fb_item.value.valorUnitario,
    stockMin: this.fb_item.value.stockMin || 0,
    stockIdeal: this.fb_item.value.stockIdeal || 0, 
  }

  this.itemService.createUpdateItem(item).subscribe({
    next: (response) => {
      this.visibleCrearItem = false;
      this.toastr.success('Item Creado Exitosamente', 'Éxito!');
      this.fb_item.reset();
      this.getItems();
      // this.messageService.add({severity:'success', summary:'Éxito', detail:'Item creado correctamente'});
    }, 
    error: (err) => {
      console.error('Error al crear item:', err);
      let errorMessage = 'Error desconocido';
      if (err.error?.message) {
        errorMessage = err.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      console.error('Mensaje de error:', errorMessage);
      
      // this.messageService.add({severity:'error', summary:'Error', detail: errorMessage});
      this.visibleCrearItem = false;
      this.fb_item.reset();
    }
  });
}
  exportCSV() {
    if (!this.dt5) {
      console.error('La tabla no está lista para exportar. Intente nuevamente en unos segundos.');
      return;
    }
    const datosParaExportar = this.dt5.filteredValue || this.Items;
    const exportData = datosParaExportar.map(item => {
      const itemExport: Record<string, any> = {};
      this.cols.forEach(col => {
        if (!col.field || !col.header) return;
        if (col.field === 'magnitud') {
          itemExport[col.header] = item['nombreMagnitud'] || '';
        }
        // Caso especial para valores monetarios
        else if (col.field === 'valorUnitario') {
          itemExport[col.header] = `$${Number(item[col.field]).toFixed(2)}`;
        }
        // Caso general para otros campos
        else if (col.field !== 'actions') { // Excluir columna de acciones
          itemExport[col.header] = item[col.field] !== undefined ? item[col.field] : '';
        }
      });
      return itemExport;
    });
    
    // Exportar a Excel
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { 'Inventario': worksheet }, SheetNames: ['Inventario'] };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      this.saveAsExcelFile(excelBuffer, "inventario");
    }).catch(err => {
      console.error('Error al exportar a Excel:', err);
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
    try {
      this.exportCSV();
    } catch (error) {
      console.error('Error al exportar datos:', error);
    }
  }
  generateAllMonths(): Month[] {
    if (!this.movimientos.length) return [];
    const dates = this.movimientos.map(item => new Date(item.fechaMovimiento));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const months: Month[] = [];
    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (currentDate <= maxDate) {
      months.push({
        value: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        label: new Intl.DateTimeFormat('es', { year: 'numeric', month: 'long' }).format(currentDate),
        shortLabel: new Intl.DateTimeFormat('es', { month: 'short' }).format(currentDate),
        year: currentDate.getFullYear(),
        month: currentDate.getMonth()
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
  }
  initializeMonths(): void {
    const months = this.generateAllMonths();
    this.availableMonths = months;
    this.selectedMonths = months.map(m => m.value); // Seleccionar todos por defecto
    this.processCalendarData();
  }
  processCalendarData(): void {
    if (this.selectedMonths.length === 0 || !this.movimientos.length) {
      console.warn('No hay meses seleccionados o no hay movimientos');
      this.calendarData = [];
      return;
    }
    const monthsInfo = this.availableMonths.filter(m => this.selectedMonths.includes(m.value))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
    const calendarStructure: MonthData[] = [];
    monthsInfo.forEach(monthInfo => {
      const year = monthInfo.year;
      const month = monthInfo.month;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days: Day[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayMovimientos = this.movimientos.filter(item => {
          return item.fechaMovimiento && item.fechaMovimiento.substring(0, 10) === dateStr;
        });
        const count = dayMovimientos.length;
        days.push({
          date,
          dateStr,
          day,
          dayOfWeek: date.getDay(),
          count,
          movimientos: dayMovimientos 
        });
      }
      calendarStructure.push({
        month: monthInfo,
        days
      });
    });
    this.calendarData = calendarStructure;
  }
  getColor(count: number): string {
    if (count === 0) return '#e4f0ff';
    if (count <= 2) return '#bdd8ff';
    if (count <= 5) return '#91baff';
    return '#4285f4';
  }

  handleSelectAll(select: boolean): void {
    if (select) {
      this.selectedMonths = this.availableMonths.map(m => m.value);
    } else {
      this.selectedMonths = [];
    }
    this.processCalendarData();
  }
  generateEmptySpaces(length: number): number[] {
    return Array(length).fill(0).map((_, i) => i);
  }
configurarMesActual() {
  const fechaActual = new Date();
  // Configurar al primer día del mes actual para evitar problemas con fechas
  this.fechaSeleccionada = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  this.seleccionarMes();
}

seleccionarMes() {
  if (!this.fechaSeleccionada) return;
  
  const año = this.fechaSeleccionada.getFullYear();
  const mes = this.fechaSeleccionada.getMonth();
  
  // Establecer fechas de inicio y fin del mes completo
  this.fechaInicio = new Date(año, mes, 1);
  this.fechaFin = new Date(año, mes + 1, 0);
}

aplicarFiltroMes() {
  if (!this.fechaSeleccionada) return;
  
  this.mostrandoTodosLosMeses = false;
  
  const año = this.fechaSeleccionada.getFullYear();
  const mes = this.fechaSeleccionada.getMonth() + 1; // JavaScript meses son 0-11
  const mesValor = `${año}-${mes.toString().padStart(2, '0')}`;
  
  this.selectedMonths = [mesValor];
  
  this.processCalendarData();
}

limpiarFiltroMes() {
  
  this.configurarMesActual();
  
  const fechaActual = new Date();
  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth() + 1; // JavaScript meses son 0-11
  const mesActualValor = `${año}-${mes.toString().padStart(2, '0')}`;
  
  console.log('Configurando mes actual:', mesActualValor);
  
  this.selectedMonths = [mesActualValor];
  this.mostrandoTodosLosMeses = false;
  
  this.processCalendarData();
}

handleMonthChange(monthValue: string): void {
  if (this.selectedMonths.includes(monthValue)) {
    this.selectedMonths = this.selectedMonths.filter(m => m !== monthValue);
  } else {
    this.selectedMonths = [...this.selectedMonths, monthValue];
  }
  this.processCalendarData();
}
  getTooltipContent(day: Day): string {
    if (!day.movimientos || day.movimientos.length === 0) {
      return `<div class="tooltip-title">${this.datePipe.transform(day.date, 'dd/MM/yyyy')}</div>
              <div>No hay movimientos</div>`;
    }
    let content = `<div class="tooltip-title">${this.datePipe.transform(day.date, 'dd/MM/yyyy')}</div>`;
    content += `<div class="tooltip-summary">`;
    const summary = {
      ingreso: 0,
      egreso: 0,
      prestamo: 0,
      devuelto: 0
    };
    day.movimientos.forEach(mov => {
      switch(mov.movimiento) {
        case 0: summary.ingreso++; break;
        case 1: summary.egreso++; break;
        case 2: summary.prestamo++; break;
        case 3: summary.devuelto++; break;
      }
    });
    if (summary.ingreso > 0) content += `<div class="tooltip-item"><span class="tooltip-dot ingreso"></span>Ingresos: ${summary.ingreso}</div>`;
    if (summary.egreso > 0) content += `<div class="tooltip-item"><span class="tooltip-dot egreso"></span>Egresos: ${summary.egreso}</div>`;
    if (summary.prestamo > 0) content += `<div class="tooltip-item"><span class="tooltip-dot prestamo"></span>Préstamos: ${summary.prestamo}</div>`;
    if (summary.devuelto > 0) content += `<div class="tooltip-item"><span class="tooltip-dot devuelto"></span>Devoluciones: ${summary.devuelto}</div>`;
    content += `</div>`;
    content += `<div style="margin-top: 6px; font-weight: 500;">Total: ${day.count} movimiento(s)</div>`;
    return content;
  }
  getMovimientosSummary(movimientos: MovimientoItem[]): any[] {
    if (!movimientos || movimientos.length === 0) return [];
    const types = new Set(movimientos.map(m => m.movimiento));
    return Array.from(types).map(tipo => ({ tipo }));
  }
  getTipoMovimiento(tipo: number): string {
    switch(tipo) {
      case 0: return 'Ingreso';
      case 1: return 'Egreso';
      case 2: return 'Préstamo';
      case 3: return 'Devolución';
      default: return 'Desconocido';
    }
  }
  showDayDetail(day: Day): void {
    if (!day.movimientos || day.movimientos.length === 0) return;
    this.selectedDate = day.date;
    this.selectedDayMovimientos = day.movimientos;
  }
}