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
    followersCount!: number
    followingsCount!: number
    friendsCount!: number
    messages!: string
    size!: number
    currentID: number = this.authService.getUserID()!

    constructor(
        private authService: AuthService,
        private followService: FollowService
    ) {}

    listUsers(): void {
        this.authService.getAll().subscribe((data: any) => {
            this.size = data.users.length
            this.suggestions = data.users.filter((user: any) => user.id !== this.currentID)
        })
    }

    listFollowers(): void {
        this.followService.getList(this.currentID, "").subscribe((data: any) => {
            if (data.status !== 200) {
                this.messages = "No Followers"
                return
            }
            console.log(data)
        })
    }

    followerCount(id: number) {
        return this.followService.getCount(id, "followers").pipe(
            (data: any) => data
        )
    }

    onFollow() {}

    ngOnInit(): void {
        this.authService.isOnline
        
        this.listUsers()
        this.listFollowers()
    }
}
