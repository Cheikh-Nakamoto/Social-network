import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidenavComponent } from './nav/sidenav/sidenav.component';
import { ToolbarComponent } from './nav/toolbar/toolbar.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/components/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToolbarComponent,
    SidenavComponent,
    LoginComponent,
    HomeComponent,
    HttpClientModule,
    CommonModule, // Asegúrate de importar CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login'; // Ajusta según tu ruta de login
  }
}
