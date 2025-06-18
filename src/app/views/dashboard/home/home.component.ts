import { CommonModule, DatePipe, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { ReporteService } from '../../services/reporte.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { max } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';

interface Mecanico {
  nombre: string;
  apellidos: string;
  totalUnidadesTiempo: number;
}
@Component({
  selector: 'app-home',
  imports: [ChartModule, ProgressSpinnerModule,CommonModule,CalendarModule,ButtonModule,FormsModule,DatePipe, AccordionModule,PaginatorModule
  ],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
 OrdenesData: any;
  OrdenesOptions: any;
  loading: boolean = true;
  
  // Add these properties to fix template errors
  loadingAnual: boolean = true;
  OrdenesAnualesData: any;
  OrdenesAnualesOptions: any;
  reporteAnualData: any = {
    totalOrdenesActivo: 0,
    totalOrdenesFinalizado: 0,
    totalOrdenesFSE: 0,
    totalOrdenesAnuladas: 0
  };

  KardexData: any;
  KardexOptions: any;

  mechanics: Mecanico[] = [];
  maxUnits: number = 0;
  loadingMechanics: boolean = true;

  topItemsData: any = {
    ingresos: [],
    egresos: []
  };
  
  activeItemsTab: 'ingresos' | 'egresos' = 'ingresos';
  loadingTopItems: boolean = false;

  vehiculos: any[] = [];
  loadingVehiculos: boolean = true;
  vehiculosRows: number = 3;
  vehiculosFirst: number = 0;
  paginatedVehiculos: any[] = [];

  kardexFechaInicio: Date | null = null;
  kardexFechaFin: Date | null = null;
  kardexMensajeError: string = '';
  kardexLoading: boolean = false;

  fechaSeleccionada: Date | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  mensajeError: string = '';
  
  reporteData: any = {
    totalOrdenesActivo: 0,
    totalOrdenesFinalizado: 0,
    totalOrdenesFSE: 0,
    totalOrdenesAnuladas: 0
  };

  constructor(
    private cd: ChangeDetectorRef,
    private reporteService: ReporteService,
  ) {}

  platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.initChartOptions();
    this.initKardexChartOptions(); 
    this.getReportOrdenesData(); 
    this.getReportOrdenesAnualesData(); // Add this method call
    this.loadKardexData();
    this.loadMechanicsData();
    this.loadTopItems();
    this.loadVehiculosData();
  }

  // Add this method to load annual data
  getReportOrdenesAnualesData() {
    this.loadingAnual = true;
    this.reporteService.getReporteOrdenes().subscribe({
      next: (response) => {
        this.updateAnualChartWithData(response);
        // Actualizar datos de totales anuales
        this.reporteAnualData = {
          totalOrdenesActivo: response.totalOrdenesActivo || 0,
          totalOrdenesFinalizado: response.totalOrdenesFinalizado || 0,
          totalOrdenesFSE: response.totalOrdenesFSE || 0,
          totalOrdenesAnuladas: response.totalOrdenesAnuladas || 0
        };
        
        this.loadingAnual = false;
        this.cd.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar datos anuales:', error);
        this.loadingAnual = false;
        this.cd.markForCheck();
      }
    });
  }

  // Add this method to update annual chart data
  updateAnualChartWithData(response: any) {
    if (!response || !response.datosGrafica) {
      console.warn('No se encontraron datos para la gráfica anual');
      return;
    }

    const documentStyle = getComputedStyle(document.documentElement);
    
    // Asignar colores y propiedades visuales a los datasets
    const colors = [
      documentStyle.getPropertyValue('--p-cyan-500'),    // Activas
      documentStyle.getPropertyValue('--p-green-500'),   // Finalizadas
      documentStyle.getPropertyValue('--p-orange-500'),  // FSE
      documentStyle.getPropertyValue('--p-red-500')      // Anuladas
    ];

    // Copiar la estructura de datos pero añadiendo los colores
    const formattedDatasets = response.datosGrafica.datasets.map((dataset: any, index: number) => {
      return {
        ...dataset,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
      };
    });

    // Actualizar los datos de la gráfica
    this.OrdenesAnualesData = {
      labels: response.datosGrafica.labels,
      datasets: formattedDatasets
    };

    this.cd.markForCheck();
  }
 
  getReportOrdenesData() {
    this.loading = true;
    this.reporteService.getReporteOrdenes().subscribe({
      next: (response) => {
        this.updateChartWithData(response);
        // Actualizar datos de totales
        this.reporteData = {
          totalOrdenesActivo: response.totalOrdenesActivo || 0,
          totalOrdenesFinalizado: response.totalOrdenesFinalizado || 0,
          totalOrdenesFSE: response.totalOrdenesFSE || 0,
          totalOrdenesAnuladas: response.totalOrdenesAnuladas || 0
        };
        
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        // En caso de error, usar datos de ejemplo
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  updateChartWithData(response: any) {
    if (!response || !response.datosGrafica) {
      console.warn('No se encontraron datos para la gráfica');
      return;
    }

    const documentStyle = getComputedStyle(document.documentElement);
    
    // Asignar colores y propiedades visuales a los datasets
    const colors = [
      documentStyle.getPropertyValue('--p-cyan-500'),    // Activas
      documentStyle.getPropertyValue('--p-green-500'),   // Finalizadas
      documentStyle.getPropertyValue('--p-orange-500'),  // FSE
      documentStyle.getPropertyValue('--p-red-500')      // Anuladas
    ];

    // Copiar la estructura de datos pero añadiendo los colores
    const formattedDatasets = response.datosGrafica.datasets.map((dataset: any, index: number) => {
      return {
        ...dataset,
        fill: false,
        borderColor: colors[index % colors.length],
        tension: 0.4
      };
    });

    // Actualizar los datos de la gráfica
    this.OrdenesData = {
      labels: response.datosGrafica.labels,
      datasets: formattedDatasets
    };

    this.cd.markForCheck();
  }

  initChartOptions() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');
  
      this.OrdenesOptions = {
        stacked: false,
        maintainAspectRatio: false,
        aspectRatio: window.innerWidth < 992 ? 1 : 0.6,
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value} órdenes`;
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Órdenes por Mes',
            color: textColor,
            font: {
              size: 16
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            },
            title: {
              display: true,
              text: 'Meses del Año',
              color: textColor
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Órdenes Activas/Finalizadas',
              color: textColor
            },
            min: 0,                    // Establecer mínimo en 0
            ticks: {
              color: textColorSecondary,
              precision: 0,            // Solo números enteros
              stepSize: 1,             // Incrementos de 1 en 1
              callback: function(value: number) {
                if (Math.floor(value) === value) {
                  return value;        // Mostrar solo si es entero
                }
                return null;           // No mostrar decimales
              }
            },
            grid: {
              color: surfaceBorder
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Órdenes FSE/Anuladas',
              color: textColor
            },
            min: 0,                    // Establecer mínimo en 0
            ticks: {
              color: textColorSecondary,
              precision: 0,            // Solo números enteros
              stepSize: 1,             // Incrementos de 1 en 1
              callback: function(value: number) {
                if (Math.floor(value) === value) {
                  return value;        // Mostrar solo si es entero
                }
                return null;           // No mostrar decimales
              }
            },
            grid: {
              drawOnChartArea: false,
              color: surfaceBorder
            }
          }
        }
      };
      
      // Add chart options for the annual chart
      this.OrdenesAnualesOptions = {
        stacked: false,
        maintainAspectRatio: false,
        aspectRatio: window.innerWidth < 992 ? 1 : 0.6,
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value} órdenes`;
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Órdenes Anuales',
            color: textColor,
            font: {
              size: 16
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            },
            title: {
              display: true,
              text: 'Meses del Año',
              color: textColor
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Número de Órdenes',
              color: textColor
            },
            min: 0,
            ticks: {
              color: textColorSecondary,
              precision: 0,
              stepSize: 1,
              callback: function(value: number) {
                if (Math.floor(value) === value) {
                  return value;
                }
                return null;
              }
            },
            grid: {
              color: surfaceBorder
            }
          }
        }
      };
    }
  }
  establecerMesActualKardex() {
    const hoy = new Date();
    // Primer día del mes actual
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicio.setHours(0, 0, 0, 0);
    
    // Último día del mes actual
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    fin.setHours(23, 59, 59, 999);
    
    this.kardexFechaInicio = inicio;
    this.kardexFechaFin = fin;
  }
  
  aplicarFiltroKardex() {
    if (!this.kardexFechaInicio || !this.kardexFechaFin) {
      this.kardexMensajeError = 'Por favor seleccione un rango de fechas válido';
      return;
    }
    
    if (this.kardexFechaInicio > this.kardexFechaFin) {
      this.kardexMensajeError = 'La fecha de inicio no puede ser posterior a la fecha final';
      return;
    }
    
    this.kardexMensajeError = '';
    this.loadKardexData(this.kardexFechaInicio, this.kardexFechaFin);
  }
  
  limpiarFiltrosKardex() {
    this.kardexFechaInicio = null;
    this.kardexFechaFin = null;
    this.kardexMensajeError = '';
    
    this.cd.detectChanges();
    this.loadKardexData();
  }
  
  // En tu método loadKardexData, actualiza con lo siguiente:
  loadKardexData(fechaInicio?: Date | null, fechaFin?: Date | null) {
    this.kardexLoading = true;
    // Si no hay fechas, no envía nada (undefined)
    this.reporteService.getReporteKardex(fechaInicio || undefined, fechaFin || undefined).subscribe({
      next: (response) => {
        this.initKardexChartWithData(response);
        this.kardexLoading = false;
        this.cd.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar datos de Kardex:', error);
        this.initKardexChartWithSampleData();
        this.kardexLoading = false;
        this.cd.markForCheck();
      }
    });
  }

  initKardexChartWithSampleData() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      
      this.KardexData = {
        datasets: [
          {
            data: [8, 4, 2, 1],
            backgroundColor: [
              documentStyle.getPropertyValue('--p-green-500'),
              documentStyle.getPropertyValue('--p-red-500'),
              documentStyle.getPropertyValue('--p-blue-500'),
              documentStyle.getPropertyValue('--p-orange-500')
            ],
            label: 'Movimientos de Inventario'
          }
        ],
        labels: ['Ingresos', 'Egresos', 'Préstamos', 'Devoluciones']
      };
    }
  }

// Añade este nuevo método para inicializar los datos del gráfico de Kardex
initKardexChartWithData(data: any) {
  if (isPlatformBrowser(this.platformId)) {
    const documentStyle = getComputedStyle(document.documentElement);
    
    // Crear arreglo de datos y etiquetas a partir de la respuesta
    const chartData = [
      data.totalIngresos || 0,
      data.totalEgresos || 0,
      data.totalPrestamo || 0,
      data.totalDevolucion || 0
    ];
    
    // Si todos los valores son 0, agregar un valor mínimo para que se vea el gráfico
    const allZeros = chartData.every(value => value === 0);
    if (allZeros) {
      chartData[0] = 0.1; // Agrega un valor mínimo para que se muestre algo
    }
    
    this.KardexData = {
      datasets: [
        {
          data: chartData,
          backgroundColor: [
            documentStyle.getPropertyValue('--p-green-500'),  // Ingresos
            documentStyle.getPropertyValue('--p-red-500'),    // Egresos
            documentStyle.getPropertyValue('--p-blue-500'),   // Préstamos
            documentStyle.getPropertyValue('--p-orange-500')  // Devoluciones
          ],
          label: 'Movimientos de Inventario'
        }
      ],
      labels: ['Ingresos', 'Egresos', 'Préstamos', 'Devoluciones']
    };
    
    // Inicializa las opciones del gráfico si no se ha hecho
    if (!this.KardexOptions) {
      this.initKardexChartOptions();
    }
    
    this.cd.markForCheck();
  }
}

// Opciones del gráfico (separadas para mejor organización)
initKardexChartOptions() {
  if (isPlatformBrowser(this.platformId)) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.KardexOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}`;
            }
          }
        },
        title: {
          display: true,
          text: 'Movimientos de Inventario',
          color: textColor,
          font: {
            size: 16
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: surfaceBorder
          },
          ticks: {
            color: textColorSecondary,
            precision: 0,            
            stepSize: 1            
          }
        }
      }
    };
  }
}

loadMechanicsData() {
  this.reporteService.getUnidadTiempoByMecanico().subscribe({
    next: (data: Mecanico[]) => {
      this.loadingMechanics = false;
      this.mechanics = data;
      this.maxUnits = this.mechanics.length > 0 
        ? Math.max(...this.mechanics.map(m => m.totalUnidadesTiempo))
        : 0;
    },
    error: (error: any) => {
      console.error('Error al cargar datos de mecánicos:', error);
    }
  });
}

getBarWidth(mechanic: Mecanico): number {
  if (this.maxUnits === 0) return 0;
  return (mechanic.totalUnidadesTiempo / this.maxUnits) * 100;
}

getPercentage(mechanic: Mecanico): string {
  const totalUnits = this.mechanics.reduce((sum, m) => sum + m.totalUnidadesTiempo, 0);
  if (totalUnits === 0) return '0%';
  const percentage = (mechanic.totalUnidadesTiempo / totalUnits) * 100;
  return `${percentage.toFixed(1)}%`;
}
getActiveTopItems(): any[] {
  return this.topItemsData[this.activeItemsTab] || [];
}

// Método para cargar los datos
loadTopItems() {
  this.loadingTopItems = true;
  
  this.reporteService.getTopItems().subscribe({
    next: (response: any) => {
      if (response) {
        this.topItemsData = {
          ingresos: response.topIngresos || [],
          egresos: response.topEgresos || []
        };
      }
      this.loadingTopItems = false;
    },
    error: (error: any) => {
      console.error('Error al cargar top items:', error);
      this.topItemsData = { ingresos: [], egresos: [] };
      this.loadingTopItems = false;
    }
  });
}

loadVehiculosData() {
  this.loadingVehiculos = true;
  this.reporteService.getVehiculosMatriculados().subscribe({
    next: (data: any[]) => {
      this.vehiculos = data || [];
      this.updatePagination();
      this.loadingVehiculos = false;
    },
    error: (error: any) => {
      console.error('Error al cargar datos de vehículos:', error);
      this.vehiculos = [];
      this.paginatedVehiculos = [];
      this.loadingVehiculos = false;
    }
  });
}

// Método para actualizar los vehículos paginados
updatePagination() {
  this.paginatedVehiculos = this.vehiculos.slice(
    this.vehiculosFirst, 
    this.vehiculosFirst + this.vehiculosRows
  );
}

// Manejador de evento de cambio de página
onPageChange(event: any) {
  this.vehiculosFirst = event.first;
  this.vehiculosRows = event.rows;
  this.updatePagination();
}
// Método para obtener texto del estado
getEstadoTexto(estado: number): string {
  switch(estado) {
    case 0: return 'OPERATIVO';
    case 1: return 'MANTENIMIENTO';
    case 2: return 'BAJA';
    default: return 'DESCONOCIDO';
  }
}

// Método para obtener clase CSS según estado
getEstadoClass(estado: number): string {
  switch(estado) {
    case 0: return 'estado-operativo';
    case 1: return 'estado-mantenimiento';
    case 2: return 'estado-baja';
    default: return '';
  }
}
}