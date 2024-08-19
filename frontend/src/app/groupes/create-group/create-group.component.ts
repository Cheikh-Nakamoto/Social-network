import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss',
  providers: [DataService] // Ajouter DataService ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son
})
export class CreateGroupComponent {
  groupeForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';


  constructor(private fb: FormBuilder, private apiService: DataService, private router: Router) { }

  ngOnInit(): void {
    let user = localStorage.getItem('user');
    this.groupeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      isPublic: [true, Validators.required],
      owner: [(JSON.parse(user as string).id).toString(), Validators.required],
      image: ['',null]
    });
  }
  onFileSelected(event: any): void {
    console.log("event declanché !!!!!");  // Afficher les informations du fichier sélectionné.  // Afficher les informations du fichier sélectionné.  // Afficher les informations du fichier sélectionné.  // Afficher les informations du fichier sélectionné.  // Afficher les informations du fichier sélectionné.  // Afficher les informations du fichier sélectionné.  // Afficher les informations du fichier sélectionné.  // Afficher les informations du fichier sélectionné.  //
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      console.log(formData);
      this.selectedFile = file;
      this.selectedFileName = file.name;  
    }
  }
  onSubmit(): void {
    if (this.groupeForm.valid) {
      const formData = new FormData();
      formData.append('name', this.groupeForm.get('name')?.value);
      formData.append('description', this.groupeForm.get('description')?.value);
      formData.append('isPublic', this.groupeForm.get('isPublic')?.value);
      formData.append('owner', this.groupeForm.get('owner')?.value);
      if (this.selectedFile) {
        console.log('Image uploaded');
        formData.append('file', this.selectedFile);
      }

      this.apiService.uploadImage(formData).subscribe(
        (response) => {
          // Supposons que la réponse de l'upload d'image contienne l'URL ou l'identifiant de l'image sous 'image'
          this.groupeForm.patchValue({ image: response.image });
      
          // Créez le groupe avec les données du formulaire mises à jour
          this.apiService.createGroup(this.groupeForm.value).subscribe(
            (res) => {
              console.log('Group created successfully');
              this.groupeForm.reset();
              this.router.navigateByUrl('groups');
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
      console.log('Formulaire invalide');
    }
    
  }
}
