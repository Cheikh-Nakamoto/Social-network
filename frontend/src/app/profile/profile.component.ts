import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";

import {AuthService} from "../../service/auth.service";
import {CommonModule, DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatTabGroup, MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";

import {MatListModule} from "@angular/material/list";
import { FollowService } from '../../service/follow.service';
import { UtilsService } from '../../service/utils.service';
import { User } from '../../entity/user';
import { Post } from '../../entity/post';
import { Group } from '../../entity/group';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';



@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
      HttpClientModule,
        CommonModule,
        RouterLink,
        NgIf,
        MatTabGroup,
        MatTabsModule,
        MatIconModule,
        MatListModule,
        NgForOf,
        ToolbarComponent
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
    providers: [DatePipe,DataService, AuthService,FollowService,UtilsService]
    
})
export class ProfileComponent implements OnInit {
    title: string = 'Profile'
    id!: number
    user: User = new User()
    currentID: number = this.authService.getUserID()!
    userAge: number = 0
    followers!: User[]
    followings!: User[]
    friends!: User[]
    posts!: Post[]
    groups!: Group[]
    followersCount!: any
    followingCount!: any
    friendCount!: any
    message!: string
    

    constructor(
        private authService: AuthService,
        private followService: FollowService,
        private utilsService: UtilsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public datePipe: DatePipe
        
    ) {
    }

    getUser() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.authService.getUser(this.id).subscribe((response: any) => {
            if (response.status !== "success" && response.status !== 200) {
                alert(response.message)
                this.message = response.message
                this.router.navigate(['/']).then()
            }
            response.user.created_at = this.datePipe.transform(response.user.created_at, 'longDate', '', 'en-US')
            response.user.date_of_birth = this.datePipe.transform(response.user.date_of_birth, 'longDate', '', 'en-US')
            this.userAge = this.calculateAge(response.user.date_of_birth)
            this.user = response.user
            this.utilsService.setTitle(`${this.user.firstname} ${this.user.lastname}`)
        })
    }
    isOnline() {
        this.authService.isLoggedIn().subscribe(response => {
            console.log(response)
            // if (response) {
            //     console.log('You are online')
            //     return
            // } else {
            //     console.log('You are offline')
            //     // this.authService.removeSession()
            //     // this.router.navigate(['/login']).then()
            // }
        })
    }

    calculateAge(data: Date): number {
        return Math.floor(Math.abs(Date.now() - new Date(data).getTime()) / (1000 * 3600 * 24 * 365))
    }

    showSection(section: string) {
        let contents = document.querySelectorAll('.content')
        contents.forEach((content) => {
            content.classList.remove('active')
            content.classList.remove('show')
        })

        let selectedContent = document.querySelector(`#${section}`)
        selectedContent?.classList.add('active')
    }

    getFollowers() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.followService.getList(this.id, "followers").subscribe((response: any) => {
            this.followers = response.followers
        })
    }

    getFollowings() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.followService.getList(this.id, "followings").subscribe((response: any) => {
            this.followings = response.followings
        })
    }

    getFriends() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.followService.getList(this.id, "friends").subscribe((response: any) => {
            this.friends = response.friends
        })
    }

    getFollowersCount() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.followService.getCount(this.id, "followers").subscribe((response: any) => {
            this.followersCount = this.followService.calculate(response.count)
        })
    }

    getFollowingsCount() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.followService.getCount(this.id, "followings").subscribe((response: any) => {
            this.followingCount = this.followService.calculate(response.count)
        })
    }

    getFriendsCount() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.followService.getCount(this.id, "friends").subscribe((response: any) => {
            this.friendCount = this.followService.calculate(response.count)
            console.log(this.friendCount)
        })
    }

    onUnfollow(id: any) {
        const data = {
            follower_id: this.currentID,
            followed_id: id
        }

        this.followService.unfollow(data).subscribe(() => {
            this.getFriends()
            this.getFriendsCount()
        })
    }

    onAccept(id: any) {
        this.followService.request(id, 'accept').subscribe(() => {
            this.getFriends()
            this.getFriendsCount()
        })
    }

    onDecline(id: any) {
        this.followService.request(id, 'decline').subscribe(() => {
            this.getFollowers()
            this.getFollowersCount()
        })
    }
    //     getPosts() {
    //     this.id = this.activatedRoute.snapshot.params['id'];
    //     this.authService.getUserPosts(this.id).subscribe((response: any) => {
    //         this.posts = response.posts; // Assigner les posts récupérés
    //     });
    // }
    getPosts() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.authService.getUserPosts(this.id).subscribe(
            (response: any) => {
                this.posts = response
            }
            /*(response: any) => {
                if (response && response.posts) {  // Vérifie que la réponse contient bien les posts
                    this.posts = response.posts;
                } else {
                    console.error("Erreur lors de la récupération des posts: ", response.message || "Pas de posts trouvés");
                }
            },
            (error) => {
                console.error("Erreur lors de la récupération des posts: ", error);
            }*/
        );
    }
    
    

    ngOnInit(): void {
        if (!(this.authService.getToken()as string)) {
            this.router.navigate(['/login']).then()
            alert('You are not logged in')
            return
        }

        this.isOnline()

        this.getFollowers()
        this.getFollowings()
        this.getFriends()
        this.getFollowersCount()
        this.getFollowingsCount()
        this.getFriendsCount()
        this.getUser()
        this.getPosts()
    }
}
