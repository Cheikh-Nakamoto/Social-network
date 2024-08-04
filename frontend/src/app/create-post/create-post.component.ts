// create-post.component.ts

import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DataService } from '../data.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatCardModule, MatButtonToggleModule, MatCheckboxModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
  providers: [DataService]
})
export class CreatePostComponent implements OnInit {
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  isPublic: string = "public";

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update(value => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update(value => !value);
  }

  Post!: FormGroup;
  selectedFile!: File;

  constructor(private postFormBuilder: FormBuilder, private apiservice: DataService, private router: Router) { }

  ngOnInit(): void {
    this.Post = this.postFormBuilder.group({
      title: new FormControl(''),
      content: new FormControl(''),
      image: new FormControl(''),
      categories: new FormControl(''),
      privacy: new FormControl(this.isPublic),
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onPrivacyChange(event: any): void {
    this.isPublic = event.value;
  }

  onSubmit(): void {
    if (this.Post.valid) {
      const formData = new FormData();
      formData.append('title', this.Post.get('title')?.value);
      formData.append('content', this.Post.get('content')?.value);
      formData.append('categories', this.Post.get('categories')?.value);
      formData.append('privacy', this.Post.get('privacy')?.value);
      formData.append('file', this.selectedFile);

      let user = localStorage.getItem("user") as string
      let userId = JSON.parse(user).id.toString(); // Convert user id to string
      formData.append('user_id', userId);

      this.apiservice.uploadImage(formData).subscribe(
        response => {
          console.log("imageurl", response);
          this.apiservice.postData('CreatePost', response).subscribe((response: any) => {
            this.router.navigateByUrl("Acceuil")
          }, error => {
            console.error('Erreur lors de l\'envoi du post:', error);
          });
        },
        error => {
          console.error('Erreur lors du téléchargement de l\'image:', error);
        }
      );

      this.Post.reset();
    }
  }
}
