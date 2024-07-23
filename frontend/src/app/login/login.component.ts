import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms'


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // Corriger 'styleUrl' en 'styleUrls'
})

export class LoginComponent implements OnInit{
  loginForm ! : FormGroup;
  constructor(private formbuilder : FormBuilder) {
  }
  ngOnInit() {
    this.loginForm = this.formbuilder.group({
      username : [null],
      password : [null]
    });
  }

  onlogin(){
    //this.apiservice.postData('/login',this.loginForm.value)
    console.log(this.loginForm.value,'        ');
  }

}
