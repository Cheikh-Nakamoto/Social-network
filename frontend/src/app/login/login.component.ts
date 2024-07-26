import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { HttpClientModule } from '@angular/common/http';
import { UserDTO } from '../models/models.compenant';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [DataService]
})
export class LoginComponent implements OnInit {
  loginForm !: FormGroup;
  user: UserDTO={
    firstname : "madiambal",
    lastname : "diagne",
    email : "madiambal@gmail.com",
    password : "123456",
    date_of_birth : "1990-02-15",
    nickname : "madiambal",
    about_me : "madiambal est un développeur web passionné par les nouvelles technologies",
    is_public : true,
    created_at : "2022-02-15 11:20:30",
    id: 1, // Add this line
    avatar: "", // Add this line
    updated_at: "" // Add this line
  }
  constructor(private formbuilder: FormBuilder, private apiservice: DataService) { }
  ngOnInit() {
    this.loginForm = this.formbuilder.group({
      username: [null],
      password: [null]
    });
    // Initialisation de l'objet user
  }
  onlogin() {
    console.log("ici c'est :",this.user)
    this.apiservice.postData('/register', this.user).subscribe((response:any) => {
      console.log(response);
    }, error => {
      console.error('Erreur lors de la connexion:', error);
    });
  }
}
