import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import * as model from './../../models/models.compenant'
import { CommonModule } from '@angular/common';
import { MatDrawer, MatDrawerContainer, MatDrawerContent, MatSidenav, MatSidenavContainer } from "@angular/material/sidenav";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatIcon } from "@angular/material/icon";
import { NgForOf, NgIf } from "@angular/common";
import { MatFabAnchor } from "@angular/material/button";
import { HomeComponent } from '../../home/components/home/home.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DataService, VisibilityService } from '../../data.service';
import { WebSocketService } from '../../chat/services/chat.service';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatComponent } from '../../chat/chat.component';
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
    providers: [DataService, AuthService], // Add any additional services you need to this component.
})
export class SidenavComponent implements OnInit {
    isVisible: boolean = false;
    currentID: number = this.AuthService.getUserID()!;
    menuItems = [
        { name: 'Home', route: '/', icon: 'icofont-ui-home' },
        {
            name: 'Profile',
            route: '/profile/' + this.currentID,
            icon: 'icofont-user',
        },
        { name: 'Suggestions', route: '/suggestions', icon: 'icofont-users-alt-4' },
        { name: 'Groups', route: '/groups', icon: 'icofont-users-social' },
    ];
    users: model.UserDTO[] = [];
    constructor(
        private router: Router,
        private apiservice: DataService,
        private websocketService: WebSocketService,
        private cdRef: ChangeDetectorRef,
        private AuthService: AuthService,
        private visibilityService: VisibilityService
    ) { }
    ngOnInit(): void {
        this.visibilityService.visibility$.subscribe((visible: any) => {
            this.isVisible = visible; // Met à jour l'état de visibilité
        });
        this.getAllusers();
        this.websocketService.connect();
        this.websocketService.messages$.subscribe(
            (message) => {
                // Traiter le message ici
                // even.routeEvent(message)
                if (message.type === 'get_chatbar_data') {
                    this.updateUsers(message.payload);
                    this.cdRef.detectChanges();
                }
            },
            (error) => {
                console.error('Error receiving WebSocket message:', error);
            }
        );
    }
    readonly dialog = inject(MatDialog);
    getAllusers(): void {
        const userData = JSON.parse(localStorage.getItem('userID') as string);
        const iduser = userData;
        this.apiservice.getData('allusers').subscribe(
            (response: any) => {
                // Typage de la réponse comme un tleau de Post

                this.users = response.users.filter(
                    (user: any) => user !== null && user.id !== Number(iduser) && user.is_public
                );
            },
            (error) => {
                console.error('Error fetching posts:', error);
            }
        );
    }
    toggleVisibility(): void {
        this.isVisible = !this.isVisible; // Change l'état de visibilité
    }
    updateUsers(payloads: any[]): void {
        if (payloads == null) {
            return
        }
        payloads.forEach((payload) => {
            let user = this.users.find((u) => u.id === payload.userId);
            if (user) {
                user.email = payload.email ?? user.email;
                user.nickname = payload.nickname ?? user.nickname;
                user.firstname = payload.firstname ?? user.firstname;
                user.isOnline = payload.online ?? user.isOnline;
                // Ajoutez d'autres mises à jour de champs si nécessaire
            } else {
                const newUser: model.UserDTO = {
                    id: payload.userId,
                    email: payload.email ?? '',
                    password: '', // Définissez une valeur par défaut ou gérez comme nécessaire
                    firstname: payload.firstname ?? '', // Définissez une valeur par défaut ou gérez comme nécessaire
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
    handleToolbarClick(event: Event) {
    }
    handleMenuItemClick(item: any, event: Event) {
        this.router.navigate(item.route);
        // this.router.navigate(['/chat'], { queryParams: { userid: item.id } });
    }
    openCreatePostDialog(id: number) {
        //  this.router.navigate(['/groupchat'], {
        //      queryParams: { groupId: this.groupId },
        //  });
        this.dialog.open(ChatComponent, {
            width: '400px', // Largeur de la boîte de dialogue
            data: { userId: id }, // Envoi de paramètres au composant de la boîte de dialogue
            position: {
                bottom: '12px',
                right: '6px',
            },
        });
    }
}
