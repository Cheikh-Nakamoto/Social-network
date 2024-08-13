import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CommentContent, CommentDTO } from '../models/models.compenant';


@Component({
  selector: 'app-dialog-comment',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-comment.component.html',
  styleUrls: ['./dialog-comment.component.scss'],

})
export class DialogCommentComponent  implements OnInit {
  readonly dialog = inject(MatDialog);
  comments : CommentDTO[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data:{post_id:number,comments : CommentDTO[]}) {}

  ngOnInit(): void {
    this.comments = this.data.comments
    console.log(this.comments, "c'est janel")
  }
}
