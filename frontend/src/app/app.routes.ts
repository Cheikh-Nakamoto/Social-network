
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
import { EventsComponent } from './groupes/events/events.component';
import { ListComponent } from './list/list.component';
import { GroupchatComponent } from './groupes/groupchat/groupchat.component';
// import { EventsComponent } from './groupes/events/events.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'Accueil', component: SidenavComponent, canActivate: [HomeGuard] },
  { path: 'CreatePost', component: CreatePostComponent, canActivate: [HomeGuard]  },
  { path: "groups", component: GroupeComponent , canActivate: [HomeGuard] },
  { path: "suggestions", component: ListComponent, canActivate: [HomeGuard] },
  { path: "groups/:id", component:ByIdComponent,canActivate: [HomeGuard]},
  { path: "event/create", component:EventsComponent,canActivate: [HomeGuard]},
  { path: 'profile/:id', component: ProfileComponent },
  {path: "CreateGroup", component: CreateGroupComponent, canActivate: [HomeGuard] },
  { path: "chat", component: ChatComponent },
  {path: "groupchat", component: GroupchatComponent},
  { path: '', redirectTo: 'Accueil', pathMatch: 'full' },
  { path: '**', redirectTo: 'Accueil' }

 
]
