import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DataService } from '../../data.service';
import { AllUsersDTO, Eventtype, Group } from '../../models/models.compenant';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToolbarComponent } from '../../nav/toolbar/toolbar.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../service/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-by-id',
  standalone: true,
  imports: [ToolbarComponent, RouterLink, CommonModule, MatCardModule, HttpClientModule, ReactiveFormsModule, ToolbarComponent, MatCardModule,
    MatIconModule,
    MatButtonModule,],
  templateUrl: './by-id.component.html',
  styleUrl: './by-id.component.scss',
  providers: [DataService, AuthService]
})
export class ByIdComponent implements OnInit {
  groups: Group[] = [];
  groupeForm!: FormGroup;
  id !: string;
  public groupId!: number;
  clear!: any;
  Events !: Eventtype[]
  AllUser: AllUsersDTO = {};

  constructor(private fb: FormBuilder, private groupService: DataService, private router: Router, private rout: ActivatedRoute, private authSrvice: AuthService) { }

  ngOnInit(): void {
    this.authSrvice.isOnline();
    this.id = JSON.parse(localStorage.getItem("userID") as string);
    this.groupId = this.rout.snapshot.params['id'];
    this.loadUser('users');
    this.loadGroups().then(data => {
      this.groups = this.groups.filter(group => group.id == this.groupId);
    })
    this.loadEvents()
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

  addMember(groupId: number, userId: string, target_id: string, role: string): void {
    this.groupService.addMember(groupId, userId, target_id, role).subscribe(
      () => alert("Request sended succesfully !"),
      (error) => console.error('Error adding member:', error)
    );
  }

  ejectMember(groupId: number, userId: number): void {
    this.groupService.ejectMember(userId, groupId).subscribe(
      () => console.log('Member ejected successfully'),
      (error) => console.error('Error ejecting member:', error)
    );
  }

  deleteMember(groupId: number): void {
    this.groupService.deleteGroup(groupId).subscribe(
      () => this.groups = this.groups.filter(group => group.id !== groupId),
      (error) => console.error('Error deleting group:', error)
    );
  }

  loadEvents() {
    this.groupService.getData(`events/?groupid=${this.groupId}`).subscribe((res: Eventtype[]) => {
      this.Events = res
    })
  }


  // onGoing(targetId: number, targetType: string) {
  //   this.groupService.likeTarget(0, this.id, targetId, targetType, true).subscribe((response) => {
  //     console.log("like response ", response);
  //     this.loadLikes(targetType);
  //     this.loadDislikes(targetType);
  //   });
  // }

  // notGoing(targetId: number, targetType: string) {
  //   this.groupService.dislikeTarget(0, this.id, targetId, targetType, false).subscribe(() => {
  //     this.loadLikes(targetType);
  //     this.loadDislikes(targetType);
  //   });
  // }


  // private loadLikes(targetType: string) {
  //   this.groupService.getTargetLikes(targetType).subscribe((likes) => {
  //     this.likemap = likes;
  //   });
  // }

  // private loadDislikes(targetType: string) {
  //   this.groupService.getTargetDislikes(targetType).subscribe((dislikes) => {
  //     this.dislikemap = dislikes;
  //   });
  // }


  private loadUser(targetlink: string) {
    this.groupService.getData(targetlink).subscribe((user: AllUsersDTO) => {
      this.AllUser = user;
    });
  }
  handleClick(route: string, event: Event, id?: number): void {
    event.preventDefault();
    if (id) {
      this.router.navigate([route, id]);
    } else {
      this.router.navigateByUrl(route);
    }
  }
}
