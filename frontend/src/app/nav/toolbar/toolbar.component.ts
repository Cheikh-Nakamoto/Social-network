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
import { DataService } from '../../data.service';
import { NotificationVerification } from '../../models/models.compenant';
import { AuthService } from '../../service/auth.service';



@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
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
    MatMenuModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  providers: [DataService, AuthService]
})
export class ToolbarComponent implements OnInit, OnDestroy {
  user = JSON.parse(localStorage.getItem('user') as string)
  title = 'Social Network';
  id!: string
  username = this.user == null ? '' : this.user.nickname;
  hiddenNotif = false;
  NotifyLength !: number
  hiddenMessage = false;
  timerid !: any
  constructor(
    private groupService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  IsNotify: NotificationVerification = { notif: [] }

  ngOnInit() {
    this.authService.isOnline();
    this.id = JSON.parse(localStorage.getItem('userID') as string);
    // this.timerid = setTimeout(() => {
    //   this.notify()
    // }, 5000)
  }
  ngOnDestroy(): void {
    clearTimeout(this.timerid)
  }
  notify() {
    this.groupService.postData("notification", { 'user_id': this.id }).subscribe(res => {
      this.IsNotify = res
      console.log(this.IsNotify)
    })
  }
handleLogout() {
  this.authService.logout().subscribe({
    next: () => {
      console.log('Déconnexion réussie');
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
}
