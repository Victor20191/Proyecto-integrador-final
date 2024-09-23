import { NgFor, NgIf, JsonPipe, CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormsModule, Validators, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../layout/header/header.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AreaQr, QrLectura, VehiculoQr } from '../../interface/interface-menu';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { ServicesService } from '../../services/services.service';
import { AuthService } from '../../services/auth.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';

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
export class ReadingQrComponent implements OnInit, OnDestroy {
  formularioContacto: FormGroup;
  isSubmitting = false;
  qrCount = 0;

  @ViewChild('areaSelect') areaSelect!: ElementRef;
  @ViewChild('TextAreaQr') TextAreaQr!: ElementRef;

  areas: AreaQr[] = [];
  vehiculos: VehiculoQr[] = [];

  private subscriptions: Subscription[] = [];
  private areaSubject = new Subject<void>();
  private vehiculoSubject = new Subject<void>();

  constructor(
    private fb: FormBuilder, 
    private servicesService: ServicesService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
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
        this.vehiculoSubject.next();
      } else {
        console.log('Ocultando campo de vehículo');
        this.formularioContacto.get('vehiculo')?.clearValidators();
        this.formularioContacto.get('vehiculo')?.setValue('');
      }
      this.formularioContacto.get('vehiculo')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.setupAreaDebounce();
    this.setupVehiculoDebounce();
    this.ConsultArea();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.servicesService.cancelPendingRequests();
  }

  updateQrCount(value: string) {
    const qrCodes = value.trim().split('\n').filter(Boolean);
    this.qrCount = qrCodes.length;
  }

  setupAreaDebounce() {
    const sub = this.areaSubject.pipe(
      debounceTime(100),
      switchMap(() => this.servicesService.areaCapturaQr()),
      catchError(error => {
        this.showErrorAlert(`Error al cargar áreas: ${error.message}`);
        return [];
      })
    ).subscribe(
      areas => {
        this.areas = areas;
        console.log('Áreas cargadas:', this.areas);
      }
    );
    this.subscriptions.push(sub);
  }

  setupVehiculoDebounce() {
    const sub = this.vehiculoSubject.pipe(
      debounceTime(100),
      switchMap(() => this.servicesService.vehiculosCapturaQr()),
      catchError(error => {
        this.showErrorAlert(`Error al cargar vehículos: ${error.message}`);
        return [];
      })
    ).subscribe(
      vehiculos => {
        this.vehiculos = vehiculos;
        console.log('Vehículos cargados:', this.vehiculos);
      }
    );
    this.subscriptions.push(sub);
  }

  ConsultArea() {
    this.areaSubject.next();
  }

  ConsultaVehiculos() {
    this.vehiculoSubject.next();
  }

  mostrarVehiculo(): boolean {
    const areaId = this.formularioContacto.get('area')?.value;
    console.log('Área seleccionada en mostrarVehiculo:', areaId);
    return areaId === 3 || areaId === 4 || areaId === 5;
  }


submit() {
  if (this.formularioContacto.valid) {
    this.isSubmitting = true;

    const area = this.formularioContacto.get('area')?.value;
    const vehiculo = this.formularioContacto.get('vehiculo')?.value;
    const qrCodes = this.formularioContacto.get('comentario')?.value.trim();
    const qrCode: string[] = qrCodes.split('\n').filter(Boolean);

    const qrLecturas: QrLectura[] = qrCode.map((codigo: string) => ({
      area_captura: area,
      vehiculo: vehiculo || '',
      lectura: codigo,
      id_usuario: this.authService.currentUserValue?.id
    }));

    this.servicesService.enviarLecturas(qrLecturas).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor en el componente:', response);
        this.showNotification(`Se insertaron ${response.count} registros correctamente.`);
        this.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al enviar los datos', error);
        this.showNotification(error.message || 'Error desconocido al enviar los datos', true);
      },
      complete: () => {
        console.log('Operación completada');
        this.isSubmitting = false;
      }
    });
  } else {
    this.showNotification('Por favor, complete todos los campos requeridos.', true);
  }
}


  // submit() {
  //   if (this.formularioContacto.valid) {
  //     this.isSubmitting = true;
  //     this.SwalWaitAlert();
  
  //     const area = this.formularioContacto.get('area')?.value;
  //     const vehiculo = this.formularioContacto.get('vehiculo')?.value;
  //     const qrCodes = this.formularioContacto.get('comentario')?.value.trim();
  //     const qrCode: string[] = qrCodes.split('\n').filter(Boolean);
  
  //     const qrLecturas: QrLectura[] = qrCode.map((codigo: string) => ({
  //       area_captura: area,
  //       vehiculo: vehiculo || '',
  //       lectura: codigo,
  //       id_usuario: this.authService.currentUserValue?.id
  //     }));
  
  //     console.log('Enviando lecturas:', qrLecturas);
  
  //     const sub = this.servicesService.enviarLecturas(qrLecturas).subscribe({
  //       next: (response) => {
  //         console.log('Respuesta del servidor:', response);
  //         this.showAlert();
  //         this.resetForm();
  //       },
  //       error: (error: HttpErrorResponse) => {
  //         console.error('Error al enviar los datos', error);
  //         this.showErrorAlert(error.message || 'Error desconocido al enviar los datos');
  //       },
  //       complete: () => {
  //         console.log('Operación completada');
  //         this.isSubmitting = false;
  //         Swal.close();
  //       }
  //     });
  //     this.subscriptions.push(sub);
  //   } else {
  //     console.log('Formulario inválido', this.formularioContacto.errors);
  //     this.showErrorAlert('Por favor, complete todos los campos requeridos.');
  //   }
  // }


  
  private resetForm() {
    this.formularioContacto.reset();
    this.qrCount = 0;
    if (this.areaSelect) {
      this.areaSelect.nativeElement.focus();
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
      text: errorMessage,
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
  showNotification(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}