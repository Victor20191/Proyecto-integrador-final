import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServicesService } from '../../services/services.service';
import { LecturasQrDb } from '../../interface/interface-menu';
import { HeaderComponent } from '../../layout/header/header.component';
import { MatDatepicker } from '@angular/material/datepicker';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reporte-qr',
  templateUrl: './reporte-qr.component.html',
  styleUrls: ['./reporte-qr.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTooltipModule,
    HeaderComponent
  ],
  providers: [DatePipe]
})
export class ReporteQrComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fecha_registro', 'nombre_area', 'placa_vehiculo', 'nombre_usuario', 'orden_produccion', 'referencia', 'unidades', 'lote', 'fecha_vencimiento', 'numero_corbata'];
  dataSource: MatTableDataSource<LecturasQrDb>;
  filterObject: any = {};
  isAdmin: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('pickerStart') pickerStart!: MatDatepicker<Date>;
  @ViewChild('pickerEnd') pickerEnd!: MatDatepicker<Date>;

  constructor(private servicesService: ServicesService, private datePipe: DatePipe,private authService: AuthService) {
    this.dataSource = new MatTableDataSource<LecturasQrDb>();
    this.isAdmin = this.authService.getUserRole()==='Administrador';
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: LecturasQrDb, property: string): string | number => {
      switch(property) {
        case 'fecha_registro': 
          return new Date(item.fecha_registro).getTime();
        default: 
          return item[property as keyof LecturasQrDb] as string | number || '';
      }
    };
    this.dataSource.filterPredicate = this.createFilter();
  }

  loadData() {
    console.log('Iniciando carga de datos...');
    this.servicesService.consultarDb().subscribe(
      (data: LecturasQrDb[]) => {
        console.log('Datos recibidos:', data);
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  createFilter(): (data: LecturasQrDb, filter: string) => boolean {
    return (data: LecturasQrDb, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      const fechaRegistro = new Date(data.fecha_registro);
      
      return (
        (!searchTerms.fechaInicio || fechaRegistro >= new Date(searchTerms.fechaInicio)) &&
        (!searchTerms.fechaFin || fechaRegistro <= new Date(searchTerms.fechaFin)) &&
        (!searchTerms.nombre_area || data.nombre_area.toLowerCase().includes(searchTerms.nombre_area.toLowerCase())) &&
        (!searchTerms.placa_vehiculo || (data.placa_vehiculo ?? '').toLowerCase().includes(searchTerms.placa_vehiculo.toLowerCase())) &&
        (!searchTerms.nombre_usuario || (data.nombre_usuario ?? '').toLowerCase().includes(searchTerms.nombre_usuario.toLowerCase())) &&
        (!searchTerms.orden_produccion || (data.orden_produccion ?? '').toLowerCase().includes(searchTerms.orden_produccion.toLowerCase())) &&
        (!searchTerms.referencia || (data.referencia ?? '').toLowerCase().includes(searchTerms.referencia.toLowerCase())) &&
        (!searchTerms.unidades || (data.unidades ?? '').toLowerCase().includes(searchTerms.unidades.toLowerCase())) &&
        (!searchTerms.lote || (data.lote ?? '').toLowerCase().includes(searchTerms.lote.toLowerCase())) &&
        (!searchTerms.fecha_vencimiento || (data.fecha_vencimiento ?? '').toLowerCase().includes(searchTerms.fecha_vencimiento.toLowerCase())) &&
        (!searchTerms.numero_corbata || (data.numero_corbata ?? '').toLowerCase().includes(searchTerms.numero_corbata.toLowerCase()))
      );
    };
  }

  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterObject[column] = filterValue.trim().toLowerCase();
    this.applyFilterToDataSource();
  }

  applyDateFilter(event: any, isStartDate: boolean) {
    const date = event.value;
    if (isStartDate) {
      this.filterObject.fechaInicio = date;
    } else {
      this.filterObject.fechaFin = date;
    }
    this.applyFilterToDataSource();
  }

  clearDateFilter(isStartDate: boolean, inputElement: HTMLInputElement) {
    if (isStartDate) {
      delete this.filterObject.fechaInicio;
      this.pickerStart.close();
    } else {
      delete this.filterObject.fechaFin;
      this.pickerEnd.close();
    }
    inputElement.value = '';
    this.applyFilterToDataSource();
  }

  applyFilterToDataSource() {
    this.dataSource.filter = JSON.stringify(this.filterObject);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  downloadCSV() {
    const csvData = this.convertToCSV(this.dataSource.filteredData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'reporte.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  convertToCSV(data: LecturasQrDb[]): string {
    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => {
      return Object.values(obj).map(value => {
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    }).join('\n');
    return header + rows;
  }
}