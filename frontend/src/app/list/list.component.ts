import { Component, Injectable, ChangeDetectorRef } from '@angular/core';
import { AuthService } from "../service/auth.service";
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../entity/user';
import { NgForOf, NgIf } from '@angular/common';
import { FollowService } from '../service/follow.service';
import { UtilService } from '../service/util.service';
import { Follow } from '../../entity/follow';
import { WebSocketService } from '../chat/services/chat.service';
import { MessageBody, MessageData } from '../models/models.compenant';

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [
        ToolbarComponent,
        HttpClientModule,
        MatCardModule,
        RouterLink,
        MatDividerModule,
        NgForOf,
        NgIf
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    providers: [AuthService, FollowService]
})
@Injectable({
    providedIn: "root"
})
export class ListComponent {
    suggestions: User[] = []
    followers: User[] = []
    followings: User[] = []
    friends: User[] = []
    pendings: Follow[] = []
    messages!: string
    size!: number
    currentID: number = this.authService.getUserID()!
    messagesSubscription: any;

    constructor(
        private authService: AuthService,
        private followService: FollowService,
        private utilService: UtilService,
        private cdr: ChangeDetectorRef,
        private websocketService: WebSocketService
    ) { }

    listUsers(): void {
        this.listFollowers()
        this.listFriends()

        this.authService.getAll().subscribe((data: any) => {
            const users = data.users.filter((user: any) => user.id !== this.currentID);
            const existingFollowers = this.followers.map(follower => follower.id);
            const existingFriends = this.friends.map(friend => friend.id)

            this.suggestions = users.filter((user: any) => !existingFollowers.includes(user.id) && !existingFriends.includes(user.id));
            this.cdr.detectChanges()
        });
    }

    listPendings(): void {
        this.followService.getList(this.currentID, "pendings").subscribe((data: any) => {
            console.log("Pendings:", data)
        })
    }

    listFollowers(): void {
        this.followService.getList(this.currentID, "followers").subscribe((data: any) => {
            if (data.status !== 200) {
                this.messages = "No Followers"
                return
            }
            this.followers = data.followers
            this.cdr.detectChanges()
        })
        
    }

    listFriends(): void {
        this.followService.getList(this.currentID, "friends").subscribe((data: any) => {
            if (data.status != 200) {
                return
            }
            this.friends = data.friends
        })
    }

    listFollowings(): void {
        this.followService.getList(this.currentID, "followings").subscribe((data: any) => {
            if (data.status != 200) {
                return
            }
            this.followings = data.followings
        })
    }

    onFollow(id: number) {
        const data = {
            "follower_id": this.currentID,
            "followee_id": id
        }

        this.followService.follow(data, "follow").subscribe((response: any) => {
            this.utilService.onSnackBar(response.message, "info")
            this.getSuggestionsData()
            const messBody: MessageBody = {
                senderId: Number(this.currentID),
                receiverId: Number(id),
                message: `${localStorage.getItem("firstname")} ${localStorage.getItem("lastname")} follow you !`

            }
            const message: MessageData = {
                type: 'new_follow',
                datas: messBody,
            };
            const even = new Events(message.type, message.datas);
            sendEvent(this.websocketService, even);
        })
       
    }

    onAccept(id: number) {
        const data = {
            "follower_id": id,
            "followee_id": this.currentID
        }

        this.followService.request(data, "accept").subscribe((response: any) => {
            this.utilService.onSnackBar(response.message, "info")
            this.listFollowers()
            this.listUsers()
            const messBody: MessageBody = {
                senderId: Number(this.currentID),
                receiverId: Number(id),
                message: `${localStorage.getItem("firstname")} ${localStorage.getItem("lastname")} was accept your request`

            }
            const message: MessageData = {
                type: 'new_follow',
                datas: messBody,
            };
            const even = new Events(message.type, message.datas);
            sendEvent(this.websocketService, even);

        })  

    }

    onDecline(id: number) {
        const data = {
            "follower_id": id,
            "followee_id": this.currentID
        }

        this.followService.request(data, "decline").subscribe((response: any) => {
            this.utilService.onSnackBar(response.message, "info")
            this.listFollowers()
             const messBody: MessageBody = {
                senderId: Number(this.currentID),
                receiverId: Number(id),
                message: "Your reaquest was Declined"

            }
            const message: MessageData = {
                type: 'new_follow',
                datas: messBody,
            };
            const even = new Events(message.type, message.datas);
            sendEvent(this.websocketService, even);

        })
        location.reload()
    }

    getSuggestionsData(): void {
        this.listUsers()
        this.listFollowers()
        this.listFollowings()
        this.listFriends()
        this.listPendings()
    }



    ngOnInit(): void {
        this.authService.isOnline
        this.listUsers()
        this.getSuggestionsData()
        this.messagesSubscription = this.websocketService.messages$
        .subscribe((message) => {
           if  (message.type === 'new_follow') {
            this.listUsers()
            this.getSuggestionsData()
            }
        });
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
