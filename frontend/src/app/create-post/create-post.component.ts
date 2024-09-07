// create-post.component.ts
import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
  providers: []
})
export class CreatePostComponent {
  constructor(
    private dialogRef: MatDialogRef<CreatePostComponent>
  ) {}
  
  closeDialog() {
    this.dialogRef.close();
  }
}
