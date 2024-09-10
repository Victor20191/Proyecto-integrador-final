import { Component } from '@angular/core';
import { NgFor, NgIf, JsonPipe, CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ReadingQrComponent } from './components/reading-qr/reading-qr.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { RouterModule, Routes } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReadingQrComponent,
    HeaderComponent,
    FooterComponent,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    NgbModule,
    HttpClientModule,
    CommonModule,  
    NgFor,
    NgIf,
    SweetAlert2Module,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']  // También corrige styleUrl a styleUrls
})
export class AppComponent {
  title = 'app-qr';
}
