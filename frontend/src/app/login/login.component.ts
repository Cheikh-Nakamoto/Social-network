import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs'; // Importer MatTabsModule
import { DataService } from '../data.service';
import { responselogin, UserDTO } from '../models/models.compenant';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    MatTabsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [DataService, AuthService]
})
export class LoginComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  age!: number
  selectedFile!: File;
  selectedFileName: string = "";

  loginForm: FormGroup = this.formbuilder.group({
    email: [null, [Validators.required]],
    password: [null, [Validators.required, Validators.minLength(6)]]
  })

  registerForm: FormGroup = this.formbuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required]],
    firstname: [null, [Validators.required]],
    lastname: [null, [Validators.required]],
    date_of_birth: [null, [Validators.required]],
    nickname: [null],
    about_me: [null]
  })
  responselogin!: responselogin;

  constructor(
    private formbuilder: FormBuilder, private apiservice: DataService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.authService.isOnline()
  }

  onlogin() {
    // console.log("ici c'est :", this.loginForm.value);
    // this.apiservice.postData('login', this.loginForm.value).subscribe((response: any) => {
    //   localStorage.setItem("status", response.status)
    //   localStorage.setItem("token", response.token)
    //   localStorage.setItem("user", JSON.stringify(response.user))
    //   alert("Connexion reussi!")

    //   this.redirectToHome()
    // }, error => {
    //   alert("Erreur lors de la connexion")
    //   console.error('Erreur lors de la connexion:', error);
    // });
    if (this.loginForm.invalid) {
      alert('Please fill in the form correctly');
      return;
    }

    this.login(this.loginForm.value).subscribe(() => {
      console.log('Logged in');
      this.router.navigateByUrl('/home').then();
      // this.router.navigate(['/home']);
    })
    console.log('Form submitted');
  }

  login(credentials: { email: string, password: string }) {
    return this.authService.login(credentials).pipe(
      tap((res: any) => {
        console.log("Login response", res);
        if (!res.status || res.status !== 'success') {
          alert(res.message);
          return;
        }
        this.authService.getUser
        localStorage.setItem("token", res.token)
        localStorage.setItem("userID", res.user.id)
        localStorage.setItem("firstname", res.user.firstname)
        localStorage.setItem("lastname", res.user.lastname)

      })
    )
  }

  onregister() {
    const data = { ...this.registerForm.value };
    this.age = this.checkAge(data.date_of_birth);


    if (this.loginForm.get('password')?.value.trim() === '' || this.loginForm.get('password')?.value.trim()) {
      
    }

    if (this.age < 12 || this.age > 120) {
      alert('You must be between 12 and 120 years old to register');
      return;
    }

    if (this.registerForm.invalid) {
      alert('Please fill all the required fields');
      return;
    } else if (this.registerForm.valid) {


      if (this.selectedFile) {
        data.avatar = this.selectedFile;
        let formData = new FormData();
        formData.append('file', this.selectedFile);
        this.apiservice.uploadImage(formData).subscribe((response: any) => {
          console.log("Image uploaded", response);
          data.avatar = response.image;
          console.log("registering...", data);
          this.authService.register(data).subscribe(() => {
            alert("User registered");
            this.tabGroup.selectedIndex = 0; // Définit l'onglet "Login" comme actif
          }, (error) => {
            alert("Erreur lors de l'inscription")
            this.registerForm.reset();
            alert(error);
          });
        });
      } else {
        console.log("registering...", data);
        this.authService.register(data).subscribe(() => {
          console.log("User registered");
          this.tabGroup.selectedIndex = 0; // Définit l'onglet "Login" comme actif
        }, (error) => {
          alert("Erreur lors de l'inscription")
          this.registerForm.reset();
          console.log(error);
        });
      }
    }
  }

  checkAge(data: Date): number {
    return Math.floor(Math.abs(Date.now() - new Date(data).getTime()) / (1000 * 3600 * 24 * 365))
  }

  OnselectedFile() {
    let file = document.getElementById("file-input") as HTMLInputElement;
    file.click();
  }

  onFileChange(event: any): void {
    console.log(event.target.files.length)
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.selectedFileName = this.selectedFile.name;
      console.log('Fichier sélectionné:', this.selectedFileName);
    }
  }

  /*onregister() {
    console.log("ici c'est :", this.registerForm.value);
    this.apiservice.postData('register', this.registerForm.value).subscribe((response: any) => {
      alert("Inscription reussi !")
    }, error => {
      console.error('Erreur lors de l\'inscription:', error);
    });
  }*/

  redirectToHome() {
    this.router.navigate(['/Acceuil']);
  }

  redirectToAbout() {
    this.router.navigate(['/about']);
  }
}


