import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { ServicesService } from '../../services/services.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login2',
  standalone: true,
  imports: [MatSelectModule, MatInputModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule, MatSnackBarModule, MatProgressSpinnerModule, NgIf],
  templateUrl: './login2.component.html',
  styleUrl: './login2.component.scss'
})
export class Login2Component implements OnInit {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private _snackBar: MatSnackBar, 
    private servicesService: ServicesService,
    private router: Router
  ) {
    this.form = this.fb.group({
      user: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('Login2Component inicializado');
  }

  ingresar() {
    if (this.form.valid) {
      this.loading = true;
      const user = this.form.value.user;
      const password = this.form.value.password;

      this.servicesService.loginUser(user, password).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          this.loading = false;
          if (response.success) {
            this.router.navigate(['/inicio']);
          } else {
            this.error(response.message || 'Credenciales inválidas');
          }
        },
        error: (error) => {
          console.error('Error en login', error);
          this.loading = false;
          this.error('Error al intentar iniciar sesión');
        }
      });
    } else {
      this.error('Por favor, complete todos los campos');
    }
  }

  error(message: string) {
    this._snackBar.open(message, '', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}