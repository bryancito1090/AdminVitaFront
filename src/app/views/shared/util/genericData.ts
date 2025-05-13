export interface genericT {
    name: string;
    code: number;
}

export const EstadosOTs = [
    {name: 'Activo', code: 0},
    {name: 'Finalizado', code: 1},
    {name: 'Finalizado sin Exito', code: 2},
    {name: 'Anulado', code: 3},
    {name: 'Pendiente', code: 4}
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
    {name: 'Pendiente', code: 1}, //(Preparada para iniciar la tarea)
    {name: 'Progreso', code: 2}, //(La tarea esta en progreso)
    {name: 'Cancelado', code: 3}, //(La tarea se ha cancelado)
    {name: 'Finalizado', code: 4}, //Finalizado (La tarea se ha finalizado con exito)
    {name: 'Finalizado sin exito', code: 5}, //(La tarea se ha finalizado sin exito)
    {name: 'Espera', code: 6}, //(Espera (repuesto))
    {name: 'Espera', code: 7}, //(Espera (Mecanicos/equipo))
    {name: 'Espera', code: 8}, //(Espera (aprob. Cliente)(Posible tabla config)(icon, color, tipo)
]