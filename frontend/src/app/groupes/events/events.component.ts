import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../data.service';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from "../../nav/toolbar/toolbar.component";

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, ToolbarComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  providers: [DataService, AuthService]
})
export class EventsComponent implements OnInit {
  groupeForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';

  constructor(private fb: FormBuilder, private apiService: DataService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.isOnline();

    let userID = localStorage.getItem('userID');

    this.groupeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      owner: [userID, Validators.required],
      image: ['', null],
      groupid: [parseInt(localStorage.getItem('groupid') as string, 10)],
      isPublic: [true, Validators.required] // Ajout de la propriété isPublic
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
   

      this.selectedFileName = file.name;
    }
  }

  onSubmit(): void {
    let groupid = parseInt(localStorage.getItem('groupid')as string);
    if (this.groupeForm.valid) {
      const formData = new FormData();
      formData.append('name', this.groupeForm.get('name')?.value);
      formData.append('description', this.groupeForm.get('description')?.value);
      formData.append('isPublic', this.groupeForm.get('isPublic')?.value);
      formData.append('owner', this.groupeForm.get('owner')?.value);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
        this.apiService.uploadImage(formData).subscribe(
          (response) => {
            console.log(response.image)
            this.groupeForm.patchValue({ image: response.image });
            console.log('Image téléchargée avec succès',this.groupeForm.value);
            this.apiService.createEvent(this.groupeForm.value).subscribe(
              (res) => {
                console.log('Groupe créé avec succès');
                this.groupeForm.reset();
                this.router.navigate([`/groups/${groupid}`]);
              },
              (error) => {
                alert(`Échec de la création de l'evenement`);
              }
            );
          },
          (error) => {
            console.error('Échec du téléchargement de l\'image:', error);
          }
        );
      }else{
        this.apiService.createEvent(this.groupeForm.value).subscribe(
          (res) => {
            console.log('Groupe créé avec succès');
            this.groupeForm.reset();
            this.router.navigate([`/groups/${groupid}`]);
          },
          (error) => {
            alert(`Échec de la création de l'evenement`);
          }
        );
      }
    } else {
      console.log('Formulaire invalide');
    }
  }
}
