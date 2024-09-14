import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { DatePipe } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';

@Component({
  selector: 'app-reporte-qr',
  templateUrl: './reporte-qr.component.html',
  styleUrls: ['./reporte-qr.component.scss'],
  standalone: true,
  imports: [
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
    DatePipe,
    HeaderComponent
  ],
  providers: [DatePipe]
})
export class ReporteQrComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'fecha_registro', 'area_captura', 'vehiculo', 'lectura'];
  dataSource: MatTableDataSource<LecturasQrDb>;
  filterObject: any = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private servicesService: ServicesService, private datePipe: DatePipe) {
    this.dataSource = new MatTableDataSource<LecturasQrDb>([]);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.servicesService.consultarDb().subscribe(
      (data: LecturasQrDb[]) => {
        this.dataSource.data = data;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: LecturasQrDb, property: string) => {
      switch(property) {
        case 'fecha_registro': 
          return new Date(item.fecha_registro).getTime();
        default: 
          return item[property as keyof LecturasQrDb];
      }
    };
    this.dataSource.filterPredicate = this.createFilter();
  }

  createFilter(): (data: LecturasQrDb, filter: string) => boolean {
    return (data: LecturasQrDb, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      const fechaRegistro = new Date(data.fecha_registro);
      
      return (
        (!searchTerms.id || data.id.toString().toLowerCase().includes(searchTerms.id.toLowerCase())) &&
        (!searchTerms.fecha_registro || 
        ((!searchTerms.fechaInicio || fechaRegistro >= new Date(searchTerms.fechaInicio)) &&
        (!searchTerms.fechaFin || fechaRegistro <= new Date(searchTerms.fechaFin)))) &&
        (!searchTerms.area_captura || data.area_captura.toLowerCase().includes(searchTerms.area_captura.toLowerCase())) &&
        (!searchTerms.vehiculo || data.vehiculo.toLowerCase().includes(searchTerms.vehiculo.toLowerCase())) &&
        (!searchTerms.lectura || data.lectura.toLowerCase().includes(searchTerms.lectura.toLowerCase()))
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
    this.filterObject.fecha_registro = true;
    this.applyFilterToDataSource();
  }

  clearDateFilter(isStartDate: boolean) {
    if (isStartDate) {
      delete this.filterObject.fechaInicio;
    } else {
      delete this.filterObject.fechaFin;
    }
    if (!this.filterObject.fechaInicio && !this.filterObject.fechaFin) {
      delete this.filterObject.fecha_registro;
    }
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