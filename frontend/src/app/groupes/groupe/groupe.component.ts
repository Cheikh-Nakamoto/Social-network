import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DataService } from '../../data.service';
import { AllUsersDTO, CommentContent, CommentDTO, Group, JoinGroupVerification, MessageBody, MessageData, NotificationVerification, Post, Posts, length } from '../../models/models.compenant';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToolbarComponent } from '../../nav/toolbar/toolbar.component';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { WebSocketService } from '../../chat/services/chat.service';


@Component({
  selector: 'app-groupe',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToolbarComponent,
    MatIconModule,
    MatDividerModule,
    NgIf,
    NgFor
  ],
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.component.scss'],
  providers: [DataService, AuthService],

})
export class GroupeComponent implements OnInit {
  IsIn: JoinGroupVerification = {};
  groups: Group[] = [];
  groupeForm!: FormGroup;
  id !: string;
  clear!: any;
  messagesSubscription: any;


  constructor(
    private fb: FormBuilder,
    private groupService: DataService,
    private router: Router,
    private authService: AuthService,
    private websocketService: WebSocketService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.authService.isOnline();
    this.id = JSON.parse(localStorage.getItem("userID") as string);

    this.joinedgroup()
    this.loadGroups()

    this.websocketService.connect()
    this.messagesSubscription = this.websocketService.messages$
      .subscribe((message) => {
        if (
          message.type === 'new_group' &&
          message.payload.messageId == 0
        ) {
          this.joinedgroup()
          this.loadGroups()
        }
      }
      );
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
  openCreatePostDialog() {
    this.dialog.open(CreateGroupComponent, {
      width: "auto"
    });
  }

  addMember(groupId: number, userId: string, target_id: string, role: string): void {
    this.groupService.addMember(groupId, userId, target_id, role).subscribe(
      () => {
        const messBody: MessageBody = {
          senderId: Number(userId),
          receiverId: Number(target_id),
          message: "Vous avez une nouvelle notification"

        }
        const message: MessageData = {
          type: 'new_notification',
          datas: messBody,
        };
        const even = new Events(message.type, message.datas);
        sendEvent(this.websocketService, even);
      },
      (error) => {
        // Vérifiez la condition correctement avec '==='
        if (error.error == "Notification existe : true\n") {
          alert("Votre demande d'adhésion a déjà été envoyée !");
        } else {
          // Gérer d'autres erreurs ici si nécessaire
          console.error('Erreur lors de l\'ajout du membre:', error);
        }
      }
    );
  }

  joinedgroup(): void {
    this.groupService.getGroupJoined().subscribe(res => {
      this.IsIn = res
    }, (error) => console.error('Error fetching ', error))
  }

  handleClick(route: string, event: Event, id?: number): void {
    event.preventDefault();
    if (id) {
      this.router.navigate([route, id]);
      localStorage.setItem('groupid', id.toString());
    } else {
      this.router.navigateByUrl(route);
    }
  }
}

function sendEvent(websocketService: WebSocketService, datas: any) {
  websocketService.sendMessage(datas);
}

class Events {
  type: string;
  payload: any;

  constructor(type: string, payload: any) {
    this.type = type;
    this.payload = payload;
  }
}
