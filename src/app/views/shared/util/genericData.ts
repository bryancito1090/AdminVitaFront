export interface genericT {
    name: string;
    code: number;
}

export const EstadosOTs = [
    {name: 'Activo', code: 0},
    {name: 'Finalizado', code: 1},
    {name: 'Finalizado sin Exito', code: 2},
    {name: 'Anulado', code: 3},
];

export const PrioridadesOT = [
    {name: 'Crítico', code: 0},
    {name: 'Emergencia', code: 1},
    {name: 'Advertencia', code: 2},
    {name: 'Notificación', code: 3},
    {name: 'Baja prioridad', code: 4}
];

export const EstadosVehiculo = [
    {name: 'Operativo', code: 0},
    {name: 'Mantenimineto', code: 1},
    {name: 'Baja', code: 2}
];

export const EstadoTarea = [
  { name: 'Pendiente', code: 1, severity: 'info' },
  { name: 'Progreso', code: 2, severity: 'warning' },
  { name: 'Cancelado', code: 3, severity: 'danger' },
  { name: 'Finalizado', code: 4, severity: 'success' },
  { name: 'Finalizado sin éxito', code: 5, severity: 'danger' },
  { name: 'Espera Repuesto', code: 6, severity: 'secondary' },
  { name: 'Espera Mecánico', code: 7, severity: 'secondary' },
  { name: 'Espera Autorización ', code: 8, severity: 'warning' }
]