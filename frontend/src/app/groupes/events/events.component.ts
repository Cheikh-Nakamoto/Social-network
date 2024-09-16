import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../data.service';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from "../../nav/toolbar/toolbar.component";
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToolbarComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule
  ],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  providers: [DataService, AuthService]
})
export class EventsComponent implements OnInit {
  groupeForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  today!: string;
  startdate !: Date
  enddate!: Date

  constructor(
    private fb: FormBuilder,
    private apiService: DataService,
    private router: Router,
    private authService: AuthService,
    private dialogRef: MatDialogRef<EventsComponent>
  ) { }

  ngOnInit(): void {
    this.authService.isOnline();
    this.getFormattedDate(); // Appeler cette fonction pour initialiser 'today'

    const userID = localStorage.getItem('userID');

    this.groupeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      user_id: [Number(userID), Validators.required],
      group_id: [parseInt(localStorage.getItem('groupid') as string, 10)],
      date_start: ['', Validators.required],
      hour_start: ['', [Validators.required]],
      date_end: ['', Validators.required],
      hour_end: ['', [Validators.required]],
    }, {
      validators: this.validateDateTimeOrder // Assigner directement la fonction ici
    });

  }


  // Validation de l'ordre des dates et heures
  validateDateTimeOrder(group: FormGroup) {
    const dateStart = group.get('date_start')?.value;
    const hourStart = group.get('hour_start')?.value;
    const dateEnd = group.get('date_end')?.value;
    const hourEnd = group.get('hour_end')?.value;

    // Vérifiez que toutes les valeurs sont définies
    if (!dateStart || !hourStart || !dateEnd || !hourEnd) {
      return { dateTimeOrder: true }; // ou null si vous voulez que cela soit valide tant que tout n'est pas rempli
    }

    // Création des objets Date
    const startDateTime = new Date(`${dateStart}T${hourStart}`);
    const endDateTime = new Date(`${dateEnd}T${hourEnd}`);

    // Vérifiez si les dates sont invalides
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return { dateTimeOrder: true };
    }

    // Vérification de l'ordre des dates
    if (startDateTime >= endDateTime) {
      return { dateTimeOrder: true };
    }
    this.startdate = startDateTime
    this.enddate = endDateTime
    return null;
  }
  getFormattedDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    this.today = `${year}-${month}-${day}`;
  }

  closeDialog() {
    this.dialogRef.close();
  }


  onSubmit(): void {
    const groupid = parseInt(localStorage.getItem('groupid') as string);

    if (this.groupeForm.valid) {
      const dateStart = this.groupeForm.get('date_start')?.value;
      const hourStart = this.groupeForm.get('hour_start')?.value;
      const dateEnd = this.groupeForm.get('date_end')?.value;
      const hourEnd = this.groupeForm.get('hour_end')?.value;

      // Création des objets Date
      const startDateTime = new Date(`${dateStart}T${hourStart}`);
      const endDateTime = new Date(`${dateEnd}T${hourEnd}`);

      let body = {
        'name': this.groupeForm.get('name')?.value,
        'description': this.groupeForm.get('description')?.value,
        'user_id': this.groupeForm.get('user_id')?.value,
        'group_id': groupid,
        'hour_start': startDateTime,
        'hour_end': endDateTime,
      };

      if (body.description.trim() === '' || body.name.trim() === '') {
        alert('Les champs description et nom ne doivent pas être vides');
        return;
      }

      this.apiService.createEvent(body).subscribe(
        (res) => {
          this.groupeForm.reset();
          this.closeDialog();

          this.router.navigateByUrl(`/groups/${groupid}`).then(() => {
            window.location.reload();
          });
        },
        (error) => {
          alert(`Échec de la création de l'événement`);
        }
      );
    }
  }
}
