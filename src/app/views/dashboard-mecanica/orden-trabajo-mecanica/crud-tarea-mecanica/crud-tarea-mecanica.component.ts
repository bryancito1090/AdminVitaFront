import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EstadoTarea } from '../../../shared/util/genericData';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ItemService } from '../../../services/item.service';
import { MecanicoService } from '../../../services/mecanico.service';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthMecanicaComponent } from '../../../auth/components/auth-mecanica/auth-mecanica.component';
import { ToastrService } from 'ngx-toastr';
import { MagnitudService } from '../../../services/magnitud.service';

@Component({
  selector: 'app-crud-tarea-mecanica',
  imports: [
    CommonModule,
    FormsModule,
    RadioButtonModule,
    InputTextModule,
    FloatLabelModule,
    InputNumberModule,
    SelectModule,
    DividerModule,
    ButtonModule,
    Dialog,
    TableModule,
  ],
  providers: [ItemService, DialogService],
  templateUrl: './crud-tarea-mecanica.component.html',
  styleUrl: './crud-tarea-mecanica.component.scss'
})
export class CrudTareaMecanicaComponent implements OnInit{
  
  @Input() codigoOT: any;
  @Input() action: 'agregar' | 'editar' | 'eliminar' = 'agregar';
  @Input() color: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  //dialog repuestos
  displayAddDialogRepuestos: boolean = false;
  displayEditDialogRepuestos: boolean = false;
  allItemsRepuestos: any[] = [];

  selectedItemId: any | null = null;
  cantidadSeleccionada: number | null = null;
  editingRepuesto: { idItem: number; cantidad: number } = { idItem: 0, cantidad: 0 };

  //dialog mecanicos
  allMecanicos: any[] = [];

  displayDialogMecanicos: boolean = false;
  selectedMecanicoId: number | null = null;
  duracionEstimada: number | null = null;

  displayEditMecanico: boolean = false;
  editingMecanico: { idMecanico: number; duracion: number } = { idMecanico: 0, duracion: 0 };

  //header dialog
  header_dialog: string = '';
  
  //formulario
  tipo_tarea: 'interna' | 'externa' = 'interna';
  tipo_mantenimiento: 'preventivo' | 'correctivo' = 'preventivo';
  //formulario interna
  detalleTarea: string = '';
  duracion_tarea: number = 0;
  estado_tarea: any = EstadoTarea[0].code;
  requ_auth: boolean = true;
  requ_repuestos: boolean = true;
  list_repuestos: { idItem: number; cantidad: number }[] = [];
  list_mecanicos: { idMecanico: number; duracion: number }[] = [];

  estados_tarea!: any [];
  
  //Dialgo Dinamic
  dialogRef: DynamicDialogRef | undefined;
  tipoItemSeleccionado: 'repuesto' | 'insumo' = 'repuesto';
  allItemsInsumos: any[] = [];
  allItemsActual: any[] = []; 
  loadingItems: boolean = false;
  // Variables para magnitudes
  magnitudesCompatibles: any[] = [];
  magnitudOrigen: any = null;
  selectedMagnitudId: number | null = null;
  loadingMagnitudes: boolean = false;
  mostrarMagnitudes: boolean = false;
  constructor(
    private itemService: ItemService,
    private mecanicoService: MecanicoService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private magnitudService: MagnitudService
  ) {}

  ngOnInit(): void {
    this.initData();
  }

initData(){
  this.estados_tarea = EstadoTarea;
  
  // Cargar repuestos por defecto
  this.itemService.getItemsTipoRespuestoMec().subscribe({
    next: (items : any) => {
      this.allItemsRepuestos = items;
      this.allItemsActual = items; // Por defecto mostrar repuestos
    }
  });
  
  // Cargar insumos también
  this.itemService.getItemsTipoInsumoMec().subscribe({
    next: (items : any) => {
      this.allItemsInsumos = items;
    }
  });
  
  this.mecanicoService.getMecanicos().subscribe({
    next: (mecanicos: any) => {
      this.allMecanicos = mecanicos;
    },
    error: (error) => {
      console.error('Error al cargar mecánicos:', error);
    }
  })
  this.headerDialog();
}
onTipoItemChange() {
  this.loadingItems = true;
  this.selectedItemId = null; 
  this.mostrarMagnitudes = false;
  this.magnitudesCompatibles = [];
  this.selectedMagnitudId = null;
  
  if (this.tipoItemSeleccionado === 'repuesto') {
    this.allItemsActual = this.allItemsRepuestos;
    this.loadingItems = false;
  } else {
    this.allItemsActual = this.allItemsInsumos;
    this.loadingItems = false;
  }
}
onItemSelectionChange(itemId: number) {
  this.selectedItemId = itemId;
  
  if (this.tipoItemSeleccionado === 'insumo' && itemId) {
    this.loadingMagnitudes = true;
    this.mostrarMagnitudes = true;
    
    this.magnitudService.GetMagnitudCompatibleByItem(itemId).subscribe({
      next: (response: any) => {
        this.magnitudOrigen = response.magnitudOrigen;
        this.magnitudesCompatibles = response.magnitudesCompatibles;
        
        const todasLasMagnitudes = [
          response.magnitudOrigen,
          ...response.magnitudesCompatibles
        ];
        this.magnitudesCompatibles = todasLasMagnitudes;
        
        this.selectedMagnitudId = response.magnitudOrigen.idMagnitud;
        
        this.loadingMagnitudes = false;
      },
      error: (error) => {
        console.error('Error al cargar magnitudes:', error);
        this.loadingMagnitudes = false;
        this.mostrarMagnitudes = false;
      }
    });
  } else {
    this.mostrarMagnitudes = false;
    this.magnitudesCompatibles = [];
    this.selectedMagnitudId = null;
  }
}
  agregarTarea() {
    // Validaciones mínimas
    if (!this.detalleTarea || this.duracion_tarea <= 0) {
      console.warn('Los campos Detalle de Tarea y Duración son obligatorios.');
      return;
    }

    this.dialogRef = this.dialogService.open(AuthMecanicaComponent, {
      header: 'Código de Autenticación',
      width: '400px',
      modal: true,
      dismissableMask: false, 
      closable: false,
      data: {
        accion: 'Agregar Tarea'
      }
    });


    this.dialogRef.onClose.subscribe((result: { acceso: boolean, id: number | null }) => {
      if (result.acceso) {
        this.toastr.success('Tarea creada correctamente', 'Éxito');

        const nuevaTarea = {
          codigoOrdenTrabajo: this.codigoOT,
          detalle: this.detalleTarea.trim(),
          idUsuario: result.id,
          estado: this.estado_tarea,
          esManual: true,
          requiereRepuesto: this.requ_repuestos,
          requiereServicioExterno: this.tipo_tarea === 'externa' ? true : false,
          requiereAutorizacion: this.requ_auth,
          tipoMantenimiento: this.tipo_mantenimiento === 'preventivo' ? true : false,
          duracion: this.duracion_tarea,
          repuestos: this.list_repuestos,
          mecanicos: this.list_mecanicos,
        };

        console.log('Tarea creada:', nuevaTarea); 
          
      } else {
        this.toastr.error('Código incorrecto', 'Error');
      }
    });
  }

  showDialogRepuestos() {
    this.displayAddDialogRepuestos = true;
  }

  showDialogMecanicos() {
    this.displayDialogMecanicos = true;
  }

agregarRepuesto() {
  if (!this.selectedItemId || !this.cantidadSeleccionada || this.cantidadSeleccionada <= 0) {
    this.toastr.error('Selecciona un ítem y una cantidad válida.', 'Error');
    return;
  }

  const item = this.allItemsActual.find(i => i.idItem === this.selectedItemId);
  if (!item) {
    this.toastr.error('El ítem seleccionado no es válido.', 'Error');
    return;
  }

  if (this.cantidadSeleccionada > item.stock) {
    this.toastr.error(`La cantidad excede el stock disponible: ${item.stock}`, 'Stock insuficiente');
    return;
  }

  const yaExiste = this.list_repuestos.some(r => r.idItem === this.selectedItemId);
  if (yaExiste) {
    this.toastr.warning('Este ítem ya fue agregado.', 'Ítem duplicado');
    return;
  }

  if (this.tipoItemSeleccionado === 'insumo' && this.mostrarMagnitudes && this.selectedMagnitudId) {
    this.procesarConversionYAgregar();
  } else {
    this.agregarItemALista(this.cantidadSeleccionada);
  }
}

procesarConversionYAgregar() {
  if (this.selectedMagnitudId === this.magnitudOrigen.idMagnitud) {
    this.agregarItemALista(this.cantidadSeleccionada!);
    return;
  }

  this.magnitudService.convertirUnidad(
    this.magnitudOrigen.idMagnitud,
    this.cantidadSeleccionada!,
    this.selectedMagnitudId!
  ).subscribe({
    next: (response: any) => {
      console.log('Conversión realizada:', response);
      this.agregarItemALista(response.unidadDestino);
    },
    error: (error) => {
      console.error('Error en la conversión:', error);
      alert('Error al convertir la unidad. Se usará la cantidad original.');
      this.agregarItemALista(this.cantidadSeleccionada!);
    }
  });
}

agregarItemALista(cantidadFinal: number) {
  this.list_repuestos.push({
    idItem: this.selectedItemId!,
    cantidad: cantidadFinal
  });
  console.log(`Ítem agregado - ID: ${this.selectedItemId}, Cantidad final: ${cantidadFinal}`);
  this.limpiarFormulario();
}

limpiarFormulario() {
  this.selectedItemId = null;
  this.cantidadSeleccionada = null;
  this.selectedMagnitudId = null;
  this.mostrarMagnitudes = false;
  this.magnitudesCompatibles = [];
  this.magnitudOrigen = null;
  this.displayAddDialogRepuestos = false;
}
limpiarFormularioAlCerrar() {
  this.selectedItemId = null;
  this.cantidadSeleccionada = null;
  this.selectedMagnitudId = null;
  this.mostrarMagnitudes = false;
  this.magnitudesCompatibles = [];
  this.magnitudOrigen = null;
  this.tipoItemSeleccionado = 'repuesto'; 
  this.allItemsActual = this.allItemsRepuestos; 
  this.loadingItems = false;
  this.loadingMagnitudes = false;
}

 getItem(id: number): any {
  return this.allItemsActual.find(i => i.idItem === id) || 
         this.allItemsRepuestos.find(i => i.idItem === id) ||
         this.allItemsInsumos.find(i => i.idItem === id);
}

  abrirEditar(repuesto: { idItem: number; cantidad: number }) {
    this.editingRepuesto = { ...repuesto }; // copia temporal
    this.displayEditDialogRepuestos = true;
  }

  guardarCantidad() {
    const index = this.list_repuestos.findIndex(r => r.idItem === this.editingRepuesto.idItem);
    if (index !== -1) {
      this.list_repuestos[index].cantidad = this.editingRepuesto.cantidad;
    }
    this.displayEditDialogRepuestos = false;
  }

  eliminarRepuesto(idItem: number) {
    this.list_repuestos = this.list_repuestos.filter(r => r.idItem !== idItem);
  }

  getMecanico(id: number): any {
    return this.allMecanicos.find(m => m.idMecanico === id);
  }

  agregarMecanico() {
    if (!this.selectedMecanicoId || !this.duracionEstimada || this.duracionEstimada <= 0) {
      alert('Selecciona un mecánico y una duración válida.');
      return;
    }

    const yaExiste = this.list_mecanicos.some(m => m.idMecanico === this.selectedMecanicoId);
    if (yaExiste) {
      alert('Este mecánico ya está asignado.');
      return;
    }

    this.list_mecanicos.push({
      idMecanico: this.selectedMecanicoId,
      duracion: this.duracionEstimada
    });

    this.selectedMecanicoId = null;
    this.duracionEstimada = null;
    this.displayDialogMecanicos = false;
  }

  abrirEditarMecanico(mec: { idMecanico: number; duracion: number }) {
    this.editingMecanico = { ...mec };
    this.displayEditMecanico = true;
  }

  guardarDuracionMecanico() {
    const index = this.list_mecanicos.findIndex(m => m.idMecanico === this.editingMecanico.idMecanico);
    if (index !== -1) {
      this.list_mecanicos[index].duracion = this.editingMecanico.duracion;
    }
    this.displayEditMecanico = false;
  }

  eliminarMecanico(idMecanico: number) {
    this.list_mecanicos = this.list_mecanicos.filter(m => m.idMecanico !== idMecanico);
  }

  headerDialog(){
    switch(this.action){
      case 'agregar':
        this.header_dialog = 'Agregar Tarea';
        break;
      case 'editar':
        this.header_dialog = 'Editar Tarea';
        break;
      case 'eliminar':
        this.header_dialog = 'Eliminar Tarea';
        break;
    }
  }
}