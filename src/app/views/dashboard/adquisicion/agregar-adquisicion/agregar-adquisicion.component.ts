import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ValidacionService } from '../../../services/validacion.service';
import { ToastrService } from 'ngx-toastr';
import { DatePickerModule } from 'primeng/datepicker';
import { ItemService } from '../../../services/item.service';
import { Item } from '../../../../../domain/response/Item.model';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { HeadersTables } from '../../../shared/util/tables';
import { DetalleCompraResponse } from '../../../../../domain/response/Adquisicion.model';
import { TableModule } from 'primeng/table';
import { NgFor, NgIf } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { MagnitudService } from '../../../services/magnitud.service';
import { ComprasService } from '../../../services/compras.service';
import { SolicitudCrearCompra } from '../../../../../domain/response/Compra.model';
import { DetalleCompraService } from '../../../services/detalleCompra.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SkeletonCompletePageComponent } from "../../../shared/components/skeleton/skeleton-complete-page.component";
import { DropdownModule } from 'primeng/dropdown';
import { ImpuestoService } from '../../../services/impuesto.service';
import { catchError, forkJoin, map } from 'rxjs';
import { ArchivosService } from '../../../services/archivos.service';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { AdjuntoService } from '../../../services/adjunto.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-agregar-adquisicion',
  imports: [
    CommonModule,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    DatePickerModule,
    SelectModule,
    FloatLabelModule,
    InputNumberModule,
    TableModule,
    DividerModule,
    DropdownModule,
    ImageModule,DialogModule,
    ConfirmDialogModule,
],
providers: [
  ConfirmationService
],
  standalone: true,
  templateUrl: './agregar-adquisicion.component.html',
  styleUrl: './agregar-adquisicion.component.scss'
})
export class AgregarAdquisicionComponent implements OnInit {

  public isEditMode: boolean = false;

  @ViewChild('fu') fileUpload!: FileUpload;
  magnitudOrigenItem: any = null;
  magnitudes!: any[];
  items: Item[] = [];
  selectedItem!: Item;

  detalleCols: any;
  detallesCompra: any[] = [];
  detallesCompraPeticion: any[] = [];

  fb_adquisicion!: FormGroup;
  fb_detalleAdquisicion!: FormGroup;

  uploadedFile: File | null = null;
  uploadedFiles: any[] = []; 
  existingFileInfo: any = null;
  existingFileUrl: string | null = null;
  archivoUrl: SafeResourceUrl | null = null;
  tipoArchivo: string = '';
  displayImage: boolean = false; 
  resumen = {
    nombre: '',
    razonSocial: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
  }
  subtotal: number = 0.00;
  iva: number = 0.00;
  descuento: number = 0.00;
  total: number = 0.00;
  impuestoTotal: number = 0;

  iconValidarDocumento: string = 'pi pi-search';

  loadingEdit: boolean = false;

  loadingMagnitudes: boolean = false;
  impuestos: any[] = [];
  impuestoSeleccionado: any;
  constructor(
    private validacionService: ValidacionService,
    private toastr: ToastrService,
    private itemService: ItemService,
    private magnitudService: MagnitudService,
    private compraService: ComprasService,
    private detalleCompraService : DetalleCompraService,
    private router: Router,
    private route: ActivatedRoute,
    private impuestoService: ImpuestoService,
    private archivosService: ArchivosService,
    private sanitizer: DomSanitizer,
    private adjuntoService: AdjuntoService,
    private confirmationService: ConfirmationService,
  ) { }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('factura');
    this.isEditMode = !!id;
    if(id){
      this.loadingEdit = true;
this.compraService.getCompraDetallada(id).subscribe({
  next: (response) => {
    console.log('Compra detallada:', response);
    this.fb_adquisicion.patchValue({
      codigo: response.numeroFactura,
      doc_proveedor: response.documento,
      id_proveedor: response.idProveedor || null
    });
    this.validarDocumentoProveedor();
    if (response.adjunto) {
      this.existingFileInfo = response.adjunto;
      this.obtenerYMostrarArchivo(response.adjunto.ruta);
    }
    // Transform the details to match the expected format and include idImpuesto
    this.detallesCompra = response.detallesCompra.map((detalle: any) => {
      return {
        idDetalleCompra: detalle.idDetalleCompra,
        codigo: detalle.codigo,
        description: detalle.nombre + ' - ' + detalle.descripcion,
        magnitud: detalle.magnitud || 'N/A',
        cantidad: detalle.cantidad,
        cantidadConvertida: '',
        cantidadBase: detalle.cantidad,
        valorUnitario: detalle.valorUnitario,
        subtotal: detalle.subtotal || (detalle.cantidad * detalle.valorUnitario),
        idImpuesto: detalle.idImpuesto // Importante: incluir el idImpuesto
      };
    });
    
    // También actualizar el array detallesCompraPeticion
    this.detallesCompraPeticion = response.detallesCompra.map((detalle: any) => ({
      idDetalleCompra: detalle.idDetalleCompra,
      idCompra: response.idCompra,
      idItem: detalle.idItem,
      idMagnitud: detalle.idMagnitud,
      cantidad: detalle.cantidad,
      cantidadBase: detalle.cantidad,
      valorUnitario: detalle.valorUnitario,
      idImpuesto: detalle.idImpuesto
    }));
    
    // Calcular la suma inicial para mostrar mientras se cargan los impuestos
    this.subtotal = this.detallesCompra.reduce((acc, item) => acc + item.subtotal, 0);
    
    // Calcular los impuestos específicos para cada detalle
    this.calcularImpuestosPorDetalle(this.detallesCompra);
    
    this.loadingEdit = false;
    this.fb_adquisicion.get('codigo')?.disable();
    this.fb_adquisicion.get('doc_proveedor')?.disable();
  }
  ,
  error: (err) => {
    console.error(err);
    this.toastr.error(err.error.mensaje, 'Error al cargar la compra');
    this.router.navigate(['notFound404']);
    }
  })
}
    this.cargarImpuestos();
    this.detalleCols = HeadersTables.DetalleFacturaList; 
    this.getData();
    this.initFormGroups();
    this.detalleCompraHandler();
  }
  cargarImpuestos() {
    this.impuestoService.getImpuestos().subscribe({
      next: (data) => {
        this.impuestos = data;
        // Establecer el IVA 15% como predeterminado (idImpuesto: 4)
        const impuestoPredeterminado = this.impuestos.find(imp => imp.idImpuesto === 4);
        if (impuestoPredeterminado) {
          this.impuestoSeleccionado = impuestoPredeterminado;
          this.iva = impuestoPredeterminado.porcentaje / 100; // Convertir porcentaje a decimal
          this.detalleCompraHandler(); // Recalcular totales
        }
      },
      error: (err) => {
        console.error('Error al cargar impuestos:', err);
        this.toastr.error('No se pudieron cargar los impuestos', 'Error');
      }
    });
  }
  initFormGroups(){
    this.fb_adquisicion = new FormGroup({
      codigo: new FormControl<string | null>(null, [Validators.required, Validators.minLength(6)]),
      doc_proveedor: new FormControl<string | null>(null, [Validators.required, Validators.minLength(10), Validators.maxLength(16)]),
      id_proveedor: new FormControl<number | null>(null, [Validators.required]),
      id_impuesto: new FormControl<number | null>(4), 
    })
    this.fb_detalleAdquisicion = new FormGroup({
      codigo: new FormControl<string | null>(null, [Validators.required]),
      nombre: new FormControl<string | null>({value: null, disabled: true}, [Validators.required]),
      detalle: new FormControl<string | null>(null),
      cantidad: new FormControl<number | null>(null, [Validators.required]),
      valorUnitario: new FormControl<string | null>({value: null, disabled: false}),
      id_magnitud: new FormControl<number | null>(null),
      id_impuesto: new FormControl<number | null>(4) // Añadir aquí en lugar de en fb_adquisicion
    });
    this.fb_adquisicion.get('doc_proveedor')?.valueChanges.subscribe(() => {
      this.fb_adquisicion.patchValue({id_proveedor: null});;
      this.iconValidarDocumento = 'pi pi-search';
    });
  }
  getData(){
    this.itemService.getItemsList().subscribe({
      next: (response) => {
        this.items = response;
      },
      error: (err) => {
        console.error(err);
      }
    })
    this.magnitudService.getMagnitudes().subscribe({
      next: (response) => {
        this.magnitudes = response;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  
  onUpload(event: any) {
    try {
      if (event.originalEvent) {
        event.originalEvent.preventDefault();
      }
      this.toastr.success('Archivo preparado para ser enviado', 'Éxito');
      console.log('Archivo listo para subir:', this.uploadedFile);
    } catch (error) {
      console.error('Error en onUpload:', error);
      this.toastr.error('Error al procesar el archivo', 'Error');
    }
  }
  obtenerYMostrarArchivo(ruta: string) {
    if (!ruta) return;
    const fileName = ruta.split('/').pop() || '';
    this.existingFileUrl = ruta; // Guardar la ruta para posible descarga
    this.archivosService.getArchivo(fileName).subscribe({
      next: (blob: Blob) => {
        const file = new File(
          [blob], 
          this.existingFileInfo.nombre, 
          { type: blob.type }
        );
        this.uploadedFile = file;
        this.uploadedFiles = [{
          name: this.existingFileInfo.nombre,
          size: blob.size,
          type: blob.type || this.getTipoMIME(this.existingFileInfo.tipoArchivo)
        }];
        if (file.type.startsWith('image/')) {
          this.existingFileUrl = URL.createObjectURL(blob);
        }
        console.log('Archivo cargado correctamente:', file.name);
      },
      error: (error: any) => {
        console.error('Error al cargar el archivo:', error);
        this.toastr.error('No se pudo cargar el archivo adjunto', 'Error');
      }
    });
  }
  getTipoMIME(tipoArchivo: string): string {
    switch(tipoArchivo.toLowerCase()) {
      case 'pdf': return 'application/pdf';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      default: return 'application/octet-stream';
    }
  }
  validarDocumentoProveedor() {
    this.iconValidarDocumento = ''
    const numDocumento = this.fb_adquisicion.get('doc_proveedor')?.value;
    this.validacionService.validarProveedorXDoc(numDocumento).subscribe({
      next: (response) => {
        if('idPersona' in response){
          this.fb_adquisicion.patchValue({id_proveedor: response.idPersona});
          this.resumen = {
            nombre: `${response.nombre}${response.apellidos!='' ? ' '+response.apellidos : ''}`,
            razonSocial: response.razonSocial,
            email: response.email,
            telefono: response.telefono,
            celular: response.celular,
            direccion: response.direccion,
          };
          this.iconValidarDocumento = 'pi pi-check';
        }
        else{
          this.toastr.warning(response.mensaje, "No se pudo validar!");
          this.fb_adquisicion.get('doc_proveedor')?.setValue('');
          this.fb_adquisicion.patchValue({id_proveedor: null});;
          this.iconValidarDocumento = 'pi pi-search';
        }
      },
      error: (err) => {
        this.fb_adquisicion.get('doc_proveedor')?.setValue('');
        this.iconValidarDocumento = 'pi pi-search';
        this.toastr.warning(err.error.mensaje, "Persona no encontrada!");
      }
    })
  }

  addDetalleCompra() {
    if (this.fb_detalleAdquisicion.invalid) {
      this.toastr.error('Todos los campos son obligatorios!', 'Error');
      return;
    }
    
    if (this.fb_detalleAdquisicion.get('codigo')?.value) {
      const item = this.detallesCompra.find(item => item.codigo === this.fb_detalleAdquisicion.get('codigo')?.value);
      if (item) {
        this.toastr.error('El item ya ha sido agregado!', 'Error');
        return;
      }
    }
    const idMagnitudSeleccionada = this.fb_detalleAdquisicion.get('id_magnitud')?.value || null;
    const cantidadIngresada = this.fb_detalleAdquisicion.get('cantidad')?.value;
    if (this.magnitudOrigenItem && idMagnitudSeleccionada && idMagnitudSeleccionada !== this.magnitudOrigenItem.idMagnitud) {
      this.toastr.info('Realizando conversión de unidades...', 'Procesando');
      this.magnitudService.convertirUnidad(
        idMagnitudSeleccionada, 
        cantidadIngresada, 
        this.magnitudOrigenItem.idMagnitud
      ).subscribe({
        next: (respuesta) => {
          console.log('Resultado de conversión:', respuesta);
          this.crearDetalleCompra(respuesta.unidadDestino, idMagnitudSeleccionada);
        },
        error: (error) => {
          console.error('Error en la conversión de unidades:', error);
          this.toastr.error('No se pudo realizar la conversión de unidades', 'Error');
        }
      });
    } else {
      this.crearDetalleCompra(cantidadIngresada, idMagnitudSeleccionada);
    }
  }
  crearDetalleCompra(cantidadFinal: number, idMagnitudSeleccionada: number | null) {
    const cantidadOriginal = this.fb_detalleAdquisicion.get('cantidad')?.value;
    const valorUnitario = this.fb_detalleAdquisicion.get('valorUnitario')?.value || this.selectedItem.valorUnitario;
    let idCompraActual = 0;
    if (this.isEditMode) {
      if (this.detallesCompraPeticion && this.detallesCompraPeticion.length > 0) {
        idCompraActual = this.detallesCompraPeticion[0].idCompra;
      } 
      else {
        const idFromUrl = this.route.snapshot.paramMap.get('factura');
        if (idFromUrl) {
          idCompraActual = parseInt(idFromUrl);
        }
      }
    }
    if (!this.impuestoSeleccionado && this.impuestos.length > 0) {
      this.impuestoSeleccionado = this.impuestos.find(imp => imp.idImpuesto === 4) || this.impuestos[0];
    }
    const detalleCompraPeticion = {
      idDetalleCompra: null,
      idCompra: idCompraActual,  
      idItem: this.selectedItem.idItem,
      idMagnitud: idMagnitudSeleccionada, 
      cantidad: cantidadFinal, 
      cantidadBase: cantidadOriginal,
      valorUnitario: valorUnitario,
      idImpuesto: this.impuestoSeleccionado?.idImpuesto || 4  
    };
    console.log("detalle Im", detalleCompraPeticion)
    const detalleCompra = {
      codigo: this.selectedItem.codigo,
      description: this.selectedItem.nombre + ' - ' + this.selectedItem.descripcion,
      magnitud: idMagnitudSeleccionada ? 
        this.magnitudes.find(magnitud => magnitud.idMagnitud === idMagnitudSeleccionada)?.nombre : 
        'N/A',
      cantidad: cantidadOriginal, 
      cantidadConvertida: cantidadFinal !== cantidadOriginal ? 
        `(${cantidadFinal} ${this.magnitudOrigenItem?.unidad})` : '',
      cantidadBase: cantidadOriginal,
      valorUnitario: valorUnitario,
      subtotal: cantidadOriginal * valorUnitario,
      idImpuesto: this.impuestoSeleccionado?.idImpuesto || 4  
    };
    
    this.detallesCompraPeticion.push(detalleCompraPeticion);
    this.detallesCompra.push(detalleCompra);
    this.detalleCompraHandler();  
    this.fb_detalleAdquisicion.reset();
    this.toastr.success('Detalle agregado correctamente!', 'Éxito');
  }
  deleteDetalleCompra(detalle: any) {
    if (detalle.idDetalleCompra) {
      this.toastr.info('Eliminando detalle de compra...', 'Procesando');
      this.detalleCompraService.eliminarDetalleCompra(detalle.idDetalleCompra).subscribe({
        next: (response) => {
          const index = this.detallesCompra.findIndex(item => item.codigo === detalle.codigo);
          if (index !== -1) {
            this.detallesCompra.splice(index, 1);
            this.detallesCompraPeticion.splice(index, 1);
            this.detalleCompraHandler(); // Recalcular totales
          }
          this.toastr.success('Detalle eliminado correctamente', 'Éxito');
        },
        error: (err) => {
          console.error('Error al eliminar detalle de compra:', err);
          this.toastr.error(err.error?.mensaje || 'Error al eliminar el detalle', 'Error');
        }
      });
    } else {
      const index = this.detallesCompra.findIndex(item => item.codigo === detalle.codigo);
      if (index !== -1) {
        this.detallesCompra.splice(index, 1);
        this.detallesCompraPeticion.splice(index, 1);
        this.detalleCompraHandler();
        this.toastr.success('Detalle eliminado correctamente', 'Éxito');
      }
    }
  }
  onItemChange(selectedCode: any) {
    this.selectedItem = this.items.find(item => item.codigo === selectedCode)!;
    console.log('Item seleccionado:', this.selectedItem);
    if (!this.selectedItem) return;
    
    this.fb_detalleAdquisicion.patchValue({
      codigo: this.selectedItem.codigo,
      nombre: this.selectedItem.nombre,
      valorUnitario: this.selectedItem.valorUnitario,
      id_magnitud: null
    });
    const impuestoPredeterminado = this.impuestos.find(imp => imp.idImpuesto === 4); // IVA 15%
    if (impuestoPredeterminado) {
      this.impuestoSeleccionado = impuestoPredeterminado;
      this.fb_adquisicion.get('id_impuesto')?.setValue(impuestoPredeterminado.idImpuesto);
      this.iva = impuestoPredeterminado.porcentaje / 100;
      this.detalleCompraHandler(); 
    }
    if (this.selectedItem.idItem) {
      this.loadingMagnitudes = true;
      this.magnitudOrigenItem = null; 
      this.magnitudService.GetMagnitudCompatibleByItem(this.selectedItem.idItem).subscribe({
        next: (response) => {
          console.log('Magnitudes disponibles:', response);
          let magnitudesDisponibles: any[] = [];
          if (response && response.magnitudOrigen) {
            this.magnitudOrigenItem = response.magnitudOrigen;
            magnitudesDisponibles.push(response.magnitudOrigen);
            if (response.magnitudesCompatibles && Array.isArray(response.magnitudesCompatibles)) {
              magnitudesDisponibles = magnitudesDisponibles.concat(response.magnitudesCompatibles);
            }
          }
          if (magnitudesDisponibles.length === 0) {
            this.toastr.info('Este ítem no requiere una magnitud', 'Información');
            this.fb_detalleAdquisicion.get('id_magnitud')?.disable();
            this.fb_detalleAdquisicion.patchValue({ id_magnitud: null });
            this.magnitudes = [];
          } else {
            this.fb_detalleAdquisicion.get('id_magnitud')?.enable();
            this.magnitudes = magnitudesDisponibles;
          }
          
          this.loadingMagnitudes = false;
        },
        error: (err) => {
          this.toastr.info('Este ítem no posee una magnitud asociada', 'Información');
          this.fb_detalleAdquisicion.get('id_magnitud')?.disable();
          this.fb_detalleAdquisicion.patchValue({ id_magnitud: null });
          this.magnitudes = [];
          this.loadingMagnitudes = false;
          this.magnitudOrigenItem = null;
        }
      });
    }
  }
  cargarTodasMagnitudes() {
  this.magnitudService.getMagnitudes().subscribe({
    next: (response) => {
      this.magnitudes = response;
    },
    error: (err) => {
      this.toastr.info('Este ítem no posee una magnitud asociada', 'Info');
    }
  });
  }
  isMagnitudDisabled(): boolean {
  const magnitudControl = this.fb_detalleAdquisicion?.get('id_magnitud');
  return magnitudControl ? magnitudControl.disabled : false;
  }
  detalleCompraHandler() {
    this.subtotal = this.detallesCompra.reduce((acc, item) => acc + item.subtotal, 0);
    this.impuestoTotal = this.detallesCompra.reduce((acc, item) => {
      if (item.impuestoCalculado !== undefined) {
        return acc + item.impuestoCalculado;
      }
      if (item.porcentajeImpuesto !== undefined) {
        return acc + (item.subtotal * (item.porcentajeImpuesto / 100));
      }
      return acc;
    }, 0);
    this.iva = this.subtotal > 0 ? this.impuestoTotal / this.subtotal : 0;
    this.total = this.subtotal + this.impuestoTotal - this.descuento;
  }
  onFileSelect(event: any) {
    try {
      if (event.files && event.files.length > 0) {
        this.uploadedFile = event.files[0];
        if (this.isEditMode) {
          if (this.existingFileInfo) {
            this.toastr.info('Esta factura ya tiene un archivo adjunto. Elimínelo primero si desea reemplazarlo', 'Información');
            this.uploadedFile = null;
            if (this.fileUpload) {
              this.fileUpload.clear();
            }
          } else {
            this.toastr.info('Archivo seleccionado. Haga clic en "Adjuntar archivo" para guardarlo', 'Información');
          }
        } else {
          this.toastr.info('Archivo seleccionado. Se adjuntará al crear la compra', 'Información');
        }
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
    }
  }
crearCompra() {
  if (this.fb_adquisicion.invalid) {
    this.toastr.error('Por favor complete todos los campos requeridos', 'Error');
    return;
  }
  
  if (!this.fb_adquisicion.get('id_proveedor')?.value) {
    this.toastr.error('Debe validar el proveedor antes de continuar', 'Error');
    return;
  }
  
  if (this.detallesCompra.length === 0) {
    this.toastr.warning('Debe agregar al menos un detalle a la compra', 'Advertencia');
    return;
  }
  if (this.isEditMode) {
    this.actualizarCompra();
  } 
  else {
    this.crearNuevaCompra();
  }
}
procesarCompra() {
  if (this.isEditMode) {
    console.log('Modo edición detectado, actualizando compra...');
    this.actualizarCompra();
  } else {
    console.log('Modo creación detectado, creando nueva compra...');
    this.crearNuevaCompra();
  }
}
private crearNuevaCompra() {
  const solicitud: SolicitudCrearCompra = {
    idProveedor: this.fb_adquisicion.get('id_proveedor')?.value,
    numeroFactura: this.fb_adquisicion.get('codigo')?.value,
    archivo: this.uploadedFile
  };
  this.toastr.info('Procesando su solicitud...', 'Creando Compra');
  this.compraService.crearCompra(solicitud).subscribe({
    next: (respuestaCompra) => {
      console.log('Compra creada:', respuestaCompra);
      if (respuestaCompra && respuestaCompra.idCompra) {
        const idCompra = respuestaCompra.idCompra;
        this.detallesCompraPeticion.forEach(detalle => {
          detalle.idCompra = idCompra;
        });
        console.log('Detalles de compra a guardar:', this.detallesCompraPeticion);
        this.detalleCompraService.createUpdateDetalleCompra(this.detallesCompraPeticion).subscribe({
          next: (respuestaDetalles) => {
            console.log('Detalles de compra guardados:', respuestaDetalles);
            this.toastr.success('Compra y sus detalles creados exitosamente', 'Éxito');
            this.limpiarFormulario();
          },
          error: (errorDetalles) => {
            console.error('Error al crear los detalles de la compra', errorDetalles);
            this.toastr.error(errorDetalles.error?.mensaje || 'Error al guardar los detalles', 'Error');
          }
        });
      } else {
        this.toastr.warning('La compra se creó pero no se pudo obtener su ID', 'Advertencia');
      }
    },
    error: (errorCompra) => {
      console.error('Error al crear la compra', errorCompra);
      this.toastr.error(errorCompra.error?.mensaje || 'Error al crear la compra', 'Error');
    }
  });
}
private actualizarCompra() {
  console.log('=====================================');
  console.log('INICIANDO ACTUALIZACIÓN DE COMPRA');
  
  let idCompra: number | undefined;
  
  // Primero, verificamos si hay detalles existentes para obtener el idCompra
  if (this.detallesCompraPeticion && this.detallesCompraPeticion.length > 0) {
    const detalleConId = this.detallesCompraPeticion.find(d => d.idCompra);
    idCompra = detalleConId?.idCompra;
  }
  
  if (!idCompra) {
    const idFromUrl = this.route.snapshot.paramMap.get('factura');
    if (!idFromUrl) {
      this.toastr.error('No se pudo identificar la compra actual', 'Error');
      return;
    }
    console.log('Obteniendo idCompra de la URL:', idFromUrl);
    idCompra = parseInt(idFromUrl);
  }
  
  // Asegurar que todos los detalles tengan un idCompra y un idImpuesto válido
  this.detallesCompraPeticion = this.detallesCompraPeticion.map(detalle => {
    if (!detalle.idImpuesto) {
      detalle.idImpuesto = this.impuestoSeleccionado?.idImpuesto || 4;
    }
    detalle.idCompra = idCompra;
    return detalle;
  });
  
  // FILTRAR SOLO NUEVOS DETALLES (idDetalleCompra === null)
  const soloNuevosDetalles = this.detallesCompraPeticion.filter(detalle => detalle.idDetalleCompra === null);
  
  console.log('Solo nuevos detalles a enviar:', soloNuevosDetalles);
  
  if (soloNuevosDetalles.length === 0) {
    this.toastr.info('No hay nuevos detalles para agregar a la compra', 'Información');
    return;
  }
  
  this.toastr.info('Procesando su solicitud...', 'Agregando nuevos detalles');
  
  // Llamar al servicio solo con los nuevos detalles
  this.detalleCompraService.createUpdateDetalleCompra(soloNuevosDetalles).subscribe({
    next: (respuesta) => {
      console.log('Nuevos detalles agregados con éxito:', respuesta);
      this.toastr.success('Nuevos detalles agregados exitosamente', 'Éxito');
      
      // Recargar la compra completa para actualizar la interfaz
      this.compraService.getCompraDetallada(idCompra.toString()).subscribe({
        next: (compraActualizada) => {
          console.log('Compra recargada después de actualizar:', compraActualizada);
          this.actualizarDetallesEnInterfaz(compraActualizada);
        },
        error: (errorRecarga) => {
          console.error('Error al recargar la compra:', errorRecarga);
          this.toastr.error('No se pudieron recargar los detalles actualizados', 'Error');
        }
      });
    },
    error: (error) => {
      console.error('Error al agregar nuevos detalles:', error);
      
      // Intentar obtener más información sobre el error
      let mensajeError = 'Error al agregar nuevos detalles';
      if (error.error && typeof error.error === 'object') {
        console.log('Detalles del error:', JSON.stringify(error.error));
        mensajeError = error.error.mensaje || mensajeError;
      }
      
      this.toastr.error(mensajeError, 'Error');
    }
  });
}
private actualizarDetallesEnInterfaz(compraActualizada: any) {
  this.detallesCompra = compraActualizada.detallesCompra.map((detalle: any) => {
    return {
      idDetalleCompra: detalle.idDetalleCompra,
      codigo: detalle.codigo,
      description: detalle.nombre + ' - ' + detalle.descripcion,
      magnitud: detalle.magnitud || 'N/A',
      cantidad: detalle.cantidad,
      cantidadConvertida: '',
      cantidadBase: detalle.cantidad,
      valorUnitario: detalle.valorUnitario,
      subtotal: detalle.subtotal || (detalle.cantidad * detalle.valorUnitario),
      idImpuesto: detalle.idImpuesto
    };
  });
  
  this.detallesCompraPeticion = compraActualizada.detallesCompra.map((detalle: any) => ({
    idDetalleCompra: detalle.idDetalleCompra,
    idCompra: compraActualizada.idCompra,
    idItem: detalle.idItem,
    idMagnitud: detalle.idMagnitud,
    cantidad: detalle.cantidad,
    cantidadBase: detalle.cantidad,
    valorUnitario: detalle.valorUnitario,
    idImpuesto: detalle.idImpuesto
  }));
  
  this.subtotal = this.detallesCompra.reduce((acc, item) => acc + item.subtotal, 0);
  this.calcularImpuestosPorDetalle(this.detallesCompra);
}  
  limpiarFormulario() {
    this.fb_adquisicion.reset();
    this.fb_detalleAdquisicion.reset();
    this.detallesCompra = [];
    this.detallesCompraPeticion = [];
    this.uploadedFile = null;
    if (this.fileUpload) {
      this.fileUpload.clear(); 
      console.log('FileUpload component cleared');
    } else {
      console.warn('FileUpload component not found');
    }
    this.iconValidarDocumento = 'pi pi-search';
    this.subtotal = 0.00;
    this.total = 0.00;
    this.resumen = {
      nombre: '',
      razonSocial: '',
      email: '',
      telefono: '',
      celular: '',
      direccion: '',
    };
    this.detalleCompraHandler();
  }
  onImpuestoChange(event: any) {
    console.log('Impuesto seleccionado:', event.value);
    if (event.value && event.value.porcentaje !== undefined) {
      this.impuestoSeleccionado = event.value;
      this.iva = this.impuestoSeleccionado.porcentaje / 100;
    } 
    else if (event.value) {
      this.impuestoSeleccionado = this.impuestos.find(imp => imp.idImpuesto === event.value);
      if (this.impuestoSeleccionado) {
        this.iva = this.impuestoSeleccionado.porcentaje / 100;
      }
    }
    if (this.impuestoSeleccionado) {
      this.fb_adquisicion.get('id_impuesto')?.setValue(this.impuestoSeleccionado.idImpuesto);
    }
    this.detalleCompraHandler();
  }
  calcularImpuestosPorDetalle(detalles: any[]) {
    if (!detalles || detalles.length === 0) {
      return;
    }
    detalles.forEach(detalle => {
      if (!detalle.idImpuesto) {
        detalle.idImpuesto = 4; 
      }
    });
    const peticionesImpuestos = detalles.map(detalle => {
      return this.impuestoService.getPorcentajeImpuesto(detalle.idImpuesto).pipe(
        map(respuesta => {
          return {
            detalle,
            porcentaje: respuesta.porcentaje  
          };
        }),
        catchError(error => {
          console.error(`Error al obtener porcentaje para detalle ${detalle.codigo}:`, error);
          return [{ detalle, porcentaje: 15 }]; 
        })
      );
    });
    forkJoin(peticionesImpuestos).subscribe({
      next: (resultados) => {
        this.impuestoTotal = 0; 
        resultados.forEach(resultado => {
          const { detalle, porcentaje } = resultado;
          const porcentajeDecimal = porcentaje / 100;
          detalle.porcentajeImpuesto = porcentaje;
          detalle.impuestoCalculado = detalle.subtotal * porcentajeDecimal;
          this.impuestoTotal += detalle.impuestoCalculado;
        });
        this.iva = this.subtotal > 0 ? this.impuestoTotal / this.subtotal : 0;
        this.total = this.subtotal + this.impuestoTotal - this.descuento;
        console.log('Impuestos calculados por detalle:', resultados);
      },
      error: (err) => {
        console.error('Error al procesar impuestos:', err);
        this.toastr.error('No se pudieron calcular los impuestos correctamente', 'Error');
        this.impuestoTotal = this.subtotal * 0.15; // Asumir 15%
        this.total = this.subtotal + this.impuestoTotal - this.descuento;
      }
    });
  }
  cargarArchivo(fileName: string) {
  this.archivosService.getArchivo(fileName).subscribe({
    next: (blob: Blob) => {
      const mimeType = blob.type;

      if (mimeType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.archivoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
          this.tipoArchivo = 'imagen';
          this.displayImage = true; // Mostrar el diálogo automáticamente
        };
        reader.readAsDataURL(blob);
      } else if (mimeType === 'application/pdf') {
        const url = URL.createObjectURL(blob);
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.tipoArchivo = 'pdf';
        this.displayImage = true;
      } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.tipoArchivo = 'word';
        this.displayImage = true;
      } else if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.tipoArchivo = 'excel';
        this.displayImage = true;
      } else {
        this.tipoArchivo = 'desconocido';
        this.toastr.warning('Tipo de archivo no soportado para visualización', 'Advertencia');
      }
    },
    error: (error: any) => {
      console.error('Error al cargar el archivo:', error);
      this.toastr.error('No se pudo cargar el archivo para visualización', 'Error');
    }
  });
}
mostrarAdjunto() {
  if (!this.existingFileInfo || !this.existingFileInfo.ruta) {
    this.toastr.warning('No hay archivo para mostrar', 'Advertencia');
    return;
  }
  const fileName = this.existingFileInfo.ruta.split('/').pop() || '';
  this.toastr.info('Cargando archivo...', 'Un momento');
  this.archivosService.getArchivo(fileName).subscribe({
    next: (blob: Blob) => {
      const mimeType = blob.type;
      if (mimeType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.archivoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
          this.tipoArchivo = 'imagen';
          this.displayImage = true; // Mostrar el diálogo
        };
        reader.readAsDataURL(blob);
      } else if (mimeType === 'application/pdf') {
        const url = URL.createObjectURL(blob);
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.tipoArchivo = 'pdf';
        this.displayImage = true;
      } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.tipoArchivo = 'word';
        this.displayImage = true;
      } else if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.tipoArchivo = 'excel';
        this.displayImage = true;
      } else {
        this.tipoArchivo = 'desconocido';
        this.toastr.warning('Tipo de archivo no soportado para visualización', 'Advertencia');
      }
    },
    error: (error: any) => {
      console.error('Error al cargar el archivo:', error);
      
      if (error.status === 401 || error.status === 403) {
        this.toastr.error('Sesión expirada. Por favor inicia sesión de nuevo.', 'Error de autenticación');
      } else {
        this.toastr.error('No se pudo cargar el archivo para visualización', 'Error');
      }
    }
  });
}
eliminarArchivo() {
  if (!this.existingFileInfo || !this.existingFileInfo.idAdjunto) {
    this.toastr.warning('No hay archivo para eliminar', 'Advertencia');
    return;
  }
  
  this.confirmationService.confirm({
    message: '¿Está seguro que desea eliminar este archivo?',
    header: 'Confirmación de eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      const idAdjunto = this.existingFileInfo.idAdjunto;
      this.adjuntoService.eliminarAdjuntoCompleto(idAdjunto).subscribe({
        next: (_response) => {
          this.toastr.success('Archivo eliminado completamente', 'Éxito');
          this.existingFileInfo = null;
          this.existingFileUrl = null;
          this.uploadedFile = null;
          this.uploadedFiles = [];
          if (this.fileUpload) {
            this.fileUpload.clear();
          }
        },
        error: (error) => {
          this.toastr.error('Error al eliminar el archivo: ' + (error.error || error.message), 'Error');
        }
      });
    }
  });
}
adjuntarArchivoACompra(): void {
  if (!this.isEditMode) {
    this.toastr.warning('Esta función solo está disponible en modo edición', 'Advertencia');
    return;
  }
  if (!this.uploadedFile) {
    this.toastr.warning('No hay ningún archivo seleccionado para adjuntar', 'Advertencia');
    return;
  }
  if (this.existingFileInfo) {
    this.toastr.warning('Esta compra ya tiene un archivo adjunto. Elimine el actual antes de agregar uno nuevo', 'Advertencia');
    return;
  }
  let idCompra: number;
  if (this.detallesCompraPeticion && this.detallesCompraPeticion.length > 0) {
    idCompra = this.detallesCompraPeticion[0].idCompra;
  } else {
    const idFromUrl = this.route.snapshot.paramMap.get('factura');
    if (!idFromUrl) {
      this.toastr.error('No se pudo identificar la compra actual', 'Error');
      return;
    }
    idCompra = parseInt(idFromUrl);
  }
  this.toastr.info('Procesando su solicitud...', 'Adjuntando archivo');
  this.compraService.agregarAdjuntoCompra(idCompra, this.uploadedFile).subscribe({
    next: (response) => {
      this.toastr.success('Archivo adjuntado correctamente a la compra', 'Éxito');
      if (response && response.adjunto) {
        this.existingFileInfo = response.adjunto;
        this.obtenerYMostrarArchivo(response.adjunto.ruta);
      } else {
        const idFactura = this.route.snapshot.paramMap.get('factura');
        if (idFactura) {
          this.compraService.getCompraDetallada(idFactura).subscribe({
            next: (compraActualizada) => {
              if (compraActualizada.adjunto) {
                this.existingFileInfo = compraActualizada.adjunto;
                this.obtenerYMostrarArchivo(compraActualizada.adjunto.ruta);
              }
            },
            error: (errorRecarga) => {
              console.error('Error al recargar la información de la compra:', errorRecarga);
            }
          });
        }
      }
      if (this.fileUpload) {
        this.fileUpload.clear();
      }
    },
    error: (error) => {
      console.error('Error al adjuntar el archivo a la compra:', error);
      if (error.status === 400) {
        this.toastr.error('Petición incorrecta. Verifique el formato del archivo', 'Error');
      } else if (error.status === 401 || error.status === 403) {
        this.toastr.error('No tiene permisos para realizar esta acción', 'Error de autorización');
      } else if (error.status === 500) {
        this.toastr.error('Error interno del servidor al procesar el archivo', 'Error');
      } else {
        this.toastr.error('No se pudo adjuntar el archivo a la compra', 'Error');
      }
    }
  });
}
cerrarCompra(): void {
  if (!this.isEditMode) {
    this.toastr.warning('Esta función solo está disponible en modo edición', 'Advertencia');
    return;
  }
  
  let idCompra: number;
  if (this.detallesCompraPeticion && this.detallesCompraPeticion.length > 0) {
    idCompra = this.detallesCompraPeticion[0].idCompra;
  } else {
    const idFromUrl = this.route.snapshot.paramMap.get('factura');
    if (!idFromUrl) {
      this.toastr.error('No se pudo identificar la compra actual', 'Error');
      return;
    }
    idCompra = parseInt(idFromUrl);
  }
  
  this.confirmationService.confirm({
    message: 'Esta acción no se puede deshacer. ¿Desea continuar?',
    header: 'Confirmación para cerrar compra',
    icon: 'pi pi-exclamation-circle',
    acceptLabel: 'Sí, cerrar compra',
    rejectLabel: 'Cancelar',
    accept: () => {
      this.toastr.info('Procesando su solicitud...', 'Cerrando compra');
      this.compraService.cerrarCompra(idCompra).subscribe({
        next: (response) => {
          this.toastr.success('La compra ha sido cerrada exitosamente', 'Éxito');
          this.router.navigate(['/panel/Adquisiciones']);
        },
        error: (error) => {
          console.error('Error al cerrar la compra:', error);
          if (error.status === 400) {
            this.toastr.error('No se puede cerrar esta compra. Verifique que cumpla con los requisitos', 'Error');
          } else if (error.status === 401 || error.status === 403) {
            this.toastr.error('No tiene permisos para realizar esta acción', 'Error de autorización');
          } else if (error.status === 404) {
            this.toastr.error('No se encontró la compra especificada', 'Error');
          } else {
            this.toastr.error('Error al cerrar la compra: ' + (error.error?.mensaje || error.message), 'Error');
          }
        }
      });
    }
  });
}
}