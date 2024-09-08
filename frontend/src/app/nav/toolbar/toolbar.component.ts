import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule, MatIconButton } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { Router, RouterLink } from "@angular/router";
import { MatBadge } from "@angular/material/badge";
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { MatCardAvatar } from "@angular/material/card";
import { NotificationVerification } from '../../models/models.compenant';
import { AuthService } from '../../service/auth.service';
import { NgForOf, NumberSymbol } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatFormField,
    MatInput,
    MatLabel,
    RouterLink,
    MatBadge,
    MatMenu,
    MatCardAvatar,
    MatButtonModule,
    MatMenuModule,
    NgForOf,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  providers: [DataService, AuthService]
})
export class ToolbarComponent implements OnInit, OnDestroy {
  title = 'Social Network';
  id!: string
  username = ""
  hiddenNotif = false;
  NotifyLength !: number
  hiddenMessage = false;
  timerid !: any
  notifylength: string = '0';
  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {
    console.log('DataService:', this.dataService);
  }

  IsNotify: NotificationVerification = { notif: [] }

  searchQuery: string = '';
  filteredUsers: any[] = [];

  ngOnInit() {
    this.authService.isOnline();
    this.id = JSON.parse(localStorage.getItem('userID') as string);
    this.username = localStorage.getItem('firstname') as string
    this.timerid = setTimeout(() => {
      this.notify()
    }, 2000)
  }
  ngOnDestroy(): void {
    clearTimeout(this.timerid)
  }
  notify() {
    this.dataService.getNotification(this.id).subscribe(res => {
      this.IsNotify.notif = res == null ? [] : res
      this.notifylength = this.IsNotify.notif.length != 0 ? (this.IsNotify.notif.length).toString() : '0'
      
    })
  }

  InviteAccept(Id: number, groupID: number,userid : number) {
    let body = {
      'id': Id,
      'user_id': userid,
      'group_id': groupID
    }
    this.dataService.accept_decline("accept-request",body).subscribe((res)=>{
      if (res == null){
        this.IsNotify.notif = this.IsNotify.notif.filter((notif)=> notif.id != Id)
        this.notifylength = String(Number(this.notifylength)-1)
      }
    })
  }
  InviteDecline(Id: number, groupID: number,userid : number) { 
    let body = {
      'id': Id,
      'user_id':userid ,
      'group_id': groupID
    }
    console.log(body)
    this.dataService.accept_decline("decline-request",body).subscribe((res)=>{
      this.IsNotify.notif = this.IsNotify.notif.filter((notif)=> notif.id != Id)
      this.notifylength = String(Number(this.notifylength)-1)
    })
  }
  AdminAddMembers() { }
  handleLogout() {
    this.authService.logout().subscribe({
      next: () => {

        this.router.navigateByUrl('/login')
      },
      error: (err: any) => {
        console.error('Erreur lors de la déconnexion :', err);
      }
    });
  }

  visibilityNotif() {
    this.hiddenNotif = !this.hiddenNotif;
  }

  visibilityMessage() {
    this.hiddenMessage = !this.hiddenMessage;
  }

  onSearchChange(searchValue: string): void {
    console.log('Valeur de recherche:', searchValue);
    if (searchValue && searchValue.length > 0) {
      this.dataService.searchUsers(searchValue).subscribe((users: any[]) => {
        console.log('Utilisateurs filtrés:', users);
        this.filteredUsers = users;
      });
    } else {
      this.filteredUsers = [];
    }
  }


  goToUserProfile(user: any): void {
    console.log('Navigating to profile of:', user); // Debug
    this.router.navigate(['/profile', user.id]);
  }



  goToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }
}

