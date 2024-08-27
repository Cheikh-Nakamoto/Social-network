
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SidenavComponent } from './nav/sidenav/sidenav.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { AuthGuard } from '../../controller/login.guard';
import { HomeGuard } from '../../controller/home.guard';
import { ChatComponent } from './chat/chat.component';
import { GroupeComponent } from './groupes/groupe/groupe.component';
import { CreateGroupComponent } from './groupes/create-group/create-group.component';
import { ByIdComponent } from './groupes/by-id/by-id.component';
import { ProfileComponent } from './profile/profile.component';
// import { EventsComponent } from './groupes/events/events.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'Acceuil', component: SidenavComponent, canActivate: [HomeGuard] },
  { path: 'CreatePost', component: CreatePostComponent, canActivate: [HomeGuard]  },
  { path: "groups", component: GroupeComponent , canActivate: [HomeGuard] },
  { path: "groups/:id", component:ByIdComponent,canActivate: [HomeGuard]},
  // { path: "/group/event/create", component:EventsComponent,canActivate: [HomeGuard]},
  { path: 'profile', component: ProfileComponent, canActivate: [HomeGuard] },
  {path: "CreateGroup", component: CreateGroupComponent, canActivate: [HomeGuard] },
  {path: "chat", component:ChatComponent },
  { path: '', redirectTo: 'Acceuil', pathMatch: 'full' },
  { path: '**', redirectTo: 'Acceuil' }

 
]
