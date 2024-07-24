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

}
