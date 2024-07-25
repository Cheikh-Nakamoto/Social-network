import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule} from '@angular/forms'
import {Observable} from "rxjs";
import {logindata} from "../models/models.compenant";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  loginForm ! : FormGroup;
  loginformview !: Observable<logindata>
  constructor(private formbuilder : FormBuilder) {
  }
  ngOnInit() {
    this.loginForm = this.formbuilder.group({
      username : [null],
      password : [null]
    });
    this.loginformview = this.loginForm.valueChanges;
  }

  onlogin(){
    console.log(this.loginForm.value);
  }

}
