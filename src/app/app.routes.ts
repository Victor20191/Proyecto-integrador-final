import { Routes } from '@angular/router';
import { ReadingQrComponent } from './components/reading-qr/reading-qr.component';
import { ReporteQrComponent } from './components/reporte-qr/reporte-qr.component';
import { LoginComponent } from './components/login/login.component';
import { Login2Component } from './components/login2/login2.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login2', pathMatch: 'full' }, 
    { path: 'login2', component: Login2Component },
    { path: 'inicio', component: ReadingQrComponent },   
    { path: 'reporte', component: ReporteQrComponent },
    { path: '**', redirectTo: 'login2', pathMatch: 'full' }
];