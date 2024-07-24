import { Component } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatTabsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'

})
export class LoginComponent {
  log ! : HTMLDivElement;
  signup! : HTMLDivElement
  constructor(){}

  translate(){
    this.signup = document.querySelector('.signup-section') as HTMLDivElement
    this.log = document.querySelector('.login-section') as HTMLDivElement
    this.log.style.display = 'flex'
    this.signup.style.display = 'none'
  }
}
