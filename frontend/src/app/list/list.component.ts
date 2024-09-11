import { Component, Injectable } from '@angular/core';
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
    messages!: string
    size!: number
    currentID: number = this.authService.getUserID()!

    constructor(
        private authService: AuthService,
        private followService: FollowService,
        private utilService: UtilService
    ) { }

    listUsers(): void {
        this.listFollowers()
        this.listFriends()
        
        this.authService.getAll().subscribe((data: any) => {
            const users = data.users.filter((user: any) => user.id !== this.currentID);
            const existingFollowers = this.followers.map(follower => follower.id);
            const existingFriends = this.friends.map(friend => friend.id)
            
            this.suggestions = users.filter((user: any) => !existingFollowers.includes(user.id) && !existingFriends.includes(user.id));
        });
    }

    listFollowers(): void {
        this.followService.getList(this.currentID, "followers").subscribe((data: any) => {
            if (data.status !== 200) {
                this.messages = "No Followers"
                console.log("Follower's list is empty")
                return
            }
            console.log("Follower's list:", data.followers)
            this.followers = data.followers
        })
    }

    listFriends(): void {
        this.followService.getList(this.currentID, "friends").subscribe((data:any) => {
            if (data.status != 200) {
                console.log("Friend's list is empty!")
                return
            }
            console.log("Friend's list:", data.friends)
            this.friends = data.friends
        })
    }

    listFollowings(): void {
        this.followService.getList(this.currentID, "followings").subscribe((data:any) => {
            if (data.status != 200) {
                console.log("Following's list is empty!")
                return
            }
            console.log("Following's list:", data.followings)
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
        })
    }

    getSuggestionsData(): void {
        this.listUsers()
        this.listFollowers()
        this.listFollowings()
        this.listFriends()
    }

    ngOnInit(): void {
        this.authService.isOnline
        this.listUsers()
        this.getSuggestionsData()
    }
}
