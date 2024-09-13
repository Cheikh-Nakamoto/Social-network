import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule, MatIconButton } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { Router, RouterLink } from "@angular/router";
import { MatBadge } from "@angular/material/badge";
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { MatCardAvatar } from "@angular/material/card";
import { MessageBody, MessageData, NotificationVerification } from '../../models/models.compenant';
import { AuthService } from '../../service/auth.service';
import { NgForOf, NumberSymbol } from '@angular/common';
import { count, distinctUntilChanged, firstValueFrom, Subscription } from 'rxjs';
import { GetUserService, VisibilityService } from '../../data.service';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../chat/services/chat.service';
import { UtilService } from '../../service/util.service';




@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [
        CommonModule,
        MatInputModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        FormsModule,
        MatToolbar,
        MatIcon,
        MatIconButton,
        MatFormField,
        MatInput,
        MatLabel,
        RouterLink,
        MatBadge,
        MatMenu,
        MatCardAvatar,
        MatButtonModule,
        MatMenuModule,
        NgForOf,
    ],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
    providers: [DataService, AuthService, GetUserService],
})
export class ToolbarComponent implements OnInit, OnDestroy {
    title = 'Social Network';
    id!: string;
    username = '';
    avatar = '';
    hiddenNotif = false;
    NotifyLength!: number;
    hiddenMessage = false;
    timerid!: any;
    notifylength: string = '0';
    chatCount: number = 0;
    private chatCountSubscription!: Subscription;
    newMessages: any[] = []; // Pour stocker les nouveaux messages reçus

    messagesSubscription: any;
    newMessage: any;
    notificationVisible = false;
    constructor(
        private dataService: DataService,
        private authService: AuthService,
        private router: Router,
        private websocketService: WebSocketService,
        private userservice: GetUserService,
        private visibilityService: VisibilityService,
        private utilService : UtilService
    ) {}

    IsNotify: NotificationVerification = { notif: [] };

    searchQuery: string = '';
    filteredUsers: any[] = [];

    ngOnInit() {
        this.chatCountSubscription = this.userservice.chatCount$.subscribe(
            (count) => {
                this.chatCount = count;
            }
        );
        this.authService.isOnline();
        this.id = JSON.parse(localStorage.getItem('userID') as string);
        this.username = localStorage.getItem('firstname') as string;
        this.avatar =
            (localStorage.getItem('avatar') as string) == ''
                ? 'female.svg'
                : (localStorage.getItem('avatar') as string);

        this.notify();

        this.websocketService.connect();

        this.messagesSubscription = this.websocketService.messages$.subscribe(
            (message) => {
                if (
                    message.type === 'new_notification' &&
                    message.payload.messageId == 0
                ) {
                    this.notify();
                }else if  (message.type === 'new_follow') {
                    console.log(message)
                    this.utilService.onSnackBar(message.payload
                        .message,"succes")
                }
                if (message.type === 'new_message') {
                    this.newMessage = message; // Stocker le message reçu
                    this.notificationVisible = true; // Afficher la notification

                    // Cacher la notification après 10 secondes
                    setTimeout(() => {
                        this.notificationVisible = false;
                        this.newMessage = null; // Réinitialiser le message
                    }, 10000);
                }
                if (message.type === 'new_message_group') {
                    this.newMessage = message; // Stocker le message reçu
                    this.notificationVisible = true; // Afficher la notification

                    // Cacher la notification après 10 secondes
                    setTimeout(() => {
                        this.notificationVisible = false;
                        this.newMessage = null; // Réinitialiser le message
                    }, 10000);

                }
                if (message.type === 'new_notification_chat') {
                    this.newMessage = message; // Stocker le message reçu
                    this.notificationVisible = true; // Afficher la notification

                    // Cacher la notification après 10 secondes
                    setTimeout(() => {
                        this.notificationVisible = false;
                        this.newMessage = null; // Réinitialiser le message
                    }, 10000);
                }
            }
        );
    }

    openChatFromNotification(message: any): void {
        // Logique pour ouvrir le chat associé au message
        console.log('Ouvrir le chat pour le message', message);
        this.notificationVisible = false; // Masquer la notification après ouverture du chat
        this.newMessage = null; // Réinitialiser le message
    }
    onToggleVisibility(): void {
        this.visibilityService.toggleVisibility(); // Change l'état de visibilité
    }
    ngOnDestroy(): void {
        if (this.chatCountSubscription) {
            this.chatCountSubscription.unsubscribe();
        }
        clearTimeout(this.timerid);
    }
    notify() {
        this.dataService.getNotification(this.id).subscribe((res) => {
            this.IsNotify.notif = res == null ? [] : res;
            this.notifylength =
                this.IsNotify.notif.length != 0
                    ? this.IsNotify.notif.length.toString()
                    : '0';
        });
    }

    InviteAccept(
        Id: number,
        groupID: number,
        userid: number,
        targetid: number,
        role: string
    ) {
        let body = {
            id: Id,
            user_id: userid,
            group_id: groupID,
            target_id: targetid,
            role: role,
        };
        this.dataService
            .accept_decline('accept-request', body)
            .subscribe((res) => {
                if (res == null) {
                    this.IsNotify.notif = this.IsNotify.notif.filter(
                        (notif) => notif.id != Id
                    );
                    this.notifylength = String(Number(this.notifylength) - 1);
                    let messBody: MessageBody = {
                        senderId: Number(0),
                        receiverId: Number(0),
                        message: 'Nouveau group created successfully',
                    };
                    let message: MessageData = {
                        type: 'new_group',
                        datas: messBody,
                    };
                    let even = new Events(message.type, message.datas);
                    sendEvent(this.websocketService, even);
                    if (role == 'admin') {
                        messBody = {
                            senderId: Number(targetid),
                            receiverId: Number(userid),
                            message: '',
                        };
                        message = {
                            type: 'new_invitation',
                            datas: messBody,
                        };
                        even = new Events(message.type, message.datas);
                        sendEvent(this.websocketService, even);
                    }
                }
            });
    }
    InviteDecline(
        Id: number,
        groupID: number,
        userid: number,
        targetid: number,
        role: string
    ) {
        let body = {
            id: Id,
            user_id: userid,
            group_id: groupID,
            target_id: targetid,
        };
        this.dataService
            .accept_decline('decline-request', body)
            .subscribe((res) => {
                this.IsNotify.notif = this.IsNotify.notif.filter(
                    (notif) => notif.id != Id
                );
                this.notifylength = String(Number(this.notifylength) - 1);
            });
    }
    handleLogout() {
        this.websocketService.close();
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigateByUrl('/login');
            },
            error: (err: any) => {
                console.error('Erreur lors de la déconnexion :', err);
            },
        });
    }

    visibilityNotif() {
        this.hiddenNotif = !this.hiddenNotif;
    }

    visibilityMessage() {
        this.hiddenMessage = !this.hiddenMessage;
    }

    onSearchChange(searchValue: string): void {
        if (searchValue && searchValue.length > 0) {
            this.dataService
                .searchUsers(searchValue)
                .subscribe((users: any[]) => {
                    this.filteredUsers = users;
                });
        } else {
            this.filteredUsers = [];
        }
    }

    goToUserProfile(user: any): void {
        this.router.navigate(['/profile', user.id]);
    }

    goToProfile(userId: string) {
        this.router.navigate(['/profile', userId]);
    }
}




function sendEvent(websocketService: WebSocketService, datas: any) {
    websocketService.sendMessage(datas);
}

class Events {
    type: string;
    payload: any;

    constructor(type: string, payload: any) {
        this.type = type;
        this.payload = payload;
    }
}


