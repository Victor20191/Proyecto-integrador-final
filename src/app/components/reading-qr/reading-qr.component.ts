import { NgFor, NgIf, JsonPipe, CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormsModule, Validators, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../layout/header/header.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { AreaQr, QrLectura, VehiculoQr } from '../../interface/interface-menu';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { ServicesService } from '../../services/services.service';

@Component({
  selector: 'app-reading-qr',
  standalone: true,
  imports: [
    NgFor, MatSelectModule, FormsModule, ReactiveFormsModule, JsonPipe, NgIf,
    HttpClientModule, CommonModule, SweetAlert2Module, HeaderComponent,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule
  ],
  providers: [ServicesService],
  templateUrl: './reading-qr.component.html',
  styleUrls: ['./reading-qr.component.scss']
})
export class ReadingQrComponent implements OnInit {
  formularioContacto: FormGroup;
  isSubmitting = false;
  qrCount = 0;

  @ViewChild('areaSelect') areaSelect!: ElementRef;
  @ViewChild('TextAreaQr') TextAreaQr!: ElementRef;

  areas: AreaQr[] = [];
  vehiculos: VehiculoQr[] = [];

  constructor(private fb: FormBuilder, private servicesService: ServicesService) {
    this.formularioContacto = this.fb.group({
      area: ['', Validators.required],
      vehiculo: [''],
      comentario: ['', Validators.required]
    });

    this.formularioContacto.get('comentario')?.valueChanges.subscribe(value => {
      this.updateQrCount(value);
    });

    this.formularioContacto.get('area')?.valueChanges.subscribe(areaId => {
      console.log('Área seleccionada (desde suscripción):', areaId);
      if (areaId) {
        setTimeout(() => {
          this.TextAreaQr.nativeElement.focus();
        }, 0);
      }

      if (this.mostrarVehiculo()) {
        console.log('Mostrando campo de vehículo');
        this.formularioContacto.get('vehiculo')?.setValidators(Validators.required);
      } else {
        console.log('Ocultando campo de vehículo');
        this.formularioContacto.get('vehiculo')?.clearValidators();
        this.formularioContacto.get('vehiculo')?.setValue('');
      }
      this.formularioContacto.get('vehiculo')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.ConsultArea();
    this.ConsultaVehiculos();
  }

  updateQrCount(value: string) {
    const qrCodes = value.trim().split('\n').filter(Boolean);
    this.qrCount = qrCodes.length;
  }

  ConsultArea() {
    this.servicesService.areaCapturaQr().subscribe({
      next: (data: AreaQr[]) => {
        this.areas = data;
        console.log('Áreas cargadas:', this.areas);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al consultar áreas', error);
        Swal.fire({
          title: 'Error',
          text: `Hubo un error al consultar las áreas: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  ConsultaVehiculos() {
    this.servicesService.vehiculosCapturaQr().subscribe({
      next: (data: VehiculoQr[]) => {
        this.vehiculos = data;
        console.log('Vehículos cargados:', this.vehiculos);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al consultar vehículos', error);
        Swal.fire({
          title: 'Error',
          text: `Hubo un error al consultar los vehículos: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  mostrarVehiculo(): boolean {
    const areaId = this.formularioContacto.get('area')?.value;
    console.log('Área seleccionada en mostrarVehiculo:', areaId);
    return areaId === 3 || areaId === 4 || areaId === 5;
  }

  submit() {
    if (this.formularioContacto.valid) {
      this.isSubmitting = true;
      this.SwalWaitAlert();

      const area = this.formularioContacto.get('area')?.value;
      const vehiculo = this.formularioContacto.get('vehiculo')?.value;
      const qrCodes = this.formularioContacto.get('comentario')?.value.trim();
      const qrCode: string[] = qrCodes.split('\n').filter(Boolean);

      const qrLecturas: QrLectura[] = qrCode.map((codigo: string) => ({
        area_captura: area,
        vehiculo: vehiculo || '',
        lectura: codigo
      }));

      this.servicesService.enviarLecturas(qrLecturas).subscribe({
        next: (response) => {
          console.log('Datos enviados correctamente', response);
          this.showAlert();
          this.formularioContacto.reset();
          this.areaSelect.nativeElement.focus();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al enviar los datos', error);
          this.showErrorAlert(error.message);
        },
        complete: () => {
          this.isSubmitting = false;
          Swal.close();
        }
      });
    }
  }

  showAlert() {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Datos enviados correctamente',
      icon: 'success',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }

  showErrorAlert(errorMessage: string) {
    Swal.fire({
      title: 'Error',
      text: `Hubo un error al enviar los datos: ${errorMessage}`,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }

  SwalWaitAlert() {
    Swal.fire({
      title: 'Guardando datos...',
      text: 'Por favor, espera mientras se guardan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  limpiarFormulario() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se borrarán todos los datos ingresados",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.formularioContacto.reset();
        this.qrCount = 0;
        if (this.areaSelect) {
          this.areaSelect.nativeElement.focus();
        }
        Swal.fire(
          'Borrado',
          'Los datos han sido borrados',
          'success'
        )
      }
    })
  }
}