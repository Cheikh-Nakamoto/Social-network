import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DataService } from '../../data.service';
import { Group } from '../../models/models.compenant';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolbarComponent } from '../../nav/toolbar/toolbar.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-by-id',
  standalone: true,
  imports: [ToolbarComponent, CommonModule, MatCardModule, HttpClientModule, ReactiveFormsModule, ToolbarComponent],
  templateUrl: './by-id.component.html',
  styleUrl: './by-id.component.scss',
  providers: [DataService,AuthService]
})
export class ByIdComponent implements OnInit {
  groups: Group[] = [];
  groupeForm!: FormGroup;
  id !: string;
  groupId!: number;
  clear!: any;

  constructor(private fb: FormBuilder, private groupService: DataService, private router: Router, private rout: ActivatedRoute, private authSrvice: AuthService) { }

  ngOnInit(): void {
    this.authSrvice.isOnline();

    let user = JSON.parse(localStorage.getItem("user") as string);
    this.id = user.id;
    this.groupId = this.rout.snapshot.params['id'];
    this.loadGroups().then(data => {
      console.log("Loading groups...", this.groups);
      this.groups = this.groups.filter(group => group.id == this.groupId);
      console.log("Loading groups...", this.groups);
    })
  }


  async loadGroups(): Promise<void> {
    try {
      let group = await this.groupService.getGroups().toPromise();

      if (group.length != this.groups.length) {
        this.groups = group;
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }

  addMember(groupId: number, userId: string, role: string): void {
    console.log('Adding member', userId, 'to group', groupId, 'with role', role);
    this.groupService.addMember(groupId, userId, role).subscribe(
      () => console.log('Member added successfully'),
      (error) => console.error('Error adding member:', error)
    );
  }

  ejectMember(groupId: number, userId: number): void {
    this.groupService.ejectMember(userId, groupId).subscribe(
      () => console.log('Member ejected successfully'),
      (error) => console.error('Error ejecting member:', error)
    );
  }
  Getgroupbyid(route: string, groupId: number) {

  }
  deleteGroup(groupId: number): void {
    this.groupService.deleteGroup(groupId).subscribe(
      () => this.groups = this.groups.filter(group => group.id !== groupId),
      (error) => console.error('Error deleting group:', error)
    );
  }

  handleClick(route: string, event: Event, id?: number): void {
    event.preventDefault();
    console.log('Button clicked, navigating to:', route);
    if (id) {
      this.router.navigate([route, id]);
    } else {
      this.router.navigateByUrl(route);
    }
  }
}
