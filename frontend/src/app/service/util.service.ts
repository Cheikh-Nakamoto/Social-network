import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private snackBar: MatSnackBar, private router: Router) {}

  onSnackBar(message: string, color: string) {
      this.snackBar.open(message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar', `snackbar-${color}`]
      });
  }
}
