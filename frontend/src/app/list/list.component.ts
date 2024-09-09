import {Component} from '@angular/core';
import {AuthService} from "../service/auth.service";
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../entity/user';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    ToolbarComponent,
    HttpClientModule,
    MatCardModule,
    RouterLink,
    MatDividerModule, NgForOf,NgIf
],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [AuthService]
})
export class ListComponent {
    users: User[] = []

    constructor(
        private authService: AuthService,
    ) {}

    listUsers(): void {
        this.authService.getAll().subscribe((data: any) => {
            console.log(data.users)
            // this.users = data.users.filter((user: User) => user.id !== this.authService.getUserID())
            // console.log(this.users)
        })
    }

    ngOnInit(): void {
        this.authService.isOnline
        
        this.listUsers()
    }
}
