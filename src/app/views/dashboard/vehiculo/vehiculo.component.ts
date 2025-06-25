import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { VehiculoService } from '../../services/vehiculo.service';
import { VehicleDetalleResponse, VehiculosList } from '../../../../domain/response/Vehiculo.model';
import { AddVehicleInstitucional, UpdateOptionsVehicle } from '../../../../domain/request/Vehiculo.model';
import { Column, HeadersTables } from '../../shared/util/tables';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { EstadosVehiculo, genericT } from '../../shared/util/genericData';
import { ToastrService } from 'ngx-toastr';
import { SkeletonModule } from 'primeng/skeleton';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ValidacionService } from '../../services/validacion.service';
import { Licencia } from '../../../../domain/response/Licencia.model';
import { LicenciaService } from '../../services/licencia.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { FileUpload } from 'primeng/fileupload';
import { SkeletonSimpleComponent } from '../../shared/components/skeleton/skeleton-simple.component';
import { formatDate } from '@angular/common';
import { TipoVehiculoService } from '../../services/tipo-vehiculo.service';
import { ImageModule } from 'primeng/image';
import { AdjuntoService } from '../../services/adjunto.service';
import { ArchivosService } from '../../services/archivos.service';
import { PropietarioService } from '../../services/propietario.service';
import { FormularioPersonaComponent } from '../../shared/components/formulario-persona/formulario-persona.component';

@Component({
  selector: 'app-vehiculo',
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
    FloatLabel,
    SelectModule,
    DatePickerModule,
    DropdownModule,
    SkeletonModule,
    ProgressSpinnerModule,
    TagModule,
    MultiSelectModule,
    DividerModule,
    FileUpload,
    SkeletonSimpleComponent,
    ImageModule,
    FormularioPersonaComponent
  ],
  standalone: true,
  templateUrl: './vehiculo.component.html',
  styleUrl: './vehiculo.component.scss'
})
export class VehiculoComponent implements OnInit{
  @ViewChild('dt2') dt2!: Table;
  vehiculos: VehiculosList[] = [];
  cols!: Column[];

  loading: boolean = true;
  loadingEditDialog: boolean = false;
  loadingExpandDialog: boolean = false;
  loadingPropietariosDialog: boolean = false;

  visibleAdd: boolean = false;
  visibleEdit: boolean = false;
  visibleExpand: boolean = false;
  visiblePropietarios: boolean = false;
  visibleAddPropietario: boolean = false;

  fb_addVehiculo!: FormGroup;
  fb_editVehiculo!: FormGroup;

  VehicleAuxDialog!: VehicleDetalleResponse;
  ImgsVehicle: string[] = ['','','',''];

  estado!: genericT[];
  tiposVehiculo!: genericT[];
  licencia!: Licencia[];

  propietarios!: any[];
  colsPropietarios!: Column[];
  headerPlacaPropietario: string = '';
  idVehiculoPropietario!: number;

  selectedEstadoFilter!: genericT;
  selectedYearRTVFilter!: number;
  nowDate!: Date;
  minDate!: Date;

  uploadedFiles: any[] = [];

  iconValidarDocumento: string = 'pi pi-search';

  constructor(
    private vehiculoService: VehiculoService,
    private validacionService: ValidacionService,
    private toastr: ToastrService,
    private licenciaService: LicenciaService,
    private tipoVehService: TipoVehiculoService,
    private adjuntoService: AdjuntoService,
    private archService: ArchivosService,
    private propietarioService: PropietarioService,
  ) { }

  ngOnInit(): void {
    this.estado = EstadosVehiculo;
    this.cols = HeadersTables.VehiculosList;
    this.colsPropietarios = HeadersTables.PropietariosList;
    this.nowDate = new Date();
    this.nowDate.setFullYear(this.nowDate.getFullYear()+1);
    this.minDate = new Date(2015, 0, 1);
    this.VehicleAuxDialog = this.setPlaneVehicle();
    this.getData();
    this.inizializeFormsGroup();
    this.fb_addVehiculo.get('num_documento')?.valueChanges.subscribe(() => {
      this.fb_addVehiculo.patchValue({propietarioId: null});;
      this.iconValidarDocumento = 'pi pi-search';
    });
  }
  getData() {
    this.tipoVehService.getOrdenesTrabajoListado().subscribe({
      next: (response) => {
        this.tiposVehiculo = response;
      },
      error: (err) => {
        console.error("Error al obtener tipos de vehículo: ", err);
      }
    });
    this.vehiculoService.getVehiculosInstitucionales().subscribe({
      next: (response) => {
        this.vehiculos = response;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error al obtener vehículos: ", err);
      }
    })
    this.licenciaService.getLicencias().subscribe({
      next: (response) => {
        this.licencia = response;
      },
      error: (err) => {
        console.error("Error al obtener licencias: ", err);
      }
    })
  }
  inizializeFormsGroup() {
    this.fb_addVehiculo = new FormGroup({
      placa: new FormControl<string | null>(null, [Validators.required, Validators.pattern(/^[A-Za-z]{3}-\d{4}$/)]),
      num_chasis: new FormControl<string | null>(null),
      tipoVehiculo: new FormControl<number | null>(null, [Validators.required]),
      licencia: new FormControl<Licencia[] | null>(null, [Validators.required]),
      numeroVehiculo: new FormControl<number | null>(null, [Validators.required, Validators.max(1000)]),
      marca: new FormControl<string | null>(null, [Validators.required]),
      modelo: new FormControl<string | null>(null),
      version: new FormControl<string | null>(null),
      color: new FormControl<string | null>(null),
      anio: new FormControl<number | null>(null, [Validators.required]),
      ultimoAnioRTV: new FormControl<number | null>(null, [Validators.required]),
      ultimoAnioMatriculacion: new FormControl<number | null>(null, [Validators.required]),
      num_documento: new FormControl<string | null>(null, [Validators.required, Validators.minLength(10), Validators.maxLength(16)]),
      propietarioId: new FormControl<number | null>(null, [Validators.required])
    })
    this.fb_editVehiculo = new FormGroup({
      estado: new FormControl<number | null>(null, [Validators.required]),
      ultimoAnioRTV: new FormControl<number | null>(null, [Validators.required]),
      ultimoAnioMatriculacion: new FormControl<number | null>(null, [Validators.required]),
    });
  }
  setPlaneVehicle(){
    return {
      idVehiculo: 0,
      marca: '',
      modelo: '',
      version: '',
      placa: '',
      anio: 0,
      color: '',
      numeroChasis: '',
      numeroVehiculo: '',
      estado: 0,
      ultimoAnioMatriculacion: 0,
      ultimoAnioRTV: 0,
      tipoVehiculo: '',
      propietario: {
        idCliente: 0,
        nombre: '',
        apellidos: '',
      },
      licencias: []
    }
  }
convertFormToVehicle(): AddVehicleInstitucional {
  const getYear = (controlName: string) => {
    const val = this.fb_addVehiculo.get(controlName)?.value;
    return val instanceof Date ? val.getFullYear() : Number(val);
  };

  return {
    numeroChasis: this.fb_addVehiculo.get('num_chasis')?.value,
    placa: this.fb_addVehiculo.get('placa')?.value,
    idTipoVehiculo: this.fb_addVehiculo.get('tipoVehiculo')?.value,
    idLicencias: this.fb_addVehiculo.get('licencia')?.value,
    numeroVehiculo: this.fb_addVehiculo.get('numeroVehiculo')?.value,
    marca: this.fb_addVehiculo.get('marca')?.value,
    modelo: this.fb_addVehiculo.get('modelo')?.value,
    version: this.fb_addVehiculo.get('version')?.value,
    color: this.fb_addVehiculo.get('color')?.value,
    anio: getYear('anio'),
    estado: 0,
    ultimoAnioRTV: getYear('ultimoAnioRTV'),
    ultimoAnioMatriculacion: getYear('ultimoAnioMatriculacion'),
    idCliente: this.fb_addVehiculo.get('propietarioId')?.value,
    archivos: this.uploadedFiles
  };
}
  createVehicle() {
    const vehicle: AddVehicleInstitucional = this.convertFormToVehicle();
    console.log("Vehículo a crear: ", vehicle);
    this.vehiculoService.postVehicleInstitucional(vehicle).subscribe({
      next: (response: any) => {
        this.toastr.success('Vehículo creado correctamente', 'Éxito!');
        this.visibleAdd = false;
        this.ngOnInit();
      },
      error: (err) => {
        console.error("Error al crear vehículo: ", err);
        this.toastr.error('Hubo un error al crear el vehículo', 'Error!');
      }
    })
  }
  updateVehicleOptions(){
    const vehicle: UpdateOptionsVehicle = {
      idVehiculo: this.VehicleAuxDialog.idVehiculo,
      estado: this.fb_editVehiculo.get('estado')?.value,
      ultimoAnioRTV: this.fb_editVehiculo.get('ultimoAnioRTV')?.value.getFullYear(),
      ultimoAnioMatriculacion: this.fb_editVehiculo.get('ultimoAnioMatriculacion')?.value.getFullYear()
    }

    this.vehiculoService.putVehicleInstitucionalOptions(vehicle).subscribe({
      next: (response: any) => {
        this.toastr.success('Opciones del vehículo actualizadas correctamente', 'Éxito!');
        this.visibleEdit = false;
        this.ngOnInit();
      },
      error: (err) => {
        this.toastr.error('Hubo un error al actualizar las opciones del vehículo', 'Error!');
      }
    })
  }
  onSelectAddFilesVehicle(event:any) {
    for(let file of event.files) {
        this.uploadedFiles.push(file);
    }
  }
  responseDialogPropietariosForm(valor: any){
    if (valor) {
      this.closeDialogAddPropietario();
    }
  }
  cargarArchivo(fileName: string) {
    this.archService.getArchivo(fileName).subscribe(blob => {
      const reader = new FileReader();
        reader.onload = () => {
          this.ImgsVehicle.push(reader.result as string);
        };
        reader.readAsDataURL(blob);
      
    });
  }
  showDialogAdd() {
    this.visibleAdd = true;
  } 
  showDialogEdit(placa: string) {
    this.visibleEdit = true;
    this.loadingEditDialog = true;
    this.vehiculoService.getVehiculoByPlaca(placa).subscribe({
      next: (response: any) => {
        this.VehicleAuxDialog = response;
        this.fb_editVehiculo.patchValue({
          estado: response.estado,
          ultimoAnioRTV: new Date(`${response.ultimoAnioRTV}-01-01`),
          ultimoAnioMatriculacion: new Date(`${response.ultimoAnioMatriculacion}-01-01`)
        });
        this.loadingEditDialog = false;
      },
      error: (err) => {
        console.error("Error al obtener vehículo: ", err);
        this.toastr.error('Hubo un error al obtener el vehículo', 'Error!');
        this.loadingEditDialog = false;
        this.visibleEdit = false;
      }
    })
  }
  showDialogExpand(placa: string){
    this.ImgsVehicle = ['','','',''];
    this.visibleExpand = true;
    this.VehicleAuxDialog = this.setPlaneVehicle();
    this.vehiculoService.getVehiculoByPlaca(placa).subscribe({
      next: (vehiculo: any) => {
        this.VehicleAuxDialog = vehiculo;
        this.adjuntoService.getAdjuntosByVehiculo(vehiculo.idVehiculo).subscribe({
          next: (adjuntos: any) => {
            adjuntos.map( (adjunto:any, index:any) => {
              this.cargarArchivo(adjunto.ruta);
              if((adjuntos.length-1) == index) {
                this.loadingExpandDialog = false;
                return;
              }
            })
          },
          error: (err) => {
            console.error("Error al obtener adjuntos: ", err);
            this.toastr.error('Hubo un error al obtener los adjuntos', 'Error!');
          }
        })
      },
      error: (err) => {
        console.error("Error al obtener vehículo: ", err);
        this.toastr.error('Hubo un error al obtener el vehículo', 'Error!');
        this.loadingEditDialog = false;
        this.visibleEdit = false;
      }
    });
  }
  showDialogPropietarios(id: number, placa: string) {
    this.visiblePropietarios = true;
    this.visibleAddPropietario = false;
    this.loadingPropietariosDialog = true;
    this.headerPlacaPropietario = placa;
    this.idVehiculoPropietario = id;
    this.propietarioService.getPropietariosVehiculo(id).subscribe({
      next: (response: any) => {
        this.propietarios = response;
        this.loadingPropietariosDialog = false;
      }, 
      error: (err) => {
        console.error("Error al obtener propietarios: ", err);
        this.toastr.error('Hubo un error al obtener los propietarios', 'Error!');
        this.loadingPropietariosDialog = false;
        this.visiblePropietarios = false;
      }
    });
  }
  showDialogAddPropietario() {
    this.visibleAddPropietario = true;
  }
  formatDate(dateString: string): string {
    if(dateString === 'Vacío') return 'Vacío';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses van de 0 a 11
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  closeDialogAddPropietario(){
    this.visibleAddPropietario = false;
    this.visiblePropietarios = false;
  }
  filterGlobal(event: Event, dt: any) { //filtro para barra de busqueda
    const inputValue = (event.target as HTMLInputElement)?.value || '';
    dt.filterGlobal(inputValue, 'contains');
  }
  clear(table: Table) {
    table.clear();
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
    const item = this.estado.find(x => x.code === id);  
    return item?.name;
  }
  GetSeverityYear(anio: number){
    const year = this.nowDate.getFullYear()-1;
    if(anio == year) return 'success';
    if(anio == (year-1)) return 'warn';
    return 'danger';
  }
  validarDocumento() {
    this.iconValidarDocumento = ''
    const numDocumento = this.fb_addVehiculo.get('num_documento')?.value;
    this.validacionService.validarClienteXDoc(numDocumento).subscribe({
      next: (response) => {
        if(response.esClienteActivo){
          this.fb_addVehiculo.patchValue({propietarioId: response.idPersona});
          this.iconValidarDocumento = 'pi pi-check';
        }
        this.iconValidarDocumento = 'pi pi-check';  
      },
      error: (err) => {
        this.iconValidarDocumento = 'pi pi-search';
        this.toastr.warning(err.error, "Persona no encontrada!");
      }
    })
  }
  // Método para exportar a CSV con opciones avanzadas
  exportCSV() {
    // Obtener solo los datos filtrados (o todos si no hay filtro)
    const datosParaExportar = this.dt2.filteredValue || this.vehiculos;
    // Preparar datos para exportación
    const exportData = datosParaExportar.map(vehiculo => {
      // Crear un nuevo objeto para exportación
      const vehiculoExport: Record<string, any> = {};
      
      // Procesar cada columna
      this.cols.forEach(col => {
        if (!col.field || !col.header) return;
        
        // Caso especial para licencias
        if (col.field === 'licencia') {
          // Extraer los valores de licencia usando una función especializada
          vehiculoExport[col.header] = this.extraerTextoLicencias(vehiculo.licencia);
        }
        // Caso especial para estado
        else if (col.field === 'estado') {
          vehiculoExport[col.header] = this.GetEstado(Number(vehiculo[col.field])) || '';
        } 
        // Caso general para otros campos
        else {
          vehiculoExport[col.header] = (vehiculo as any)[col.field] || '';
        }
      });
      
      return vehiculoExport;
    });
    
    // Exportar a Excel
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { 'Vehiculos': worksheet }, SheetNames: ['Vehiculos'] };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      this.saveAsExcelFile(excelBuffer, "vehiculos_institucionales");
    }).catch(err => {
      console.error('Error al exportar a Excel:', err);
      this.toastr.error('Hubo un problema al exportar los datos', 'Error');
    });
  }  
  // Agregar esta nueva función especializada
  private extraerTextoLicencias(licencias: any): string {
    // Si no hay licencias o no es un array
    if (!licencias || !Array.isArray(licencias) || licencias.length === 0) {
      return 'Sin licencias';
    }
    
    // Convertir cada licencia a texto
    const textos = licencias.map(lic => {
      // Si es un objeto
      if (lic && typeof lic === 'object') {
        // Buscar cualquier propiedad de texto que pudiera contener la información
        if (lic.detalle) return String(lic.detalle);
        if (lic.descripcion) return String(lic.descripcion);
        if (lic.nombre) return String(lic.nombre);
        if (lic.tipo) return String(lic.tipo);
        
        // Si no hay propiedades específicas, convertir todo el objeto a JSON
        const objKeys = Object.keys(lic);
        if (objKeys.length > 0) {
          // Intentar primero con la primera propiedad
          const firstProp = lic[objKeys[0]];
          if (typeof firstProp === 'string' || typeof firstProp === 'number') {
            return String(firstProp);
          }
        }
        
        // Si todo lo demás falla, mostrar [ID: X]
        if (lic.idLicencia) return `[ID: ${lic.idLicencia}]`;
      }
      
      // Si la licencia es un valor primitivo
      return String(lic);
    });
    
    // Filtrar elementos vacíos y unir con comas
    return textos.filter(t => t && t.trim() !== '').join(', ');
  }
  // Método auxiliar para guardar como archivo Excel
  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName + '_' + formatDate(new Date(), 'yyyy-MM-dd', 'en-US') + EXCEL_EXTENSION;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  // Implementar el método OnExportButton existente
  OnExportButton() {
    this.exportCSV();
  }
}
