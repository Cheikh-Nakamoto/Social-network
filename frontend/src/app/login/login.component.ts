import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs'; // Importer MatTabsModule
import { DataService } from '../data.service';
import { responselogin, UserDTO } from '../models/models.compenant';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { tap } from 'rxjs';
import { error } from 'jquery';
import { UtilService } from '../service/util.service';

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
    email: [null, this.customEmailValidator],
    password: [null, [Validators.required, Validators.minLength(6)]],
    firstname: [null, [Validators.required, Validators.minLength(3)]],
    lastname: [null, [Validators.required, Validators.minLength(2)]],
    date_of_birth: [null, [Validators.required]],
    nickname: [null],
    about_me: [null]
  })
  responselogin!: responselogin;

  constructor(
    private formbuilder: FormBuilder,
    private apiservice: DataService,
    private router: Router,
    private authService: AuthService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.authService.isOnline()
  }

  onlogin() {
    if (this.loginForm.invalid) {
      this.utilService.onSnackBar("Please fill in the form correctly", "error")
      return;
    }

    this.login(this.loginForm.value).subscribe(() => {
      this.router.navigateByUrl('/home').then();
    },(error)=>{
      this.utilService.onSnackBar("Email ou mot de pass incorrect !", "error")
    });
  }

  login(credentials: { email: string, password: string }) {
    return this.authService.login(credentials).pipe(
      tap((res: any) => {
        if (!res.status || res.status !== 'success') {
          this.utilService.onSnackBar(res.message, "error")
          return;
        }
        this.authService.getUser
        localStorage.setItem("token", res.token)
        localStorage.setItem("userID", res.user.id)
        localStorage.setItem("firstname", res.user.firstname)
        localStorage.setItem("lastname", res.user.lastname)
        localStorage.setItem("avatar", res.user.avatar)

      })
    )
  }

  customEmailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(control.value)) {
      return { invalidEmail: true };
    }
    return null;
  }

  checkInput(data: any): boolean {
    let fname = false, lname = false, nick = false, pass = false
    if (data.firstname.trim() != "") {
      fname = true
    }

    if (data.lastname.trim() != "") {
      lname = true
    }

    if (data.nickname != null) {
      if (data.nickname.trim() != "") {
        nick = true
      }
    } else {
      nick = true
    }

    if (data.password.trim() != "") {
      pass = true
    }

    return fname && lname && nick && pass
  }

  onregister() {
    const data = { ...this.registerForm.value };
    this.age = this.checkAge(data.date_of_birth);

    if (this.age < 12 || this.age > 120) {
      this.utilService.onSnackBar('You must be between 12 and 120 years old to register', "error")
      return;
    }
    

    if (this.registerForm.invalid) {
      this.utilService.onSnackBar('Please fill correctly all the required fields', "error")
      return;
    } else if (this.registerForm.valid) {

      if (!this.checkInput(data)) {
        this.utilService.onSnackBar('Please fill correctly all the required fields', "error")
        return
      }

      if (this.selectedFile) {
        data.avatar = this.selectedFile;
        let formData = new FormData();
        formData.append('file', this.selectedFile);
        this.apiservice.uploadImage(formData).subscribe((response: any) => {
          data.avatar = response.image;
          this.authService.register(data).subscribe(() => {
            this.utilService.onSnackBar("User registered", "success")
            this.tabGroup.selectedIndex = 0; // Définit l'onglet "Login" comme actif
          }, (error) => {
            this.utilService.onSnackBar("Erreur lors de l'inscription", "error")
            this.registerForm.reset();
            alert(error);
          });
        });
      } else {
        this.authService.register(data).subscribe(() => {
          this.tabGroup.selectedIndex = 0; // Définit l'onglet "Login" comme actif
        }, (error) => {
          this.utilService.onSnackBar("Erreur lors de l'inscription", "error")
          this.registerForm.reset();
        });
      }
      this.registerForm.reset();
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
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  /*onregister() {
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


