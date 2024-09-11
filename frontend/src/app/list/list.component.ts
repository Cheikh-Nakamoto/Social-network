import {Component} from '@angular/core';
import {AuthService} from "../service/auth.service";
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../entity/user';
import { NgForOf, NgIf } from '@angular/common';
import { FollowService } from '../service/follow.service';

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
        private followService: FollowService
    ) {}

    listUsers(): void {
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
    }

    listFollowers(): void {
        this.followService.getList(this.currentID, "friends").subscribe((data: any) => {
            if (data.status !== 200) {
                this.messages = "No Followers"
                return
            }
            console.log("Follower's list:", data)
            this.followers = data.friends
        })
    }

    onFollow(id:number) {
        const data = {
            "follower_id": this.currentID,
            "followee_id": id
        }
        
        console.log(this.currentID, "Follows", id)
        console.log(data)

        this.followService.follow(data, "follow").subscribe((response:any) => {
            console.log(response)
        })
    }

    ngOnInit(): void {
        this.authService.isOnline
        this.listUsers()
    }
}
