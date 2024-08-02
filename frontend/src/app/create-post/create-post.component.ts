import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit,ChangeDetectionStrategy,signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import { DataService } from '../data.service';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';


@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,MatCardModule,MatButtonToggleModule, MatCheckboxModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit {
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update(value => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update(value => !value);
  }
  Post!: FormGroup;

  constructor(private postFormBuilder: FormBuilder,private apiservice : DataService) { }

  ngOnInit(): void {
    this.Post = this.postFormBuilder.group({
      title: new FormControl(''),
      content: new FormControl(''),
      image: new FormControl(''),
      categories: new FormControl(''),
      is_public: new FormControl(''),
      about: new FormControl(''),
    });
  }

  onSubmit(): void {
    if (this.Post.valid) {
      this.apiservice.postData('CreatePost', this.Post.value).subscribe((response: any) => {
        console.log(response);
      }, error => {
        console.error('Erreur lors de l\'envoi du post:', error);
      });
      this.Post.reset();
    }
  }
}
