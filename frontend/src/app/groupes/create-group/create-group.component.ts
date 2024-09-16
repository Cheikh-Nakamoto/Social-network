import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ToolbarComponent } from "../../nav/toolbar/toolbar.component";
import { MessageBody, MessageData } from '../../models/models.compenant';
import { WebSocketService } from '../../chat/services/chat.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, ToolbarComponent],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss',
  providers: [DataService, AuthService]
})
export class CreateGroupComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  groupeForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  userID!: string


  constructor(
    private fb: FormBuilder,
    private apiService: DataService,
    private router: Router,
    private authService: AuthService,
    private websocketService: WebSocketService,
    private dialogRef: MatDialogRef<CreateGroupComponent>
  ) { }

  ngOnInit(): void {
    this.authService.isOnline();
    this.userID = localStorage.getItem('userID') as string;
    console.log(this.userID)
    this.groupeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      isPublic: [true, Validators.required],
      owner: [(JSON.parse(this.userID as string)).toString(), Validators.required],
      image: ['', null]
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.groupeForm.valid) {
      const name = this.groupeForm.get('name')?.value
      const description = this.groupeForm.get('description')?.value
      if (name.trim() == "" && name != null || description.trim() == "" && description != null) {
        return
      }

      const formData = new FormData();
      formData.append('name', this.groupeForm.get('name')?.value);
      formData.append('description', this.groupeForm.get('description')?.value);
      formData.append('isPublic', this.groupeForm.get('isPublic')?.value);
      formData.append('owner', this.groupeForm.get('owner')?.value);
      let body = {
        'name': this.groupeForm.get('name')?.value,
        'description': this.groupeForm.get('description')?.value,
        'isPublic': this.groupeForm.get('isPublic')?.value,
        'owner': this.groupeForm.get('owner')?.value,
        "image": ""
      }
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
        this.apiService.uploadImage(formData).subscribe(
          (response) => {
            this.groupeForm.patchValue({ image: response.image });
            body["image"] = response.image
            console.log(body)
            this.apiService.createGroup(body).subscribe(
              (res) => {

                this.closeDialog();
                window.location.reload();
              },
              (error) => {
                console.error('Group creation failed:', error);
              }
            );
          },
          (error) => {
            console.error('Image upload failed:', error);
          }
        );
      } else {
        this.apiService.createGroup(this.groupeForm.value).subscribe(
          (res) => {

            this.closeDialog();
            window.location.reload();
          },
          (error) => {
            console.error('Group creation failed:', error);
          }
        );
      }

      const messBody: MessageBody = {
        senderId: Number(this.userID),
        receiverId: Number(0),
        message: "Nouveau groupe créé avec succès"
      };

      const message: MessageData = {
        type: 'new_group',
        datas: messBody,
      };

      const even = new Events(message.type, message.datas);
      sendEvent(this.websocketService, even);
    }

    this.groupeForm.reset();
    this.closeDialog();
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
