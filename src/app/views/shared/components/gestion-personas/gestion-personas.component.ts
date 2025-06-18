import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Column, HeadersTablesPersons } from '../../../shared/util/tables';
import { UsuarioService } from '../../../services/usuario.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CrearPersonaComponent } from "./crear-persona/crear-persona.component";
import { SharedService } from '../service/shared.service';
import { MecanicoService } from '../../../services/mecanico.service';
import { ProveedorService } from '../../../services/proveedor.service';

@Component({
  selector: 'app-gestion-personas',
  imports: [
    TableModule,
    CommonModule,
    InputText,
    Button,
    IconField,
    InputIcon,
    TagModule,
    SelectModule,
    DropdownModule,
    CrearPersonaComponent
],
  standalone: true,
  templateUrl: './gestion-personas.component.html',
  styleUrl: './gestion-personas.component.scss'
})
export class GestionPersonasComponent implements OnInit{
  
  @Input() persona: any;
  cols: Column[] = [];
  personas: any[] = [];
  loading: boolean = true;

  visibleDialogAdd: boolean = false;
  visibleDialogEdit: boolean = false;
  visibleDialogDisable: boolean = false;
  
  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private mecanicoService: MecanicoService,  
    private proveedorService: ProveedorService,
  ) {}

  ngOnInit(): void {
    this.initData();
    this.sharedService.estado$.subscribe(valor => {
      this.visibleDialogAdd = valor;
    });
  }

  initData() {
    this.cols = HeadersTablesPersons.PersonasList;
    switch (this.persona.key) {
      case 'user':
        this.usuarioService.getUsuarios().subscribe({
          next: (response) => {
            this.personas = response;
            this.loading = false;
          },
          error: (error) => {
            this.router.navigate(['/NotFound404']);
            this.toastr.error('Error', 'Error al cargar los usuarios');
            this.loading = false;
          }
        });
        break;
      case 'mec':
        this.mecanicoService.getMecanicos().subscribe({
          next: (response) => {
            this.personas = response;
            this.loading = false;
          },
          error: (error) => {
            this.router.navigate(['/NotFound404']);
            this.toastr.error('Error', 'Error al cargar los mecánicos');
            this.loading = false;
          }
        });
        break;
      case 'prov':
        this.cargarProveedores();
        break;
    }
  }

  showDialogAdd() {
    this.sharedService.cambiarEstado(true);
  }

showDialogEdit(documento: string) {
    console.log('🔍 Buscando persona con documento:', documento);
    const persona = this.personas.find(p => p.documento === documento);
    
    if (persona) {
        console.log('✅ Persona encontrada:', persona);
        // Establecer datos PRIMERO
        this.sharedService.establecerPersonaEdicion(persona);
        this.sharedService.establecerModoEdicion(true);
        
        // Abrir diálogo DESPUÉS
        setTimeout(() => {
            this.sharedService.cambiarEstado(true);
        }, 50);
    } else {
        console.error('❌ No se encontró persona con documento:', documento);
        this.toastr.error('No se encontraron los datos de la persona', 'Error');
    }
}
  showDialogDisable(code: string) {
    // Implementar lógica de desactivación
  }

  // Método para restaurar persona según el tipo
  restaurarPersona(documento: string) {
    if (!documento) {
      this.toastr.error('Documento no válido', 'Error');
      return;
    }

    switch (this.persona.key) {
      case 'user':
        this.restaurarUsuario(documento);
        break;
      case 'mec':
        this.restaurarMecanico(documento);
        break;
      case 'prov':
        this.restaurarProveedor(documento);
        break;
      default:
        this.toastr.warning('Tipo de persona no soportado para restauración', 'Advertencia');
        break;
    }
  }

  // Método específico para restaurar usuario
  restaurarUsuario(documento: string) {
    this.loading = true;
    this.usuarioService.restaurarUsuario(documento).subscribe({
      next: (response) => {
        this.toastr.success('Cambio de estado exitoso', 'Éxito');
        this.initData(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error al restaurar usuario:', error);
        this.toastr.error('Error al restaurar el usuario', 'Error');
        this.loading = false;
      }
    });
  }
  // Método específico para restaurar mecánico
  restaurarMecanico(documento: string) {
      this.loading = true;
      this.mecanicoService.restaurarMecanico(documento).subscribe({
        next: (response) => {
          this.toastr.success('Cambio de estado exitoso', 'Éxito');
          this.initData(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error al restaurar mecánico:', error);
          this.toastr.error('Error al restaurar el mecánico', 'Error');
          this.loading = false;
        }
      });
    }

  // Método específico para restaurar proveedor
  restaurarProveedor(documento: string) {
    this.loading = true;
    this.proveedorService.restaurarProveedor(documento).subscribe({
      next: (response) => {
        this.toastr.success('Cambio de estado exitoso', 'Éxito');
        this.initData(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error al restaurar proveedor:', error);
        this.toastr.error('Error al restaurar el proveedor', 'Error');
        this.loading = false;
      }
    });
  }

  getFullName(code: string) {
    const persona = this.personas.find((p) => p.codigo === code);
    return persona.apellidos ? `${persona.nombre} ${persona.apellidos}` : persona.nombre;
  }

  filterGlobal(event: Event, dt: any) {
    const inputValue = (event.target as HTMLInputElement)?.value || '';
    dt.filterGlobal(inputValue, 'contains');
  }

  clear(table: any) {
    table.clear();
  }

  cargarProveedores() {
    this.loading = true;
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.personas = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.loading = false;
      }
    });
  }
}