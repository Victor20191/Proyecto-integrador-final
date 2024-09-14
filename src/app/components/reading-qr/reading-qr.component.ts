import { NgFor, NgIf, JsonPipe, CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormsModule, Validators, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../layout/header/header.component';

//Componentes aplicación
import { AreaQr, QrLectura } from '../../interface/interface-menu';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { ServicesService } from '../../services/services.service';

@Component({
  selector: 'app-reading-qr',
  standalone: true,
  imports: [
    NgFor,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    NgIf,
    HttpClientModule,
    CommonModule,
    SweetAlert2Module,
    HeaderComponent
    
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

  areas: AreaQr[] = [
    { id: '1', nombreArea: 'Producto terminado' },
    { id: '2', nombreArea: 'Almacenamiento Cava' },
    { id: '3', nombreArea: 'Entrega Cedi Medellin' },
    { id: '4', nombreArea: 'Recibo Cedi Medellin' }
  ];

  vehiculos = [
    { id: '1', placa: 'ABC123' },
    { id: '2', placa: 'DEF456' },
    { id: '3', placa: 'GHI789' }
  ];

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
      if (areaId) {
        setTimeout(() => {
          this.TextAreaQr.nativeElement.focus();
        }, 0);
      }

      if (areaId === '3' || areaId === '4') {
        this.formularioContacto.get('vehiculo')?.setValidators(Validators.required);
      } else {
        this.formularioContacto.get('vehiculo')?.clearValidators();
        this.formularioContacto.get('vehiculo')?.setValue('');
      }
      this.formularioContacto.get('vehiculo')?.updateValueAndValidity();
    });
  }

  ngOnInit() {}

  // Método para actualizar el contador de códigos QR
  updateQrCount(value: string) {
    const qrCodes = value.trim().split('\n').filter(Boolean);
    this.qrCount = qrCodes.length;
  }

  // Envío de datos del formulario
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

      this.servicesService.enviarLecturas(qrLecturas).subscribe(
        (response) => {
          console.log('Datos enviados correctamente');
          this.showAlert();
          this.formularioContacto.reset();
          this.areaSelect.nativeElement.focus();
        },
        (error: HttpErrorResponse) => {
          console.error('Error al enviar los datos', error);
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('Error:', error.error);
          this.showErrorAlert(error.message);
        }
      ).add(() => {
        this.isSubmitting = false;
      });
    }
  }

  showAlert() {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Datos enviados correctamente',
      icon: 'success',
      confirmButtonText: 'OK'
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

  mostrarVehiculo(): boolean {
    const areaId = this.formularioContacto.get('area')?.value;
    return areaId === '3' || areaId === '4';
  }
}
