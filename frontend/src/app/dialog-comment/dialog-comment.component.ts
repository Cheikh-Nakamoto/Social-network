import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Comment } from '../models/models.compenant';


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
  comments! : Comment
  constructor(@Inject(MAT_DIALOG_DATA) public data:any) {}

  ngOnInit(): void {
    this.comments = this.data
    console.log(this.comments, "c'est janel")
  }
}
