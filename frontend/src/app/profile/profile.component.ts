import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { AuthService } from "../../service/auth.service";
import { CommonModule, DatePipe, NgForOf, NgIf } from "@angular/common";
import { MatTabGroup, MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatCard, MatCardActions, MatCardHeader, MatCardContent } from '@angular/material/card';

import { MatListModule } from "@angular/material/list";
import { FollowService } from '../../service/follow.service';
import { UtilsService } from '../../service/utils.service';
import { User } from '../../entity/user';
import { Post } from '../../entity/post';
import { CommentContent, length } from '../models/models.compenant';
import { Group } from '../../entity/group';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { HomeComponent } from '../home/components/home/home.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilService } from '../service/util.service';



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
        MatCard,
        MatCardActions,
        MatCardHeader,
        MatCardContent,
        NgForOf,
        ToolbarComponent,
        FormsModule,
        FormsModule,
        ToolbarComponent,
        HomeComponent,
        ReactiveFormsModule,
        InputSwitchModule
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
    providers: [DatePipe, DataService, AuthService, FollowService, UtilsService]

})
export class ProfileComponent implements OnInit {
    title: string = 'Profile'
    id!: number
    isExist!: boolean
    user: User = new User()
    avatar = "";
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
    editMode: boolean = true;
    check!: any
    formGroup: any;
    nature !: string
    comments: CommentContent = { comments_by_post: {} };
    likemap = [];
    dislikemap = [];
    comlength: length = {};
    isPublic: boolean = false; 


    constructor(
        private authService: AuthService,
        private followService: FollowService,
        private utilsService: UtilsService,
        private activatedRoute: ActivatedRoute,
        private datasevice: DataService,
        private router: Router,
        public datePipe: DatePipe,
        private utilService: UtilService
        // private listComponent: ListComponent

    ) {
    }

    getUser() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.avatar = localStorage.getItem("avatar") as string == "" ? "female.svg" : localStorage.getItem("avatar") as string

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
            
            // Mettre à jour la variable isPublic
            this.isPublic = this.user.is_public;
            
            // Optionnel : Si vous souhaitez afficher cette information directement
            this.nature = this.isPublic ? "Public" : "Private";
            console.log(this.nature);
            

            this.utilsService.setTitle(`${this.user.firstname} ${this.user.lastname}`)
        })
    }

    Nature(user: User) {
        const span = document.getElementById('nature') as HTMLSpanElement;
        if (span == null){
            return
        }
        if (user.is_public === true) {
            span.textContent = "Public";
            this.nature = "Public";
        } else {
            span.textContent = "Private"
            this.nature = "Private";
        }
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


    ChangeProfile() {
        const span = document.getElementById('nature');
        let nature: boolean = true
        if (span) {
            span.textContent = span.textContent === "Public" ? "Private" : "Public";
            nature = span.textContent === "Public" ? true : false;
        }
        this.datasevice.ChangeNatureAccountStatus(this.user.id, nature).subscribe((response: any) => {
            this.getUser()
        })
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
            if (response.status !== 200) {
                console.log(response.message)
                return
            }
            this.followers = response.followers
            if (this.exist(this.followers, this.currentID)) {
                this.isExist = true
                console.log(this.isExist)
            } else {
                this.isExist = false
                console.log(this.isExist)
            }
            // this.followers.forEach((value:any) => {
            //     if (value.id === this.currentID) {
            //         this.isExist = true
            //         //console.log(this.isExist)
            //         return
            //     } else {
            //         this.isExist = false
            //         //console.log(this.isExist)
            //         return
            //     }
            // })
        })
    }

    exist(list:User[], id: any): boolean {
        return list.some((user:User) => user.id === id)
    }

    getFollowings() {
        this.id = this.activatedRoute.snapshot.params['id']
        this.followService.getList(this.id, "followings").subscribe((response: any) => {
            this.followings = response.followings
            if (this.exist(this.followings, this.currentID)) {
                this.isExist = true
                console.log(this.isExist)
            } else {
                this.isExist = false
                console.log(this.isExist)
            }
        })
    }

    // iCanSee(): boolean {
    //     return this.id === this.currentID || this.isExist || this.isPublic
    // }
    iCanSee(): boolean {
        return this.id == this.currentID || (this.isExist || this.isPublic);
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
        })
    }
    onFollow(id: number) {
        const data = {
            "follower_id": this.currentID,
            "followee_id": id
        }

        this.followService.follow(data, "follow").subscribe((response: any) => {
            this.getFriends()
            this.getFriendsCount()
            
        })
        location.reload()
    }
    onUnfollow(id: any) {
        const data = {
            "follower_id": this.currentID,
            "followed_id": id
        }

        this.followService.unfollow(data).subscribe(() => {
            this.getFriends()
            this.getFriendsCount()
            
        })
        location.reload()
    }

    // onAccept(id: any) {
    //     this.listComponent.onAccept(id)
    // }
    onAccept(id: number) {
        const data = {
            "follower_id": id,
            "followee_id": this.currentID
        }

        this.followService.request(data, "accept").subscribe((response: any) => {
            this.utilService.onSnackBar(response.message, "info")
            this.getFriends()
            this.getFriendsCount()
            
            
        })
        location.reload
    }
    // onDecline(id: any) {
    //     this.followService.request(id, 'decline').subscribe(() => {
    //         this.getFollowers()
    //         this.getFollowersCount()
    //     })
    // }
    onDecline(id: number) {
        const data = {
            "follower_id": id,
            "followee_id": this.currentID
        }

        this.followService.request(data, "decline").subscribe((response: any) => {
            console.log("requeeeee");
            this.getFollowers()
            this.getFollowersCount()
           
        })
        location.reload
    }

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
    onUpdateProfile() {
        this.id = this.activatedRoute.snapshot.params['id']
        const updatedUser = {
            firstname: this.user.firstname,
            lastname: this.user.lastname,
            about_me: this.user.about_me,
            nickname: this.user.nickname
            // avatar: this.user.avatar
        };

        this.authService.updateUserProfile(this.id, updatedUser).subscribe(
            (response: any) => {
                if (response.status === 'success' || response.status === 200) {
                    alert('Profil mis à jour avec succès');
                    this.getUser(); // Rafraîchir les données de l'utilisateur
                } else {
                    alert('Erreur lors de la mise à jour du profil');
                }
            },
            (error: any) => {
                console.error('Erreur lors de la mise à jour du profil:', error);
                alert('Une erreur s\'est produite');
            }
        );
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
    }

    

    

    ngOnInit(): void {
        if (!(this.authService.getToken() as string)) {
            this.router.navigate(['/login']).then()
            alert('You are not logged in')
            return
        }
        this.formGroup = new FormGroup({
            checked: new FormControl<boolean>(false)
        });
        this.currentID= Number(localStorage.getItem('userID')as  string);
        this.toggleEditMode()
        this.isOnline()
        this.getUser()
        this.onUpdateProfile
        this.getFollowers()
        this.getFollowings()
        this.getFriends()
        this.getPosts()
        if (this.user != null) {
            this.Nature(this.user)
        }
    }
    timeAgo(date: Date | string): string {
        const now = new Date();
        const pastDate = new Date(date);
        const difference = now.getTime() - pastDate.getTime();

        const seconds = Math.floor(difference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30); // Approximation
        const years = Math.floor(days / 365); // Approximation

        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''} ago`;
        } else if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
        }
    }
}
