import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs'; // Importer MatTabsModule
import { DataService } from '../data.service';
import { responselogin, UserDTO } from '../models/models.compenant';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    MatTabsModule, // Ajouter MatTabsModule ici
     // Ajouter  ici
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [DataService]
})
export class LoginComponent implements OnInit {
  loginForm !: FormGroup;
  registerForm!: FormGroup;
  // Initialisation de l'objet user
  responselogin!:responselogin;

  constructor(private formbuilder: FormBuilder, private apiservice: DataService) { }

  ngOnInit() {
    this.loginForm = this.formbuilder.group({
      username: [null],
      password: [null]
    });
    this.registerForm = this.formbuilder.group({
      email: [null],
      password: [null],
      firstname: [null],
      lastname: [null],
      date_of_birth: [null],
      avatar: [null],
      nickname: [null],
      about_me: [null],
      is_public: [null]
    }

    )
    // Initialisation de l'objet user
  }

  onlogin() {
    console.log("ici c'est :", this.loginForm.value);
    this.apiservice.postData('login', this.loginForm.value).subscribe((response: any) => {
      localStorage.setItem("status",response.status)
      localStorage.setItem("token",response.token)
      localStorage.setItem("user",JSON.stringify(response.user))
      alert("Connexion reussi!")
    }, error => {
      alert("Erreur lors de la connexion")
      console.error('Erreur lors de la connexion:', error);
    });
  }

  onregister(){
    console.log("ici c'est :", this.registerForm.value);
    this.apiservice.postData('register', this.registerForm.value).subscribe((response: any) => {
     alert("Inscription reussi !")
    }, error => {
      console.error('Erreur lors de l\'inscription:', error);
    });
  }
}


