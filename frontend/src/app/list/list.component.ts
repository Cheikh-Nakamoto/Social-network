import {Component} from '@angular/core';
import {AuthService} from "../service/auth.service";
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    ToolbarComponent,
    HttpClientModule,
    MatCardModule
],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [AuthService]
})
export class ListComponent {
    users!: any[]

    constructor(
        private authService: AuthService,
    ) {}

    listUsers(): void {
        this.authService.getAll().subscribe((data: any) => {
            console.log(data)
        })
    }

    ngOnInit(): void {
        this.listUsers()
    }
}
