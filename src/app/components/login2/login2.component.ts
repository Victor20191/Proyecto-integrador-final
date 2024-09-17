import { Component, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login2',
  standalone: true,
  imports: [MatSelectModule,MatInputModule,MatButtonModule,MatProgressSpinnerModule,NgIf,ReactiveFormsModule,MatSnackBarModule,MatFormFieldModule],
  templateUrl: './login2.component.html',
  styleUrls: ['./login2.component.scss']
})
export class Login2Component implements OnInit {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      user: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('Login2Component inicializado');
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  ingresar() {
    if (this.form.valid) {
      this.loading = true;
      const user = this.form.value.user;
      const password = this.form.value.password;

      this.authService.login(user, password).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          if (response.success) {
            this.router.navigate(['/inicio']);
          } else {
            this.error(response.message || 'Credenciales inválidas');
          }
        },
        error: (error) => {
          console.error('Error en login', error);
          this.error('Error al intentar iniciar sesión: ' + error.message);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.error('Por favor, complete todos los campos');
    }
  }

  error(message: string) {
    this._snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}