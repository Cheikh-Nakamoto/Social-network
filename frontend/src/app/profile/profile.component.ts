import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule, DatePipe, NgForOf, NgIf } from "@angular/common";
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatTabGroup, MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatCard, MatCardActions, MatCardHeader, MatCardContent } from '@angular/material/card';
import { MatListModule } from "@angular/material/list";
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';

import { AllUsersDTO, CommentContent, CommentDTO, length, MessageBody, MessageData } from '../models/models.compenant';
import { DataService } from '../data.service';
import { UtilService } from '../service/util.service';
import { User } from '../../entity/user';
import { Post } from '../../entity/post';
import { Group } from '../../entity/group';
import { FollowService } from '../../service/follow.service';
import { UtilsService } from '../../service/utils.service';
import { AuthService } from "../../service/auth.service";
import { WebSocketService } from '../chat/services/chat.service';
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';
import { HomeComponent } from '../home/components/home/home.component';
import { DialogCommentComponent } from '../dialog-comment/dialog-comment.component';



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
        InputSwitchModule,
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
    providers: [
        DatePipe,
        DataService,
        AuthService,
        FollowService,
        UtilsService,
    ],
})
export class ProfileComponent implements OnInit {
    title: string = 'Profile';
    id!: number;
    isExist!: boolean;
    user: User = new User();
    avatar = '';
    currentID: number = this.authService.getUserID()!;
    userAge: number = 0;
    followers!: User[];
    followings!: User[];
    friends!: User[];
    posts!: Post[];
    groups!: Group[];
    followersCount!: any;
    followingCount!: any;
    friendCount!: any;
    message!: string;
    editMode: boolean = true;
    check!: any;
    formGroup: any;
    nature!: string;
    comments: CommentContent = { comments_by_post: {} };
    likemap = [];
    dislikemap = [];
    comlength: length = {};
    isPublic: boolean = false;
    AllUser: AllUsersDTO = {};

    constructor(
        private authService: AuthService,
        private followService: FollowService,
        private utilsService: UtilsService,
        private activatedRoute: ActivatedRoute,
        private datasevice: DataService,
        private router: Router,
        public datePipe: DatePipe,
        private utilService: UtilService,
        private websocketService: WebSocketService,
        private apiService: DataService
    ) // private listComponent: ListComponent

    { }

    getUser() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.avatar =
            (localStorage.getItem('avatar') as string) == ''
                ? 'profile.jpg'
                : (localStorage.getItem('avatar') as string);

        this.authService.getUser(this.id).subscribe((response: any) => {
            if (response.status !== 'success' && response.status !== 200) {
                this.utilService.onSnackBar(response.message, "warning")
                this.message = response.message;
                this.router.navigate(['/']).then();
                return
            }
            response.user.created_at = this.datePipe.transform(
                response.user.created_at,
                'longDate',
                '',
                'en-US'
            );
            response.user.date_of_birth = this.datePipe.transform(
                response.user.date_of_birth,
                'longDate',
                '',
                'en-US'
            );
            this.userAge = this.calculateAge(response.user.date_of_birth);
            this.user = response.user;

            // Mettre à jour la variable isPublic
            this.isPublic = this.user.is_public;

            // Optionnel : Si vous souhaitez afficher cette information directement
            this.nature = this.isPublic ? 'Public' : 'Private';

            this.utilsService.setTitle(
                `${this.user.firstname} ${this.user.lastname}`
            );
        });
    }

    Nature(user: User) {
        const span = document.getElementById('nature') as HTMLSpanElement;
        if (span == null) {
            return;
        }
        if (user.is_public === true) {
            span.textContent = 'Public';
            this.nature = 'Public';
        } else {
            span.textContent = 'Private';
            this.nature = 'Private';
        }
    }
    isOnline() {
        this.authService.isLoggedIn().subscribe((response) => {
        });
    }

    calculateAge(data: Date): number {
        return Math.floor(
            Math.abs(Date.now() - new Date(data).getTime()) /
            (1000 * 3600 * 24 * 365)
        );
    }

    ChangeProfile() {
        const span = document.getElementById('nature');
        let nature: boolean = true;
        if (span) {
            span.textContent =
                span.textContent === 'Public' ? 'Private' : 'Public';
            nature = span.textContent === 'Public' ? true : false;
        }
        this.datasevice
            .ChangeNatureAccountStatus(this.user.id, nature)
            .subscribe((response: any) => {
                this.getUser();
                const messBody: MessageBody = {
                    senderId: Number(0),
                    receiverId: Number(0),
                    message: `${localStorage.getItem(
                        'firstname'
                    )} ${localStorage.getItem('lastname')} switch nature of profile !`,
                };
                const message: MessageData = {
                    type: 'new_switch',
                    datas: messBody,
                };
                const even = new Events(message.type, message.datas);
                sendEvent(this.websocketService, even);
            });
    }

    showSection(section: string) {
        let contents = document.querySelectorAll('.content');
        contents.forEach((content) => {
            content.classList.remove('active');
            content.classList.remove('show');
        });

        let selectedContent = document.querySelector(`#${section}`);
        selectedContent?.classList.add('active');
    }

    getFollowers() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.followService
            .getList(this.id, 'followers')
            .subscribe((response: any) => {
                if (response.status !== 200) {
                    return;
                }
                this.followers = response.followers;
                if (this.exist(this.followers, this.currentID)) {
                    this.isExist = true;
                } else {
                    this.isExist = false;
                }
            });
    }

    exist(list: User[], id: any): boolean {
        return list.some((user: User) => user.id === id);
    }

    getFollowings() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.followService
            .getList(this.id, 'followings')
            .subscribe((response: any) => {
                this.followings = response.followings;
                if (this.exist(this.followings, this.currentID)) {
                    this.isExist = true;
                } else {
                    this.isExist = false;
                }
            });
    }

    // iCanSee(): boolean {
    //     return this.id === this.currentID || this.isExist || this.isPublic
    // }
    iCanSee(): boolean {
        return this.id == this.currentID || this.isExist || this.isPublic;
    }

    getFriends() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.followService
            .getList(this.id, 'friends')
            .subscribe((response: any) => {
                this.friends = response.friends;
            });
    }

    getFollowersCount() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.followService
            .getCount(this.id, 'followers')
            .subscribe((response: any) => {
                this.followersCount = this.followService.calculate(
                    response.count
                );
            });
    }

    getFollowingsCount() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.followService
            .getCount(this.id, 'followings')
            .subscribe((response: any) => {
                this.followingCount = this.followService.calculate(
                    response.count
                );
            });
    }

    getFriendsCount() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.followService
            .getCount(this.id, 'friends')
            .subscribe((response: any) => {
                this.friendCount = this.followService.calculate(response.count);
            });
    }
    onFollow(id: number) {
        const data = {
            follower_id: this.currentID,
            followee_id: id,
        };

        this.followService.follow(data, 'follow').subscribe((response: any) => {
            this.getFriends();
            this.getFriendsCount();
        });
        location.reload();
    }
    onUnfollow(id: any) {
        const data = {
            follower_id: this.currentID,
            followed_id: id,
        };

        this.followService.unfollow(data).subscribe(() => {
            this.getFriends();
            this.getFriendsCount();
        });
        location.reload();
    }

    // onAccept(id: any) {
    //     this.listComponent.onAccept(id)
    // }
    onAccept(id: number) {
        const data = {
            follower_id: id,
            followee_id: this.currentID,
        };

        this.followService
            .request(data, 'accept')
            .subscribe((response: any) => {
                this.utilService.onSnackBar(response.message, 'info');
                this.getFriends();
                this.getFriendsCount();
            });
        location.reload;
    }
    // onDecline(id: any) {
    //     this.followService.request(id, 'decline').subscribe(() => {
    //         this.getFollowers()
    //         this.getFollowersCount()
    //     })
    // }
    onDecline(id: number) {
        const data = {
            follower_id: id,
            followee_id: this.currentID,
        };

        this.followService
            .request(data, 'decline')
            .subscribe((response: any) => {
                this.getFollowers();
                this.getFollowersCount();
            });
        location.reload;
    }
    private loadLikes(targetType: string) {
        this.apiService.getTargetLikes(targetType).subscribe((likes) => {
            this.likemap = likes;
        });
    }

    private loadDislikes(targetType: string) {
        this.apiService.getTargetDislikes(targetType).subscribe((dislikes) => {
            this.dislikemap = dislikes;
        });
    }

    onLike(targetId: number, targetType: string) {
        this.apiService
            .likeTarget(0, this.id, targetId, targetType, true)
            .subscribe((response) => {
                this.loadLikes(targetType);
                this.loadDislikes(targetType);
            });
    }

    onDislike(targetId: number, targetType: string) {
        this.apiService
            .dislikeTarget(0, this.id, targetId, targetType, false)
            .subscribe(() => {
                this.loadLikes(targetType);
                this.loadDislikes(targetType);
            });
    }
    readonly dialog = inject(MatDialog);

    openDialog(postId: number): void {
        // Récupérer les commentaires pour le post spécifié
        const comment = this.comments.comments_by_post[postId] || [];

        // Ouvrir le dialogue avec les commentaires pour le post
        const dialogRef = this.dialog.open(DialogCommentComponent, {
            data: {
                postId: postId,
                user: this.AllUser,
                comments: comment,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
        });
    }
    private loadComments(): void {
        this.apiService.getData('AllComments').subscribe(
            (comment: {
                Comments: { [key: number]: CommentDTO[] };
                CommentsLength: { [key: number]: number };
            }) => {
                this.comments.comments_by_post = comment.Comments;
                this.comlength = comment.CommentsLength;
            },
            (error) => {
                console.error(
                    'Erreur lors du chargement des commentaires:',
                    error
                );
            }
        );
    }
    selectedFile: File | null = null;

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }
    onComment(postId: number, targetType: string, event: Event) {
        event.preventDefault();

        const target = event.target as HTMLFormElement;
        const content = (
            target.querySelector('input[name="comment"]') as HTMLInputElement
        ).value;

        if (!content) {
            return;
        }

        const formData = new FormData();
        formData.append('user_id', this.id.toString());
        formData.append('target_id', postId.toString());
        formData.append('content', content);
        formData.append('target_type', targetType);

        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        } else {
            formData.append('image', '');
        }
        formData.forEach((value, key) => {
        });

        this.apiService.postData('CreateComment', formData).subscribe(
            () => {
                (
                    target.querySelector(
                        'input[name="comment"]'
                    ) as HTMLInputElement
                ).value = '';
                this.loadComments();
                this.selectedFile = null;
            },
            (error) => {
                console.error("Erreur lors de l'envoi du commentaire:", error);
            }
        );
    }

    getPosts() {
        this.id = this.activatedRoute.snapshot.params['id'];
        this.authService.getUserPosts(this.id).subscribe(
            (response: any) => {
                this.posts = response;
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
        this.id = this.activatedRoute.snapshot.params['id'];
        const updatedUser = {
            firstname: this.user.firstname,
            lastname: this.user.lastname,
            about_me: this.user.about_me,
            nickname: this.user.nickname,
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
                console.error(
                    'Erreur lors de la mise à jour du profil:',
                    error
                );
                alert("Une erreur s'est produite");
            }
        );
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
    }

    getUserData() {
        this.getUser()
        this.currentID = this.authService.getUserID()!

        this.getFollowers()
        this.getFollowings()
    }

    ngOnInit(): void {
        if (!(this.authService.getToken() as string)) {
            this.router.navigate(['/login']).then();
            this.utilService.onSnackBar("You are not logged", "error")
            return;
        }
        this.formGroup = new FormGroup({
            checked: new FormControl<boolean>(false),
        });
        this.currentID = Number(localStorage.getItem('userID') as string);
        this.toggleEditMode()
        this.isOnline()
        this.onUpdateProfile
        this.getPosts()
        if (this.user != null) {
            this.Nature(this.user);
        }

        this.activatedRoute.params.subscribe((params) => {
            this.id = params['id']
            const isExists = this.authService.getUser(this.id)
            if (!isExists) {
                this.router.navigate(['/Accueil']).then();
                return
            }
            this.getUserData()
        })
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
