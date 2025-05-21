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
    {name: 'Activa', code: 0},
    {name: 'Espera', code: 1},
    {name: 'Finalizada', code: 2},
    {name: 'Cancelada', code: 3},
]