import { Component, OnInit, inject } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../../data.service';
import { Post, CommentContent, Posts, CommentDTO, length } from '../../../models/models.compenant';
import { DialogCommentComponent } from '../../../dialog-comment/dialog-comment.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { User, AllUsersDTO } from '../../../models/models.compenant';
import { AuthService } from '../../../service/auth.service';
import { MainPageComponent } from "../../../main-page/main-page.component";
import { CommonModule } from '@angular/common'
import { SharedserviceComponent } from '../../../sharedservice/sharedservice.component';
import { WebSocketService } from '../../../chat/services/chat.service';
import { Subscription } from 'rxjs';
import { GetUserService } from '../../../data.service';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        MatSidenavContainer,
        MatSidenav,
        MatListModule,
        RouterLink,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NgOptimizedImage,
        NgForOf,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        HttpClientModule,
        MatDialogModule,
        MainPageComponent,
        MatCardModule,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [DataService, AuthService],
})
export class HomeComponent implements OnInit {
    private messagesSubscription!: Subscription;
    id!: number;
    AllUser: AllUsersDTO = {};
    posts: Post[] = [];
    share: number = 0;
    comments: CommentContent = { comments_by_post: {} };
    likemap = [];
    dislikemap = [];
    token = localStorage.getItem('token');
    user: any;
    postAndButton!: Posts;
    comlength: length = {};
    storage!: Post;
    avatar: string = "";
    
   
    constructor(
        private apiService: DataService,
        private authService: AuthService,
        private shared: SharedserviceComponent,
        private websocketService: WebSocketService,
        private userService: GetUserService
    ) { }

    ngOnInit(): void {
        this.authService.isOnline();
        this.id = JSON.parse(localStorage.getItem('userID') as string);
        this.storage =
            localStorage.getItem('post') == null
                ? {}
                : JSON.parse(localStorage.getItem('post') as string);
        this.loadUser('users');
        this.loadComments();
        this.getAllPosts();
         this.websocketService.connect();

        this.messagesSubscription = this.websocketService.messages$.subscribe(
            (message) => {
                if (
                    message.type === 'new_post' &&
                    message.payload.messageId == 0 &&
                    Number(message.payload.senderId) != Number(this.id)
                ) {
                    this.loadUser('users');
                    this.loadComments();
                    this.getAllPosts();
                }

            }
        );
        this.shared.sharedData$.subscribe((res: Post) => {
            if (this.storage?.user_id != res?.user_id && res != null) {
                this.storage = res;
                location.reload();
            }
        });
    }

    getAllPosts(): void {
        this.apiService.getData(`AllPost?user_id=${this.id}`).subscribe(
            (response: Post[]) => {
                this.posts = response;
                this.loadLikes('post');
                this.loadDislikes('post');
            },
            (error) => {
                console.error('Error fetching posts:', error);
            }
        );
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

        if (!content || content.trim() == "") {
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

        // Ajoutez ceci pour vérifier le contenu de formData
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

    private loadUser(targetlink: string) {
        this.apiService.getData(targetlink).subscribe((user: AllUsersDTO) => {
            this.AllUser = user;
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
}
