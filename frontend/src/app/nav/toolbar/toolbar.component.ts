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
import { NotificationVerification } from '../../models/models.compenant';
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

    messagesSubscription: any;
    constructor(
        private dataService: DataService,
        private authService: AuthService,
        private router: Router,
        private websocketService: WebSocketService,
        private userservice: GetUserService,
        private visibilityService: VisibilityService
    ) {
        console.log('DataService:', this.dataService);
    }

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

        this.messagesSubscription = this.websocketService.messages$
            .pipe(
                distinctUntilChanged(
                    (prev, curr) =>
                        prev.payload.messageId === curr.payload.messageId &&
                        prev.payload.message === curr.payload.message &&
                        prev.type === curr.type
                )
            )
            .subscribe((message) => {
                console.log('message de notification ');
                if (
                    message.type === 'new_message' &&
                    message.payload.messageId == 0
                ) {
                    this.userservice.updateChatCount(1);
                    this.notify();
                } else if (message.type === 'get_messages') {
                    // this.userservice.updateChatCount(-1);
                }
            });
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

    InviteAccept(Id: number, groupID: number, userid: number) {
        let body = {
            id: Id,
            user_id: userid,
            group_id: groupID,
        };
        this.dataService
            .accept_decline('accept-request', body)
            .subscribe((res) => {
                if (res == null) {
                    this.IsNotify.notif = this.IsNotify.notif.filter(
                        (notif) => notif.id != Id
                    );
                    this.notifylength = String(Number(this.notifylength) - 1);
                }
            });
    }
    InviteDecline(Id: number, groupID: number, userid: number) {
        let body = {
            id: Id,
            user_id: userid,
            group_id: groupID,
        };
        console.log(body);
        this.dataService
            .accept_decline('decline-request', body)
            .subscribe((res) => {
                this.IsNotify.notif = this.IsNotify.notif.filter(
                    (notif) => notif.id != Id
                );
                this.notifylength = String(Number(this.notifylength) - 1);
            });
    }
    AdminAddMembers() {}
    handleLogout() {
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
        console.log('Valeur de recherche:', searchValue);
        if (searchValue && searchValue.length > 0) {
            this.dataService
                .searchUsers(searchValue)
                .subscribe((users: any[]) => {
                    console.log('Utilisateurs filtrés:', users);
                    this.filteredUsers = users;
                });
        } else {
            this.filteredUsers = [];
        }
    }

    goToUserProfile(user: any): void {
        console.log('Navigating to profile of:', user); // Debug
        this.router.navigate(['/profile', user.id]);
    }

    goToProfile(userId: string) {
        this.router.navigate(['/profile', userId]);
    }
}

