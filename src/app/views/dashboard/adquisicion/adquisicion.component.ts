import { Component, OnInit, ViewChild } from '@angular/core';
import { Column, HeadersTables } from '../../shared/util/tables';
import { CompraResponse } from '../../../../domain/response/Adquisicion.model';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComprasService } from '../../services/compras.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdjuntoService } from '../../services/adjunto.service';
import { ArchivosService } from '../../services/archivos.service';

@Component({
  selector: 'app-adquisicion',
  providers: [DatePipe] ,
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
  ],
  templateUrl: './adquisicion.component.html',
  styleUrl: './adquisicion.component.scss'
})
export class AdquisicionComponent implements OnInit {
  @ViewChild('dt4') dt4!: Table;
  compras: CompraResponse[] = [];
  cols!: Column[];

  loading: boolean = true;

  constructor( 
    private comprasService: ComprasService, 
    private adjuntoService: AdjuntoService,
    private archivoService: ArchivosService,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe, 
  ){}
  ngOnInit(): void {
    this.cols = HeadersTables.AdquisicionesList;
    this.comprasService.getComprasList().subscribe({
      next: (response) => {
        console.log(response);
        this.compras = response.compras;
        this.loading = false;
      },error: (err) => {
        console.error(err);
      }
    })
  }

  DownloadFile(IdAdjunto: number) {
    this.adjuntoService.getAdjuntoById(IdAdjunto).subscribe({
      next: (adjunto) => {
        this.archivoService.getArchivo(adjunto.ruta).subscribe({
          next: (blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            const fileName = adjunto.nombre;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            setTimeout(() => {
              document.body.removeChild(downloadLink);
              window.URL.revokeObjectURL(blobUrl);
            }, 100);
          },
          error: (err) => {
            console.error("Error al descargar el archivo:", err);
          }
        });
      },
      error: (err) => {
        this.toastr.error('Factura sin adjunto!!!', 'Error');
      }
    });
  }
  filterGlobal(event: Event, dt: any) { //filtro para barra de busqueda
    const inputValue = (event.target as HTMLInputElement)?.value || '';
    dt.filterGlobal(inputValue, 'contains');
  }
  clear(table: Table) {
    table.clear();
  }
  formatDate(dateString: string): string {
    if(dateString === 'Vacío') return 'Vacío';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }
  getNameProvider(factura: string){
    const adquisicion = this.compras.find( x => x.numeroFactura == factura);
    if(adquisicion?.razonSocial) return `${adquisicion.nombre} ${adquisicion.razonSocial}`
    return `${adquisicion?.nombre} ${adquisicion?.apellidos}`;
  }
  abrirNuevaPestana() {
    this.router.navigate(['panel/Adquisiciones/agregar']);
  }
  exportCSV() {
    if (!this.dt4) {
      console.error('La tabla no está lista para exportar');
      return;
    }
    // Obtener solo los datos filtrados (o todos si no hay filtro)
    const datosParaExportar = this.dt4.filteredValue || this.compras;
    // Preparar datos para exportación
    const exportData = datosParaExportar.map(compra => {
      // Crear un nuevo objeto para exportación
      const compraExport: Record<string, any> = {};
      // Procesar cada columna
      this.cols.forEach(col => {
        if (!col.field || !col.header) return;
        // Caso especial para fechas
        if (col.field === 'fechaRegistro' && compra[col.field]) {
          compraExport[col.header] = this.formatDate(compra[col.field]) || '';
        }
        // Caso especial para nombres del proveedor
        else if (col.field === 'nombres') {
          compraExport[col.header] = this.getNameProvider(compra['numeroFactura']) || '';
        }
        // Caso especial para valores monetarios
        else if (['subtotal', 'iva', 'total'].includes(col.field)) {
          compraExport[col.header] = `$${compra[col.field].toFixed(2)}`;
        }
        // Caso general para otros campos
        else {
          compraExport[col.header] = compra[col.field] || '';
        }
      });
      
      return compraExport;
    });
    // Exportar a Excel
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { 'Adquisiciones': worksheet }, SheetNames: ['Adquisiciones'] };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      this.saveAsExcelFile(excelBuffer, "adquisiciones");
    }).catch(err => {
      console.error('Error al exportar a Excel:', err);
    });
  }
saveAsExcelFile(buffer: any, fileName: string): void {
  const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const EXCEL_EXTENSION = '.xlsx';
  const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
  // Crear enlace de descarga
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = fileName + '_' + this.datePipe.transform(new Date(), 'yyyy-MM-dd') + EXCEL_EXTENSION;
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
OnExportButton() {
  try {
    this.exportCSV();
  } catch (error) {
    console.error('Error al exportar datos:', error);
  }
}
redirectEditPage(factura: string) {
  const compra = this.compras.find(c => c.numeroFactura === factura);
  if (compra && compra.cerrado) {
    this.toastr.warning('No se puede editar una adquisición que ya está cerrada', 'Adquisición cerrada');
    return; 
  }
  this.router.navigate([`panel/Adquisiciones/editar/${factura}`]);
}
}
