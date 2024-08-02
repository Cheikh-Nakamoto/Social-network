import { Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import { SidenavComponent } from './nav/sidenav/sidenav.component';
import { CreatePostComponent } from './create-post/create-post.component';

export const routes: Routes = [
  {path:"",component: LoginComponent},
  {path:"Acceuil",component:SidenavComponent},
  {path:"CreatePost",component:CreatePostComponent}

];
