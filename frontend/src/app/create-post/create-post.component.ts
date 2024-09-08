import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DataService } from '../data.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ToolbarComponent } from "../nav/toolbar/toolbar.component";
import { group } from '@angular/animations';

import { MatDialogRef } from '@angular/material/dialog';
import { Post } from '../models/models.compenant';
import { SharedserviceComponent } from '../sharedservice/sharedservice.component';
@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatCardModule, MatButtonToggleModule, MatCheckboxModule, HttpClientModule, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
  providers: [DataService, AuthService]

})
export class CreatePostComponent implements OnInit {
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  isPublic: string = "public";
  redirecte!: string
  groupid!: number

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update(value => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update(value => !value);
  }

  Post!: FormGroup;
  selectedFile!: File;

  constructor(private dialogRef: MatDialogRef<CreatePostComponent>, private postFormBuilder: FormBuilder, private apiservice: DataService, private router: Router, private authService: AuthService, private rout: ActivatedRoute,private shared : SharedserviceComponent) { }

  ngOnInit(): void {
    this.redirecte = "Acceuil"
    this.authService.isOnline();
    let checkhref = location.href.split("/")
    console.log(checkhref)
    if (checkhref[checkhref.length - 2] == "groups") {
      this.redirecte = "groups"
      this.groupid = Number(checkhref[checkhref.length - 1])
      console.log("ici groupid :", checkhref[checkhref.length - 1])
      this.Post = this.postFormBuilder.group({
        title: new FormControl(''),
        content: new FormControl(''),
        image: new FormControl(''),
        ispublic: new FormControl(this.isPublic),
        user_id: localStorage.getItem("userID") as string,
        group_id: parseInt(checkhref[checkhref.length - 1], 10)
      });
    } else {
      this.Post = this.postFormBuilder.group({
        title: new FormControl(''),
        content: new FormControl(''),
        image: new FormControl(''),
        ispublic: new FormControl(this.isPublic),
        user_id: localStorage.getItem("userID") as string
      });
    }
  }

  onFileChange(event: any): void {
    console.log(event.target.files.length)
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.Post.valid) {
      const formData = new FormData();
      formData.append('title', this.Post.get('title')?.value);
      formData.append('content', this.Post.get('content')?.value);
      formData.append('privacy', this.Post.get('ispublic')?.value);
      formData.append('group_id', this.Post.get('group_id')?.value)
      formData.append('file', this.selectedFile);

      let userId = JSON.parse(localStorage.getItem("userID") as string).toString()
      formData.append('user_id', userId);

      if (this.selectedFile) {
        this.apiservice.uploadImage(formData).subscribe(
          response => {
            this.apiservice.postData('CreatePost', response).subscribe((responses: Post) => {
              console.log("ceci est la reponse ", responses)
              localStorage.setItem("post", JSON.stringify(responses))
            }, error => {
              alert('Erreur lors de l\'envoi du post:')
              console.error('Erreur lors de l\'envoi du post:', error);
            });
          },
          error => {
            console.error('Erreur lors du téléchargement de l\'image:', error);
          }
        );
      } else {
        console.log("donne envoyer au api this.postFormBuilder", this.Post.value)
        this.apiservice.postData('CreatePost', this.Post.value).subscribe((response: Post) => {
          localStorage.setItem("post", JSON.stringify(response))
          this.shared.setData(response)
        }, error => {
          console.error('Erreur lors de l\'envoi du post:', error);
        });
      }
    }
    this.Post.reset();
    this.closeDialog()
  }
  closeDialog() {
    this.dialogRef.close();
  }

  SelectImage() {
    let fileinput = document.getElementById("imageclick")
    fileinput?.click()
  }

  SelectUsersView() {
    console.log("selecte user !!")
  }
}

