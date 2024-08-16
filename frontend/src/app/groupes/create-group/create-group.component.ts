import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss',
  providers: [DataService] // Ajouter DataService ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son
})
export class CreateGroupComponent {
  groupeForm!: FormGroup;

  constructor(private fb: FormBuilder,private apiService : DataService,private router : Router) {}

  ngOnInit(): void {
    let user = localStorage.getItem('user');
    this.groupeForm = this.fb.group({
      name : ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      isPublic: [true, Validators.required],
      owner: [(JSON.parse(user as string).id).toString(), Validators.required]  // Ajouter userId pour spécifier l'utilisateur qui crée le groupe.  // Ajouter userId pour spécifier l'utilisateur qui crée le groupe.  // Ajouter userId pour spécifier l'utilisateur qui crée le groupe.  // Ajouter userId pour spécifier l'utilisateur qui crée le groupe.  // Ajouter userId pour spécifier l'utilisateur qui crée le groupe.
    });
  }

  onSubmit(): void {
    if (this.groupeForm.valid) {
     this.apiService.createGroup(this.groupeForm.value).subscribe(res => {
       console.log('Group created successfully');
       this.groupeForm.reset();
     });
    } else {
      console.log('Formulaire invalide');
    }
this.router.navigateByUrl('groups');
  }
}
