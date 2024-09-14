import { Component } from '@angular/core';
import { FollowService } from '../../service/follow.service';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AllUsersDTO, JoinGroupVerification, MessageBody, MessageData, StatusMap, UserDTO } from '../../models/models.compenant';
import { SharedserviceComponent } from '../../sharedservice/sharedservice.component';
import { DataService } from '../../data.service';
import { AuthService } from '../../service/auth.service';
import { GroupchatComponent } from '../groupchat/groupchat.component';
import { GroupeComponent } from '../groupe/groupe.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { WebSocketService } from '../../chat/services/chat.service';


@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [HttpClientModule, GroupeComponent, NgIf],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss',
  providers: [DataService, FollowService, AuthService, GroupeComponent],

})

export class InviteComponent {
  messagesSubscription: any;
  constructor(
    private followservice: FollowService,
    private dialogRef: MatDialogRef<InviteComponent>,
    private share: SharedserviceComponent,
    private dataservice: DataService,
    private authService: AuthService,
    private groupService: GroupeComponent,
    private router: Router,
    private rout: ActivatedRoute,
    private websocketService: WebSocketService
  ) {

  }

  Alluser!: AllUsersDTO
  toppings = new FormControl('');
  toppingList: UserDTO[] = []
  id !: string
  groupId!: number
  IsIn: StatusMap = {};
  ngOnInit(): void {
    this.id = (JSON.parse(localStorage.getItem('userID') as string));
    this.groupId = (JSON.parse(localStorage.getItem('groupid') as string))
    this.groupMember()
    this.followservice.getList(this.id, "friends").subscribe((friends: { friends: UserDTO[], status: number }) => {
        if (friends.status==204){
          alert("No followers found !")
          return
        }
        this.toppingList = friends.friends
    })
    this.messagesSubscription = this.websocketService.messages$
    .subscribe((message) => {
        if (
            message.type === 'new_invitation' &&
            message.payload.senderId == this.id
        ) {
          this.groupMember()
        }
    });

  }

  closeDialog() {
    this.dialogRef.close();
  }


  groupMember() {
    this.dataservice.getData(`member?group_id=${this.groupId}`).subscribe((data: { [key: number]: boolean }) => {
      this.IsIn = data
    })
  }

  addMember(
    groupId: number,
    userId: string,
    target_id: number,
    role: string
  ): void {
    this.groupService.addMember(groupId, userId, target_id.toString(), role)
    this.closeDialog()
  }

}
