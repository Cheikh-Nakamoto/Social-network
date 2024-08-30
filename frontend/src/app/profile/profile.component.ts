import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from "../nav/toolbar/toolbar.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HttpClientModule, ToolbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers:[AuthService]
})
export class ProfileComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.isOnline();
  }
  
}
