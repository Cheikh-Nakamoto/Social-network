import { Component } from '@angular/core';
import { FollowService } from '../../service/follow.service';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AllUsersDTO, UserDTO } from '../../models/models.compenant';
import { SharedserviceComponent } from '../../sharedservice/sharedservice.component';
import { DataService } from '../../data.service';
import { AuthService } from '../../service/auth.service';
import { GroupchatComponent } from '../groupchat/groupchat.component';
import { GroupeComponent } from '../groupe/groupe.component';
import { ActivatedRoute ,Router} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';


@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [HttpClientModule,GroupeComponent,NgIf],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss',
  providers: [DataService,FollowService ,AuthService, GroupeComponent],

})
export class InviteComponent {
  constructor(
    private followservice: FollowService,
    private dialogRef: MatDialogRef<InviteComponent>,
    private share : SharedserviceComponent ,
    private dataservice : DataService,
    private authService: AuthService,
    private groupService: GroupeComponent,
    private router: Router,
    private rout: ActivatedRoute
   
  ) {

  }

  Alluser!: AllUsersDTO
  toppings = new FormControl('');
  toppingList: UserDTO[] = []
  id !: string
  groupId!: number

  ngOnInit(): void {
    this.id = (JSON.parse(localStorage.getItem('userID') as string));
    this.groupId = this.rout.snapshot.params['id'].toString();
    this.followservice.getList(this.id, "friends").subscribe((friends :{friends:UserDTO[],status:number}) => {
      this.toppingList = friends.friends
    })
  }

  closeDialog() {
    this.dialogRef.close();
  }

  addMember(
    groupId: number,
    userId: string,
    target_id: number,
    role: string
): void {
    this.groupService.addMember(groupId, userId, target_id.toString(), role)
}

}
