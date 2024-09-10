import { Routes } from '@angular/router';
import { ReadingQrComponent } from './components/reading-qr/reading-qr.component';
import { ReporteQrComponent } from './components/reporte-qr/reporte-qr.component';

export const routes: Routes = [
    { path: '', component: ReadingQrComponent }, 
    { path: 'inicio', component: ReadingQrComponent },   
    { path: 'reporte', component: ReporteQrComponent }
];