import { Post } from './../../../models/models.compenant';
import { Component, OnInit } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { JsonPipe, NgForOf, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http'; // Importez HttpClientModule
import { DataService } from '../../../data.service';
import { Posts } from '../../../models/models.compenant';

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
    MatButton,
    NgOptimizedImage,
    NgForOf,
    MatIconButton,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    HttpClientModule // Ajoutez HttpClientModule ici
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DataService]
})
export class HomeComponent implements OnInit {
  id !: number
  posts: Post[] = []
  share : number=0

  comment : number=0

  likemap = []
  dislikemap = []


  user: any;
  PostandButton !: Posts
  constructor(private apiservice: DataService) { }


  ngOnInit(): void {
     this.user = JSON.parse(localStorage.getItem("user") as string)
    this.id = this.user.id;
    this.getAllPosts();

  }

  getAllPosts(): void {
    this.apiservice.getData("AllPost").subscribe(
      (response: Post[]) => { // Typage de la réponse comme un tableau de Post
        this.posts = response; // Assignez la réponse à la variable posts
        console.log("ici sont les post", this.posts);
        this.loadLikes("post");
        this.loadDislikes("post");
      },
      error => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  onLike(targetId: number, targetType: string) {
    this.apiservice.likeTarget(0, this.id, targetId, targetType, true).subscribe((response) => {
      console.log(response)
      this.loadLikes(targetType);
      this.loadDislikes(targetType); // Optionnel, si vous voulez mettre à jour aussi les dislikes
    });
  }

  onDislike(targetId: number, targetType: string) {
    this.apiservice.dislikeTarget(0, this.id, targetId, targetType, false).subscribe(() => {
      this.loadLikes(targetType);
      this.loadDislikes(targetType); // Optionnel, si vous voulez mettre à jour aussi les likes
    });
  }

  onComment(postId: number,targetType: string, event: Event) {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const content = (target.querySelector('input[name="comment"]') as HTMLInputElement).value;

    if (!content) {
        return;
    }

    let body = {
      id: 0,
      user_id: this.id.toString(),
      target_id: postId,
      content: content,
      target_type: targetType,
    };

    this.apiservice.postData("CreateComment", JSON.stringify(body)).subscribe(response => {
      console.log(response);
      // Clear the input field after posting the comment
      (target.querySelector('input[name="comment"]') as HTMLInputElement).value = '';
    });
}


  private loadLikes(targetType : string) {
    this.apiservice.getTargetLikes(targetType).subscribe(likes => {
      this.likemap = likes;
    });
  }

  private loadDislikes(targetType : string) {
    this.apiservice.getTargetDislikes(targetType).subscribe(dislikes => {
      this.dislikemap = dislikes;
    });
  }

}
