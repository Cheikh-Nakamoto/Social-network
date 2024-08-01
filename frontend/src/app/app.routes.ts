import { Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import { HomeComponent } from './home/components/home/home.component';

export const routes: Routes = [
  {path:"login",component: LoginComponent},
  {path:"",component:HomeComponent}
];
