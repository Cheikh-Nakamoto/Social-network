import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from './nav/sidenav/sidenav.component';
import { ToolbarComponent } from './nav/toolbar/toolbar.component';
import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/components/home/home.component";


@Component({
   
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarComponent, SidenavComponent, LoginComponent, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Janel fmokomba';
}
