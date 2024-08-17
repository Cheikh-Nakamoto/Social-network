import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { Group } from '../../models/models.compenant';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-groupe',
  standalone: true,
  imports: [CommonModule, MatCardModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.component.scss'],
  providers: [DataService],
})
export class GroupeComponent implements OnInit {
  groups: Group[] = [];
  groupeForm!: FormGroup;

  constructor(private fb: FormBuilder, private groupService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.loadGroups().then(() => {
      console.log("Loading groups...", this.groups);
    });
    console.log("Loading groups...", this.groups);
  }

  async loadGroups(): Promise<void> {
    try {
      this.groups = await this.groupService.getGroups().toPromise();
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }

  addMember(groupId: number, userId: number, role: string): void {
    this.groupService.addMember(userId, groupId, role).subscribe(
      () => console.log('Member added successfully'),
      (error) => console.error('Error adding member:', error)
    );
  }
  
  joinGroup(group: Group): void {
    console.log('Joining group:', group.name);
    // Add logic to join the group
  }

  ejectMember(groupId: number, userId: number): void {
    this.groupService.ejectMember(userId, groupId).subscribe(
      () => console.log('Member ejected successfully'),
      (error) => console.error('Error ejecting member:', error)
    );
  }

  deleteGroup(groupId: number): void {
    this.groupService.deleteGroup(groupId).subscribe(
      () => this.groups = this.groups.filter(group => group.id !== groupId),
      (error) => console.error('Error deleting group:', error)
    );
  }

  handleClick(route: string, event: Event): void {
    event.preventDefault();
    console.log('Button clicked, navigating to:', route);
    this.router.navigateByUrl(route);
  }
}
