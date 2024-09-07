import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReadingQrComponent } from './components/reading-qr/reading-qr.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReadingQrComponent,HeaderComponent,FooterComponent,MatButtonModule,MatToolbarModule,MatIconModule,NgbModule,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app-qr';
}
