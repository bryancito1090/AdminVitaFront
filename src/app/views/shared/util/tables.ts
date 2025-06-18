export interface Column {
    field?: string;
    header?: string;
    sort?: boolean;
    type?: string;
}
export const HeadersTables = {
  OrdenesTrabajoList: [
    { field: 'codigo', header: 'Código', sort: false, type: '' },
    { field: 'nombreCli', header: 'Cliente', sort: true, type: 'text'},
    { field: 'detalle', header: 'Detalle OT', sort: true, type: 'text'},
    { field: 'fechaProgramada', header: 'Fecha Programada', sort: true, type: 'date' },
    { field: 'estado', header: 'Estado', sort: false, type: '' },
    { field: 'nombreSup', header: 'Supervisor', sort: true, type: 'text'},
    { field: 'placa', header: 'Placa', sort: false, type: 'text'},
    { field: 'prioridad', header: 'Prioridad', sort: false, type: '' },
    { field: 'actions', header: 'Acciones', sort: false, type: '' }
  ],
  VehiculosList: [
    { field: 'placa', header: 'Placa', sort: false, type: '' },
    { field: 'tipoVehiculo', header: 'Tipo Vehiculo', sort: true, type: 'text' },
    { field: 'estado', header: 'Estado', sort: false, type: '' },
    { field: 'licencia', header: 'Licencia', sort: true, type: 'text' },
    { field: 'numeroVehiculo', header: 'Numero Vehiculo', sort: true, type: 'numeric'},
    { field: 'marca', header: 'Marca', sort: true, type: 'text' },
    { field: 'anio', header: 'Año', sort: true, type: 'text' },
    { field: 'ultimoAnioRTV', header: 'RTV', sort: true, type: 'text' },
    { field: 'ultimoAnioMatriculacion', header: 'Matriculado', sort: true, type: 'text' },
    { field: 'actions', header: 'Acciones', sort: false, type: '' }
  ],
  TareasList: [
    {field: 'codigo', header: 'Código'},
    {field: 'detalle', header: 'Detalle'},
    {field: 'estado', header: 'Estado'},
    {field: 'mecanicos', header: 'Mecánicos'},
    {field: 'duracion', header: 'Duración (Unidades de Tiempo)'},
    {field: 'requiereServicioExterno', header: 'Servicio Externo'},
    {field: 'requiereRepuesto', header: 'Requiere Repuesto/s'},
    {field: 'observaciones', header: 'Observaciones'}
  ],
  RepuestoseInsumosList: [
    {field: 'codigoItem', header:'Código Item'},
    {field: 'nombre', header:'Nombre Item'},
    {field: 'detalle', header:'Detalle Item'},
    {field: 'codigoTarea', header: 'Código Tarea'},
    {field: 'solicitante', header: 'Solicitante'},
    {field: 'cantidad', header: 'Cantidad'},
    {field: 'magnitud', header: 'Magnitud'},
    {field: 'precio', header: 'Precio'}
  ],
  ManoDeObraList: [
    {field: 'codigo', header:'Código Persona'},
    {field: 'nombreCompleto', header:'Nombre Completo'},
    {field: 'esSupervisor', header:'Supervisor'},
    {field: 'codigoTarea', header:'Código Tarea'},
    {field: 'especialidad', header:'Especialidad Mecanico'},
    {field: 'duracion', header:'Duración'},
  ],
  TrabajoExternoList: [
    {field: 'codigo', header: 'Código Tarea'},
    {field: 'solicitante', header: 'Solicitande'},
    {field: 'detalle', header: 'Detalle'},
    {field: 'requiereServicioExterno', header: 'Servicio Externo'},
    {field: 'requiereAutorizacion', header: 'Requiere Autorización'},
  ],
  ObservacionesTareaList: [
    {field: 'codigoTarea', header: 'Código Tarea'},
    {field: 'responsable', header: 'Responsable'},
    {field: 'idAdjunto', header: 'Adjunto'},
    {field: 'detalle', header: 'Detalle'},
    {field: 'fechaRegistro', header: 'Fecha de Registro'},
  ],
 // En tu archivo HeadersTables, actualiza SolicitudTareaList para incluir acciones
SolicitudTareaList: [
  { field: 'codigo', header: 'Código', sort: false, type: 'text' },
  { field: 'codigoTarea', header: 'Código Tarea', sort: false, type: 'text' },
  { field: 'detalle', header: 'Detalle', sort: false, type: 'text' },
  { field: 'solicitante', header: 'Solicitante', sort: false, type: 'text' },
  { field: 'fechaRegistro', header: 'Fecha Registro', sort: false, type: 'date' },
  { field: 'fechaAprobacion', header: 'Fecha Aprobación', sort: false, type: 'date' },
  { field: 'aprobado', header: 'Estado', sort: false, type: 'text' },
  { field: 'idAdjunto', header: 'Evidencia', sort: false, type: 'text' },
  { field: 'actions', header: 'Acciones', sort: false, type: 'text' }
],
  AdquisicionesList: [
    { field: 'numeroFactura', header: '# Factura' },
    { field: 'fechaRegistro', header: 'Fecha de Registro' },
    { field: 'documento', header: 'Documento Proveedor'},
    { field: 'nombres', header: 'Proveedor' },
    { field: 'subtotal', header: 'Subtotal' },
    { field: 'iva', header: 'IVA' },
    { field: 'total', header: 'Total' },
    { field: 'actions', header: 'Acciones', }
  ],
  DetalleFacturaList: [
    { field: 'codigo', header: 'Código'},
    { field: 'description', header: 'Descripción'},
    { field: 'magnitud', header: 'Magnitud'},
    { field: 'cantidad', header: 'Cantidad'},
    { field: 'valorUnitario', header: 'Valor'},
    { field: 'subtotal', header: 'Importe'},
    { field: 'actions', header: 'Acciones'}
  ],
  InventarioList: [
    { field: 'codigo', header: 'Código'},
    { field: 'nombre', header: 'Nombre'},
    { field: 'descripcion', header: 'Descripción'},
    { field: 'stock', header: 'Stock'},
    { field: 'stockMin', header: 'Stock Min'},
    { field: 'stockIdeal', header: 'Stock Ideal'},
    { field: 'magnitud', header: 'Magnitud'},
    { field: 'valorUnitario', header: 'Valor'},
    { field: 'actions', header: 'Acciones'}
  ],
  PropietariosList: [
    { field: 'nombreCompleto', header: 'Nombre/Nombre Empresa'},
    { field: 'documento', header: 'Cédula/RUC'},
    { field: 'fechaInicio', header: 'Fecha de Inicio'},
    { field: 'fechaFin', header: 'Fecha de Fin'},
    { field: 'estadoPropiedad', header: 'Estado'}
  ],
  MovimientosItemList: [
    { field: 'codigo', header: 'Código'},
    { field: 'nombre', header: 'Descripción'},
    { field: 'fechaMovimiento', header: 'Fecha'},
    { field: 'movimiento', header: 'Tipo'},
    { field: 'cantidad', header: 'Cantidad'},
    { field: 'stock', header: 'Stock'},
    { field: 'nombreMagnitud', header: 'Magnitud'}
  ]
}
export const HeadersTablesPersons = {
  PersonasList: [
    { field: 'codigo', header: 'Código'},
    { field: 'nombre', header: 'Nombre Completo'},
    { field: 'razonSocial', header: 'Razón Social'},
    { field: 'tipoPersona', header: 'Persona'},
    { field: 'documento', header: 'Documento'},
    { field: 'email', header: 'Email'},
    { field: 'celular', header: 'Celular'},
    { field: 'telefono', header: 'Teléfono'},
    { field: 'direccion', header: 'Dirección'},
    { field: 'actions', header: 'Acciones'}
  ],
}
export const HeadersTablesMecanico = {
  Tareas: [
    { field: 'detalle', header: 'Detalle', sort: true},
    { field: 'duracion', header: 'Duración', sort: true},
    { field: 'estado', header: 'Estado',},
    { field: 'mecanicos', header: 'Mecanicos', sort: true},
    { field: 'requiereServicioExterno', header: 'Trabajo Externo'},
    { field: 'requiereRepuesto', header: 'Requiere Repuesto'},
    { field: 'observaciones', header: 'Observaciones',sort: true},
    { field: 'actions', header: 'Acciones'}
  ],
}