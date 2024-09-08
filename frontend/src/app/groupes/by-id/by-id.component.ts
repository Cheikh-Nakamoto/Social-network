import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DataService } from '../../data.service';
import { AllUsersDTO, CommentContent, CommentDTO, Eventtype, Group, Post, Posts, length } from '../../models/models.compenant';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToolbarComponent } from '../../nav/toolbar/toolbar.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../service/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MainPageComponent } from '../../main-page/main-page.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogCommentComponent } from '../../dialog-comment/dialog-comment.component';
import { SharedserviceComponent } from '../../sharedservice/sharedservice.component';

@Component({
  selector: 'app-by-id',
  standalone: true,
  imports: [ToolbarComponent, RouterLink, CommonModule, MatCardModule, HttpClientModule, ReactiveFormsModule, ToolbarComponent, MatCardModule,
    MatIconModule,
    MatButtonModule, MainPageComponent],
  templateUrl: './by-id.component.html',
  styleUrl: './by-id.component.scss',
  providers: [DataService, AuthService]
})
export class ByIdComponent implements OnInit {
  groups: Group[] = [];
  groupeForm!: FormGroup;
  id !: string;
  groupId!: number;
  clear!: any;
  Events !: Eventtype[]
  AllUser: AllUsersDTO = {};
  selectedFile: File | null = null;
  posts: Post[] = [];
  share: number = 0;
  comments: CommentContent = { comments_by_post: {} };
  likemap = [];
  dislikemap = [];
  token = localStorage.getItem('token');
  user: any;
  storage!: Post;
  comlength: length = {}

  constructor(private fb: FormBuilder, private groupService: DataService, private router: Router, private rout: ActivatedRoute, private authSrvice: AuthService, private shared: SharedserviceComponent) { }

  ngOnInit(): void {
    this.authSrvice.isOnline();
    this.id = JSON.parse(localStorage.getItem("userID") as string);
    this.groupId = this.rout.snapshot.params['id'];
    this.loadUser('users');
    this.loadComments()
    this.getAllPosts(Number(this.groupId))
    this.loadGroups().then(data => {
      this.groups = this.groups.filter(group => group.id == this.groupId);
    })
    this.loadEvents()
    this.shared.sharedData$.subscribe((res: Post) => {
      if (this.storage?.group_id != res?.group_id && res != null){
        this.storage = res
        location.reload()
      }
    })
  }


  async loadGroups(): Promise<void> {
    try {
      let group = await this.groupService.getGroups().toPromise();
      if (group.length != this.groups.length) {
        this.groups = group;
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }

  addMember(groupId: number, userId: string, target_id: string, role: string): void {
    this.groupService.addMember(groupId, userId, target_id, role).subscribe(
      () => alert("Request sended succesfully !"),
      (error) => console.error('Error adding member:', error)
    );
  }

  loadEvents() {
    this.groupService.getData(`events/?groupid=${this.groupId}`).subscribe((res: Eventtype[]) => {
      this.Events = res
      console.log(res)
    })
  }


  // onGoing(targetId: number, targetType: string) {
  //   this.groupService.likeTarget(0, this.id, targetId, targetType, true).subscribe((response) => {
  //     console.log("like response ", response);
  //     this.loadLikes(targetType);
  //     this.loadDislikes(targetType);
  //   });
  // }

  // notGoing(targetId: number, targetType: string) {
  //   this.groupService.dislikeTarget(0, this.id, targetId, targetType, false).subscribe(() => {
  //     this.loadLikes(targetType);
  //     this.loadDislikes(targetType);
  //   });
  // }

  onLike(targetId: number, targetType: string) {
    this.groupService.likeTarget(0, Number(this.id), targetId, targetType, true).subscribe((response) => {
      console.log("like response ", response);
      this.loadLikes(targetType);
      this.loadDislikes(targetType);
    });
  }

  onDislike(targetId: number, targetType: string) {
    this.groupService.dislikeTarget(0, Number(this.id), targetId, targetType, false).subscribe(() => {
      this.loadLikes(targetType);
      this.loadDislikes(targetType);
    });
  }

  getAllPosts(groupID: number): void {
    let rout = `AllPost/groups/?groupid=${groupID}`
    this.groupService.getData(rout).subscribe(
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
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onComment(postId: number, targetType: string, event: Event) {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const content = (target.querySelector('input[name="comment"]') as HTMLInputElement).value;

    if (!content) {
      return;
    }

    const formData = new FormData();
    formData.append('user_id', this.id.toString());
    formData.append('target_id', postId.toString());
    formData.append('content', content);
    formData.append('target_type', targetType);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile); // Ajoutez l'image au formulaire si elle existe
    }

    this.groupService.postData('CreateComment', formData).subscribe(() => {
      (target.querySelector('input[name="comment"]') as HTMLInputElement).value = '';
      this.loadComments();
      this.selectedFile = null; // Réinitialiser après l'envoi
    });
  }

  private loadComments(): void {
    this.groupService.getData('AllComments').subscribe(
      (comment: {
        Comments: { [key: number]: CommentDTO[] }
        CommentsLength: { [key: number]: number }
      }) => {
        this.comments.comments_by_post = comment.Comments;
        this.comlength = comment.CommentsLength
        console.log('ici sont les commentaires', comment);
      },
      error => {
        console.error('Erreur lors du chargement des commentaires:', error);
      }
    );
  }

  private loadLikes(targetType: string) {
    this.groupService.getTargetLikes(targetType).subscribe((likes) => {
      this.likemap = likes;
    });
  }

  private loadDislikes(targetType: string) {
    this.groupService.getTargetDislikes(targetType).subscribe((dislikes) => {
      this.dislikemap = dislikes;
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
        comments: comment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }


  private loadUser(targetlink: string) {
    this.groupService.getData(targetlink).subscribe((user: AllUsersDTO) => {
      this.AllUser = user;
      console.log('ici sont les utilisateurs', this.AllUser);
    });
  }
  handleClick(route: string, event: Event, id?: number): void {
    event.preventDefault();
    if (id) {
      this.router.navigate([route, id]);
    } else {
      this.router.navigateByUrl(route);
    }
  }
}
