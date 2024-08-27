import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  providers: [AuthService]
})
export class MainPageComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.isOnline();
  }

}
