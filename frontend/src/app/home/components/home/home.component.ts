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
import { Post, CommentContent, Posts, CommentDTO } from '../../../models/models.compenant';
import { DialogCommentComponent } from '../../../dialog-comment/dialog-comment.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { User,AllUsersDTO } from '../../../models/models.compenant';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
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
    MatDialogModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DataService]
})
export class HomeComponent implements OnInit {
  id!: number;
  AllUser : AllUsersDTO = {};
  posts: Post[] = [];
  share: number = 0;
  comments: CommentContent = { comments_by_post: {} };
  likemap = [];
  dislikemap = [];
  token = localStorage.getItem('token');
  user: any;
  postAndButton!: Posts;

  constructor(private apiService: DataService) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') as string);
    this.id = this.user.id;
    this.loadUser('allusers');
    this.loadComments();
    this.getAllPosts();
  }

  getAllPosts(): void {
    this.apiService.getData('AllPost').subscribe(
      (response: Post[]) => {
        this.posts = response;
        console.log('ici sont les posts', this.posts);
        this.loadLikes('post');
        this.loadDislikes('post');
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  onLike(targetId: number, targetType: string) {
    this.apiService.likeTarget(0, this.id, targetId, targetType, true).subscribe((response) => {
      console.log("like response ", response);
      this.loadLikes(targetType);
      this.loadDislikes(targetType);
    });
  }

  onDislike(targetId: number, targetType: string) {
    this.apiService.dislikeTarget(0, this.id, targetId, targetType, false).subscribe(() => {
      this.loadLikes(targetType);
      this.loadDislikes(targetType);
    });
  }

  onComment(postId: number, targetType: string, event: Event) {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const content = (target.querySelector('input[name="comment"]') as HTMLInputElement).value;

    if (!content) {
      return;
    }

    const body = {
      id: 0,
      user_id: this.id.toString(),
      target_id: postId,
      content: content,
      target_type: targetType,
    };

    this.apiService.postData('CreateComment', JSON.stringify(body)).subscribe(() => {
      (target.querySelector('input[name="comment"]') as HTMLInputElement).value = '';
      this.loadComments();
    });
    
  }

  private loadComments(): void {
    this.apiService.getData('AllComments').subscribe(
      (comment: { [key: number]: CommentDTO[] }) => {
        this.comments.comments_by_post = comment;
        console.log('ici sont les commentaires', this.comments);
      },
      error => {
        console.error('Erreur lors du chargement des commentaires:', error);
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

  private loadUser(targetlink: string ) {
    this.apiService.getData(targetlink).subscribe((user: AllUsersDTO) => {
      this.AllUser = user;
      console.log('ici sont les utilisateurs', this.AllUser);
      console.log(user);
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
        user : this.AllUser,
        comments: comment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
