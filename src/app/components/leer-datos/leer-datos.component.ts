import { NgFor, NgIf, JsonPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { ServicesService } from '../../services/services.service';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-leer-datos',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, MatSelectModule, NgFor, NgIf, JsonPipe, CommonModule],  // Agrega CommonModule
  templateUrl: './leer-datos.component.html',
  providers: [ServicesService], 
  styleUrls: ['./leer-datos.component.scss'],
})
export class LeerDatosComponent implements OnInit {
 
  datos: Observable<any> | undefined;

  constructor(private serviceService: ServicesService) {}

  ngOnInit() {
    this.datos = this.serviceService.consultarDb();
  }
}
