import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from '../create-post/create-post.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  providers: [AuthService]
})
export class MainPageComponent implements OnInit {

  avatar: string = ""

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.authService.isOnline();
    this.avatar = localStorage.getItem("avatar") as string == "" ? "profile.jpg" : localStorage.getItem("avatar") as string
  }
  
  openCreatePostDialog() {
    this.dialog.open(CreatePostComponent, {
      width: "auto"
    });
  }
}
