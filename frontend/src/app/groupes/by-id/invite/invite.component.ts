import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { FollowService } from '../../../service/follow.service';
import { AuthService } from '../../../service/auth.service';
import { SharedserviceComponent } from '../../../sharedservice/sharedservice.component';
import { AllUsersDTO, UserDTO } from '../../../models/models.compenant';

@Component({
  selector: 'app-almost-private',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './almost-private.component.html',
  styleUrl: './almost-private.component.scss',
  providers: [FollowService, AuthService]
})
export class InviteComponent implements OnInit {
  constructor(
    private followservice: FollowService,
    private dialogRef: MatDialogRef<InviteComponent>,
    private share : SharedserviceComponent 
  ) {

  }

  Alluser!: AllUsersDTO
  toppings = new FormControl('');
  toppingList: UserDTO[] = []

  ngOnInit(): void {
    let id = localStorage.getItem("userID") as string
    this.followservice.getList(id, "friends").subscribe((friends :{friends:UserDTO[],status:number}) => {
      this.toppingList = friends.friends
    })
  }

  selectuser(){
    this.share.setData({"almost":this.toppings.value})
  }
  closeDialog() {
    this.dialogRef.close();
  }

}
