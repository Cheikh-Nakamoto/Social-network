import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import * as model from './../../models/models.compenant';
import { CommonModule } from '@angular/common';
import {
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenav,
    MatSidenavContainer,
} from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { MatFabAnchor } from '@angular/material/button';
import { HomeComponent } from '../../home/components/home/home.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DataService, VisibilityService } from '../../data.service';
import { WebSocketService } from '../../chat/services/chat.service';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatComponent } from '../../chat/chat.component';
import { catchError, map, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FollowService } from '../../service/follow.service';
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
    providers: [DataService, AuthService, FollowService], // Add any additional services you need to this component.
})
export class SidenavComponent implements OnInit {
    isVisible: boolean = false;
    currentID: number = this.AuthService.getUserID()!;
    followings: model.User[] = [];
    friends: model.User[] = [];
    followers: model.User[] = [];
    messages!: string;
    menuItems = [
        { name: 'Home', route: '/', icon: 'icofont-ui-home' },
        {
            name: 'Profile',
            route: '/profile/' + this.currentID,
            icon: 'icofont-user',
        },
        {
            name: 'Suggestions',
            route: '/suggestions',
            icon: 'icofont-users-alt-4',
        },
        { name: 'Groups', route: '/groups', icon: 'icofont-users-social' },
    ];
    users: model.UserDTO[] = [];
    constructor(
        private router: Router,
        private apiservice: DataService,
        private websocketService: WebSocketService,
        private cdRef: ChangeDetectorRef,
        private AuthService: AuthService,
        private visibilityService: VisibilityService,
        private snackBar: MatSnackBar,
        private followService: FollowService
    ) // private cdr: ChangeDetectorRef
    {}
    ngOnInit(): void {
        this.listFollowers();
        this.listFriends();
        this.listFollowings();
        this.visibilityService.visibility$.subscribe((visible: any) => {
            this.isVisible = visible; // Met à jour l'état de visibilité
        });
        this.getAllusers();
        this.websocketService.connect();
        //
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
                // console.log("oooooooooooo", response.users.is_public===true)
                this.users = response.users.filter(
                    (user: any) => user !== null && user.id !== Number(iduser)
                );
            },
            (error) => {
                console.error('Error fetching posts:', error);
            }
        );

        // console.log("pppppppppppppppppp",this.users)
    }
    toggleVisibility(): void {
        this.isVisible = !this.isVisible; // Change l'état de visibilité
    }
    updateUsers(payloads: any[]): void {
        if (payloads == null) {
            return;
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
    handleToolbarClick(event: Event) {}
    handleMenuItemClick(item: any, event: Event) {
        this.router.navigate(item.route);
        // this.router.navigate(['/chat'], { queryParams: { userid: item.id } });
    }
    openCreatePostDialog(id: number) {
        this.listFollowings();
        this.listFriends();
        //  this.router.navigate(['/groupchat'], {
        //      queryParams: { groupId: this.groupId },
        //  });

        // this.getUserById(id).subscribe((user) => {
        //     if (user) {
        //         if (user.is_public) {
        //             this.dialog.open(ChatComponent, {
        //                 width: '400px', // Largeur de la boîte de dialogue
        //                 data: { userId: id }, // Envoi de paramètres au composant de la boîte de dialogue
        //                 position: {
        //                     bottom: '12px',
        //                     right: '6px',
        //                 },
        //             });
        //         } else {
        //             console.error('Utilisateur non trouvé');
        //             this.snackBar.open(
        //                 'This user is private, follow it before',
        //                 'Close',
        //                 {
        //                     duration: 5000, // Le message reste visible pendant 5 secondes
        //                     horizontalPosition: 'center',
        //                     verticalPosition: 'bottom',
        //                 }
        //             );
        //         }
        //     } else {
        //     }
        // });
        console.log(id)
        let isFollowing = this.followings.some((user) => user.id === id);
        let isFrient = this.friends.some((user) => user.id === id)
        let isFollower=this.followers.some((user)=>user.id===id)
        console.log(isFollower)
        // console.log('pppppp', this.followings);

        if (isFollower || isFrient || isFollowing) {
            // L'utilisateur fait partie des followers
            console.log("L'utilisateur est dans la liste des followings");

            this.dialog.open(ChatComponent, {
                width: '400px', // Largeur de la boîte de dialogue
                data: { userId: id }, // Envoi de paramètres au composant de la boîte de dialogue
                position: {
                    bottom: '12px',
                    right: '6px',
                },
            });
        } else {
            // L'utilisateur ne fait pas partie des followers
            console.log("L'utilisateur n'est pas dans la liste des followers.");

            this.snackBar.open('You must follow it before', 'Close', {
                duration: 5000, // Le message reste visible pendant 5 secondes
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
        }
    }

    listFriends(): void {
        this.followService
            .getList(this.currentID, 'friends')
            .subscribe((data: any) => {
                if (data.status != 200) {
                    return;
                }
                this.friends = data.friends;
            });
    }

    listFollowings(): void {
        this.followService
            .getList(this.currentID, 'followings')
            .subscribe((data: any) => {
                if (data.status != 200) {
                    return;
                }
                this.followings = data.followings;
                console.log('kkkkkkk', this.followings);
            });
    }

    listFollowers(): void {
        this.followService
            .getList(this.currentID, 'followers')
            .subscribe((data: any) => {
                if (data.status !== 200) {
                    this.messages = 'No Followers';
                    return;
                }
                this.followers = data.followers;
                this.cdRef.detectChanges();
            });
    }

    getUserById(id: number): Observable<model.UserDTO | null> {
        const userId = JSON.parse(localStorage.getItem('userId') || '{}');

        // Vérifiez si l'ID utilisateur existe dans localStorage
        if (!userId) {
            console.error('No user ID found in localStorage.');
            return of(null); // Retourne un Observable avec une valeur `null`
        }

        return this.apiservice.getData('allusers').pipe(
            map((response: any) => {
                // Trouver l'utilisateur avec l'ID correspondant
                const foundUser = response.users.find(
                    (user: any) => user != null && user.id === Number(id)
                );

                if (foundUser) {
                    return foundUser;
                } else {
                    console.warn('Utilisateur non trouvé avec ID:', id);
                    return null; // Retourne `null` si l'utilisateur n'est pas trouvé
                }
            }),
            catchError((error) => {
                console.error(
                    'Erreur lors de la récupération des utilisateurs:',
                    error
                );
                return of(null); // Retourne un Observable avec `null` en cas d'erreur
            })
        );
    }
}
