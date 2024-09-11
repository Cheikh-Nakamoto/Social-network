import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DataService } from '../data.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ToolbarComponent } from "../nav/toolbar/toolbar.component";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageBody, MessageData, Post } from '../models/models.compenant';
import { SharedserviceComponent } from '../sharedservice/sharedservice.component';
import { AlmostPrivateComponent } from './almost-private/almost-private.component';
import { WebSocketService } from '../chat/services/chat.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatCardModule, MatButtonToggleModule, MatCheckboxModule, HttpClientModule, ToolbarComponent, AlmostPrivateComponent, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
  providers: [DataService, AuthService]

})
export class CreatePostComponent implements OnInit {
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  isPublic: string = "public";
  redirecte: string = "Acceuil"
  groupid: number = 0
  username = ""
  avatar: string = ""

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update(value => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update(value => !value);
  }

  Post!: FormGroup;
  selectedFile!: File;
  selectedFileName: string = "";
  isPreviewerVisible: boolean = false;
  UserSelected: number[] = []
  page_group = false;


  constructor(
    private dialogRef: MatDialogRef<CreatePostComponent>,
    private postFormBuilder: FormBuilder, private apiservice: DataService,
    private router: Router, private authService: AuthService,
    private rout: ActivatedRoute, private shared: SharedserviceComponent,
    private dialog: MatDialog,
    private websocketService: WebSocketService
  ) { }

  ngOnInit(): void {

    this.authService.isOnline();
    this.username = localStorage.getItem('firstname') as string
    this.avatar = localStorage.getItem("avatar") as string == "" ? "female.svg" : localStorage.getItem("avatar") as string

    let checkhref = location.href.split("/")
    if (checkhref[checkhref.length - 2] == "groups") {
      this.redirecte = "groups"
      this.page_group = true
      this.groupid = Number(checkhref[checkhref.length - 1])
      this.Post = this.postFormBuilder.group({
        title: new FormControl(''),
        content: new FormControl(''),
        image: new FormControl(''),
        ispublic: new FormControl(this.isPublic),
        user_id: localStorage.getItem("userID") as string,
        group_id: parseInt(checkhref[checkhref.length - 1], 10),

      });
    } else {
      this.groupid = 0
      this.Post = this.postFormBuilder.group({
        title: new FormControl(''),
        content: new FormControl(''),
        image: new FormControl(''),
        ispublic: new FormControl(this.isPublic),
        user_id: localStorage.getItem("userID") as string
      });
    }
    this.shared.sharedData$.subscribe((res: { "almost": number[] }) => {
      if (res?.almost) {
        this.UserSelected = res == null ? [] : res.almost
      }
    })
  }


  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.selectedFileName = this.selectedFile.name;
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
      if (this.Post.get('title')?.value.trim() =='' ||  this.Post.get('content')?.value.trim() == '') {
        alert('Les champs titles et content sont vide')
        return;
      }

      let userId = JSON.parse(localStorage.getItem("userID") as string).toString()
      formData.append('user_id', userId);

      if (this.selectedFile) {
        this.apiservice.uploadImage(formData).subscribe(
          response => {
            response.group_id = Number(response.group_id)
            if (this.UserSelected.length != 0) {
              response["almost"] = this.UserSelected
            }
            this.apiservice.postData('CreatePost', response).subscribe((responses: Post) => {
              this.shared.setData(response)
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
        if (this.UserSelected.length != 0) {
          this.Post.value["almost"] = this.UserSelected
        }
        this.apiservice.postData('CreatePost', this.Post.value).subscribe((response: Post) => {
          this.shared.setData(response)
        }, error => {
          console.error('Erreur lors de l\'envoi du post:', error);
        });
      }
      const messBody : MessageBody = {
        senderId:Number(userId),
        receiverId: Number(0),
        message:"Nouveau post created successfully"
        
      }
      const message: MessageData = {
        type: 'new_post',
        datas: messBody,
      };
      const even = new Events(message.type, message.datas);
      sendEvent(this.websocketService, even);

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
  toggleLabel() {
    this.isPreviewerVisible = !this.isPreviewerVisible;
  }

  SelectUsersView() {
    this.dialog.open(AlmostPrivateComponent, {
      width: "auto"
    });
  }

}



function sendEvent(websocketService: WebSocketService, datas: any) {
  websocketService.sendMessage(datas);
}

class Events {
  type: string;
  payload: any;

  constructor(type: string, payload: any) {
    this.type = type;
    this.payload = payload;
  }
}
