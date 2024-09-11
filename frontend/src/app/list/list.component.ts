import { Component } from '@angular/core';
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
export class ListComponent {
    suggestions: User[] = []
    followers: User[] = []
    messages!: string
    size!: number
    currentID: number = this.authService.getUserID()!

    constructor(
        private authService: AuthService,
        private followService: FollowService,
        private utilService: UtilService
    ) { }

    /* listUsers(): void {
        this.listFollowers()
        this.authService.getAll().subscribe((data: any) => {
            this.size = data.users.length
            let mape : {[key:number] :boolean} = {}
            for (let i = 0; i < data.users.length; i++) {
                for (let j = 0; j < this.followers.length; j++) {
                    if (this.followers[j] !== data.users[i] && !mape.hasOwnProperty(data.users[i].id)) {
                        this.suggestions.push(data.users[i]);
                        mape[data.users[i].id] = true
                    }
                }
            }
        })
    } */

    listUsers(): void {
        this.authService.getAll().subscribe((data: any) => {
            this.suggestions = data.users.filter((user:any) => user.id !== this.currentID)
        })
    }

    listFollowers(): void {
        this.followService.getList(this.currentID, "followers").subscribe((data: any) => {
            console.log(data)
            if (data.status !== 200) {
                this.messages = "No Followers"
                console.log("Follower's list is empty")
                return
            }
            console.log("Follower's list:", data)
            this.followers = data.followers
        })
    }

    onFollow(id: number) {
        const data = {
            "follower_id": this.currentID,
            "followee_id": id
        }

        this.followService.follow(data, "follow").subscribe((response: any) => {
            this.utilService.onSnackBar(response.message, "info")
            this.listUsers()
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

    ngOnInit(): void {
        this.authService.isOnline
        this.listUsers()
        this.listFollowers()
    }
}
