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
    MatDividerModule,
    NgForOf,
    NgIf
],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [AuthService]
})
export class ListComponent {
    suggestions: User[] = []
    followers: User[] = []
    size!: number
    currentID: number = this.authService.getUserID()!

    constructor(
        private authService: AuthService,
    ) {}

    listUsers(): void {
        this.authService.getAll().subscribe((data: any) => {
            this.size = data.users.length
            console.log("ORiginal", data.users)
            this.suggestions = data.users.filter((user: any) => user.id !== this.currentID)
        })
    }

    ngOnInit(): void {
        this.authService.isOnline
        
        this.listUsers()
    }
}
