import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataService } from '../../data.service';
import { Group } from '../../models/models.compenant';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groupe',
  standalone: true,
  imports: [CommonModule, MatCardModule,HttpClientModule],
  templateUrl: './groupe.component.html',
  styleUrl: './groupe.component.scss',
  providers: [DataService] // Ajouter DataService ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données.  // Ajouter ici, pour utiliser son service de données
})
export class GroupeComponent {
  groups: Group[] = [];

  constructor(private groupService: DataService,private router : Router) { }

  ngOnInit(): void {
    this.groupService.getGroups().subscribe(
      (data) => {
        this.groups = data;
      },
      (error) => {
        console.error('Error fetching groups', error);
      }
    );
  }

  handleClick(route: string, event: Event) {
    event.preventDefault();
    console.log('Button clicked, navigating to:', route);
    this.router.navigateByUrl(route);
  }
}
