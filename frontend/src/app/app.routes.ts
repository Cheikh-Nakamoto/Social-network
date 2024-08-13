
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SidenavComponent } from './nav/sidenav/sidenav.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { AuthGuard } from '../../controller/login.guard';
import { HomeGuard } from '../../controller/home.guard';
import { ChatComponent } from './chat/chat.component';
import { HomeComponent } from './home/components/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'Acceuil', component: SidenavComponent, canActivate: [HomeGuard] },
  { path: 'CreatePost', component: CreatePostComponent },
  {path: "chat", component:ChatComponent },
  { path: '', redirectTo: 'Acceuil', pathMatch: 'full' },
  { path: '**', redirectTo: 'Acceuil' }



]
