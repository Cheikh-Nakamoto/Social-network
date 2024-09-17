import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AllUsersDTO, CommentDTO } from '../models/models.compenant';
import { AuthService } from '../service/auth.service';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-dialog-comment',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-comment.component.html',
  styleUrls: ['./dialog-comment.component.scss'],
  providers: [AuthService]

})
export class DialogCommentComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  comments: CommentDTO[] = [];
  user!: AllUsersDTO;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { post_id: number, user: AllUsersDTO, comments: CommentDTO[] },
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.comments = this.data.comments
    this.user = this.data.user;
  }

  getImageUrl(comment: CommentDTO): string | null {
    const imagePath = comment.image?.startsWith('./public/')
      ? comment.image.replace('./public/', 'public/') : comment.image;

    return imagePath ? `http://localhost:8080/${imagePath}` : null;
  }
  timeAgo(date: Date | string): string {
    const now = new Date();
    const pastDate = new Date(date);
    const difference = now.getTime() - pastDate.getTime();

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

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
