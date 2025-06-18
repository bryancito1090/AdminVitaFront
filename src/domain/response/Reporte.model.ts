// Modelo para los datos por mes
export interface OrdenesPorMesDto {
  mes: number;
  nombreMes: string;
  ordenesActivo: number;
  ordenesFinalizado: number;
  ordenesFSE: number;
  ordenesAnuladas: number;
}

// Modelo para el dataset de la gráfica
export interface DatasetDto {
  label: string;
  data: number[];
  yAxisID: string;
}

// Modelo para la estructura de datos de la gráfica
export interface GraficaDto {
  labels: string[];
  datasets: DatasetDto[];
}

// Modelo para la respuesta completa del reporte
export interface ReporteOrdenTrabajoResponseDto {
  totalOrdenesActivo: number;
  totalOrdenesFinalizado: number;
  totalOrdenesFSE: number;
  totalOrdenesAnuladas: number;
  ordenesPorMes: OrdenesPorMesDto[];
  datosGrafica: GraficaDto;
}