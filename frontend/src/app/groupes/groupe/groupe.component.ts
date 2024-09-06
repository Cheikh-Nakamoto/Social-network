import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DataService } from '../../data.service';
import { AllUsersDTO, CommentContent, CommentDTO, Group, JoinGroupVerification, NotificationVerification, Post, Posts,length } from '../../models/models.compenant';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToolbarComponent } from '../../nav/toolbar/toolbar.component';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogCommentComponent } from '../../dialog-comment/dialog-comment.component';


@Component({
  selector: 'app-groupe',
  standalone: true,
  imports: [CommonModule, MatCardModule, HttpClientModule, ReactiveFormsModule, ToolbarComponent, MatIconModule, MatDividerModule,NgIf,NgFor],
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.component.scss'],
  providers: [DataService, AuthService],

})
export class GroupeComponent implements OnInit, OnDestroy {
  IsIn: JoinGroupVerification = {};
  groups: Group[] = [];
  groupeForm!: FormGroup;
  id !: string;
  clear!: any;
  selectedFile: File | null = null;
  AllUser: AllUsersDTO = {};
  posts: Post[] = [];
  share: number = 0;
  comments: CommentContent = { comments_by_post: {} };
  likemap = [];
  dislikemap = [];
  token = localStorage.getItem('token');
  user: any;
  postAndButton!: Posts;
  comlength : length = {}

  constructor(private fb: FormBuilder, private groupService: DataService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.isOnline();
    this.id = JSON.parse(localStorage.getItem("userID") as string);
    this.clear = setInterval(() => {
      this.joinedgroup()
      this.loadGroups()
    }, 3000);
    console.log("Loading groups...", this.groups);
  }
  ngOnDestroy(): void {
    if (this.clear) {
      clearInterval(this.clear);
      console.log("Interval cleared");
    }
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
    console.log('Adding member', userId, 'to group', groupId, 'with role', role, "target_id :", target_id);
    this.groupService.addMember(groupId, userId, target_id, role).subscribe(
      () => console.log('Member added successfully'),
      (error) => {
        // Vérifiez la condition correctement avec '==='
        if (error.error == "Notification existe : true\n") {
          alert("Votre demande d'adhésion a déjà été envoyée !");
        } else {
          // Gérer d'autres erreurs ici si nécessaire
          console.error('Erreur lors de l\'ajout du membre:', error);
        }
      }
    );
  }

  getAllPosts(): void {
    this.groupService.getData('AllPost').subscribe(
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



  ejectMember(groupId: number, userId: number): void {
    this.groupService.ejectMember(userId, groupId).subscribe(
      () => console.log('Member ejected successfully'),
      (error) => console.error('Error ejecting member:', error)
    );
  }

  deleteGroup(groupId: number): void {
    this.groupService.deleteGroup(groupId).subscribe(
      () => this.groups = this.groups.filter(group => group.id !== groupId),
      (error) => console.error('Error deleting group:', error)
    );
  }

  joinedgroup(): void {
    this.groupService.getGroupJoined().subscribe(res => {
      console.log('Group joined', res);
      this.IsIn = res
    }, (error) => console.error('Error fetching ', error))
  }

  // onLike(targetId: number, targetType: string) {
  //   this.groupService.likeTarget(0, this.id, targetId, targetType, true).subscribe((response) => {
  //     console.log("like response ", response);
  //     this.loadLikes(targetType);
  //     this.loadDislikes(targetType);
  //   });
  // }

  // onDislike(targetId: number, targetType: string) {
  //   this.groupService.dislikeTarget(0, this.id, targetId, targetType, false).subscribe(() => {
  //     this.loadLikes(targetType);
  //     this.loadDislikes(targetType);
  //   });
  // }
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

  private loadUser(targetlink: string) {
    this.groupService.getData(targetlink).subscribe((user: AllUsersDTO) => {
      this.AllUser = user;
      console.log('ici sont les utilisateurs', this.AllUser);
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

  handleClick(route: string, event: Event, id?: number): void {
    event.preventDefault();
    console.log('Button clicked, navigating to:', route);
    if (id) {
      this.router.navigate([route, id]);
      localStorage.setItem('groupid', id.toString());
    } else {
      this.router.navigateByUrl(route);
    }
  }
}
