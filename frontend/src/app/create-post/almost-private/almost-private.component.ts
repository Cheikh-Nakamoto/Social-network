import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FollowService } from '../../service/follow.service';
import { AllUsersDTO, UserDTO } from '../../models/models.compenant';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-almost-private',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './almost-private.component.html',
  styleUrl: './almost-private.component.scss',
  providers: [FollowService, AuthService]
})
export class AlmostPrivateComponent implements OnInit {
  constructor(
    private followservice: FollowService,
    private dialogRef: MatDialogRef<AlmostPrivateComponent>

  ) {

  }

  Alluser!: AllUsersDTO
  toppings = new FormControl('');
  toppingList: UserDTO[] = []

  ngOnInit(): void {
    let id = localStorage.getItem("userID") as string
    this.followservice.getList(id, "friends").subscribe((friends : UserDTO[]) => {
      this.toppingList = friends
    })
  }
  closeDialog() {
    this.dialogRef.close();
  }

}
