import { routes } from './../../app.routes';
import { ChangeDetectorRef, Component, Injectable } from '@angular/core';
import * as model from './../../models/models.compenant'
import { CommonModule } from '@angular/common';
import {
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenav,
    MatSidenavContainer
} from "@angular/material/sidenav";
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {MatListModule} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {NgForOf, NgIf} from "@angular/common";
import {MatFabAnchor} from "@angular/material/button";
import { HomeComponent } from '../../home/components/home/home.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DataService } from '../../data.service';
import { WebSocketService } from '../../chat/services/chat.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatListModule,
    MatIcon,
    NgForOf,
    MatFabAnchor,
    RouterLink,
    NgIf,
    MatSidenavContainer,
    MatSidenav,
    HomeComponent,
    ToolbarComponent,
    RouterOutlet,
    CommonModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  providers: [DataService], // Add any additional services you need to this component.
})
export class SidenavComponent {
  users: model.UserDTO[] = [];
  constructor(
    private router: Router,
    private apiservice: DataService,
    private websocketService: WebSocketService,
    private cdRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getAllusers();
    this.websocketService.connect();
    this.websocketService.messages$.subscribe(
      (message) => {
        console.log('Message received in navComponent:', message);
        // Traiter le message ici
        // even.routeEvent(message);
        if (message.type === 'get_chatbar_data') {
          console.log('ssssssssssssss');
          this.updateUsers(message.payload)
          console.log(this.users);
          this.cdRef.detectChanges();
        }
      },
      (error) => {
        console.error('Error receiving WebSocket message:', error);
      }
    );
  }

  getAllusers(): void {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    this.apiservice.getData('allusers').subscribe(
      (response: any) => {
        console.log("ffffffff", response)
         const usersArray: model.UserDTO[] = Object.values(response);
        // Typage de la réponse comme un tableau de Post
        this.users = usersArray.filter(
          (user) => user != null && user.id != userData.id
        ); // Filtrez les utilisateurs nulls
        console.log(
          'recuperation de tous les utilisteur du social network',
          this.users
        );
        // this.loadLikes("post");
        // this.loadDislikes("post");
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  updateUsers(payloads: any[]): void {
    payloads.forEach((payload) => {
      let user = this.users.find((u) => u.id === payload.userId);
      
      if (user) {
        user.email = payload.email ?? user.email;
        user.nickname = payload.nickname ?? user.nickname;
        user.isOnline = payload.online ?? user.isOnline;
        // Ajoutez d'autres mises à jour de champs si nécessaire
      } else {
        const newUser: model.UserDTO = {
          id: payload.userId,
          email: payload.email ?? '',
          password: '', // Définissez une valeur par défaut ou gérez comme nécessaire
          firstname: '', // Définissez une valeur par défaut ou gérez comme nécessaire
          lastname: '', // Définissez une valeur par défaut ou gérez comme nécessaire
          date_of_birth: '', // Définissez une valeur par défaut ou gérez comme nécessaire
          avatar: '', // Définissez une valeur par défaut ou gérez comme nécessaire
          nickname: payload.nickname ?? '',
          about_me: '', // Définissez une valeur par défaut ou gérez comme nécessaire
          is_public: false, // Définissez une valeur par défaut ou gérez comme nécessaire
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          isOnline: payload.online ?? false,
        };
        this.users.push(newUser);
      }
    });
  }
  menuItems = [
    { name: 'Home', route: '/', icon: 'home' },
    { name: 'Profile', route: '/profile', icon: 'person' },
    { name: 'Friends', route: '/followers', icon: 'person_add' },
    { name: 'Groups', route: '/groups', icon: 'group' },
    { name: 'New Post', route: '/CreatePost', icon: 'create' },
    
  ];

  handleToolbarClick(event: Event) {
    console.log('Toolbar link clicked!', event);
  }

  handleMenuItemClick(item: any, event: Event) {
    console.log('Menu item clicked:', item.id);
    
    this.router.navigate(item.route)
    
  }
}
