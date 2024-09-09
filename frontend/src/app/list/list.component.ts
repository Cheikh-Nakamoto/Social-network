import {Component} from '@angular/core';
import {AuthService} from "../service/auth.service";
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ToolbarComponent],
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
        console.log("I am here")
    }
}
