import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgIf
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginMessage: string = '';
  loginError: boolean = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Formulario de inicio de sesión enviado', this.loginForm.value);
      this.loginMessage = 'Iniciando sesión...';
      this.loginError = false;
      setTimeout(() => {
        if (this.loginForm.value.username === 'usuario' && this.loginForm.value.password === 'contraseña') {
          this.loginMessage = 'Inicio de sesión exitoso';
        } else {
          this.loginMessage = 'Usuario o contraseña incorrectos';
          this.loginError = true;
        }
      }, 1500);
    } else {
      this.loginMessage = 'Por favor, complete todos los campos requeridos';
      this.loginError = true;
    }
  }
}