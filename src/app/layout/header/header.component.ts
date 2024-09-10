import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule,MatMenuModule,MatIconModule,MatToolbarModule,RouterModule,CommonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

constructor(private router:Router){}

onLogoClick(event: Event): void {
  event.preventDefault();
  console.log('Logo clicked!');
  this.router.navigate(['/']);
}
}
