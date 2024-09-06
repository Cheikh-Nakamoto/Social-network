// create-post.component.ts

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
  redirecte! : string
  groupid!:number

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update(value => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update(value => !value);
  }

  Post!: FormGroup;
  selectedFile!: File;

  constructor(private postFormBuilder: FormBuilder, private apiservice: DataService, private router: Router, private authService: AuthService, private rout: ActivatedRoute) { }

  ngOnInit(): void {
    this.redirecte = "Acceuil"
    this.authService.isOnline();
    let checkhref = location.href.split("/")
    if (checkhref[checkhref.length - 2] == "groups") {
      this.redirecte = "groups"
      this.groupid = Number(checkhref[checkhref.length - 1])
      console.log("ici groupid :",checkhref[checkhref.length - 1])
      this.Post = this.postFormBuilder.group({
        title: new FormControl(''),
        content: new FormControl(''),
        image: new FormControl(''),
        categories: new FormControl(''),
        ispublic: new FormControl(this.isPublic),
        user_id: localStorage.getItem("userID") as string,
        group_id: parseInt(checkhref[checkhref.length - 1],10)
      });
    } else {
      this.Post = this.postFormBuilder.group({
        title: new FormControl(''),
        content: new FormControl(''),
        image: new FormControl(''),
        categories: new FormControl(''),
        ispublic: new FormControl(this.isPublic),
        user_id: localStorage.getItem("userID") as string
      });
    }
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onPrivacyChange(event: any): void {
    if (event.value == "private") {
      this.isPublic = event.value;
    } else {
      this.isPublic = "public"
    }
    console.log(event.value);
  }

  onSubmit(): void {
    if (this.Post.valid) {
      const formData = new FormData();
      formData.append('title', this.Post.get('title')?.value);
      formData.append('content', this.Post.get('content')?.value);
      formData.append('categories', this.Post.get('categories')?.value);
      formData.append('privacy', this.Post.get('ispublic')?.value);
      formData.append('group_id',this.Post.get('group_id')?.value)
      formData.append('file', this.selectedFile);

      let userId = JSON.parse(localStorage.getItem("userID") as string).toString()
      formData.append('user_id', userId);
      if (this.selectedFile) {
        this.apiservice.uploadImage(formData).subscribe(
          response => {
            console.log("imageurl", response);
            this.apiservice.postData('CreatePost', response).subscribe((response: any) => {
              if (this.redirecte != "Accueil"){
                this.router.navigate([this.redirecte,this.groupid])
              }else{
                this.router.navigateByUrl(this.redirecte)
              }
            }, error => {
              console.error('Erreur lors de l\'envoi du post:', error);
            });
          },
          error => {
            console.error('Erreur lors du téléchargement de l\'image:', error);
          }
        );

       
      } else {
        console.log("donne envoyer au api this.postFormBuilder",this.Post.value)
        this.apiservice.postData('CreatePost', this.Post.value).subscribe((response: any) => {
          if (this.redirecte != "Accueil"){
            this.router.navigate([this.redirecte,this.groupid])
          }else{
            this.router.navigateByUrl(this.redirecte)
          }
        }, error => {
          console.error('Erreur lors de l\'envoi du post:', error);
        });
      }
    }
    this.Post.reset();
  }
}
