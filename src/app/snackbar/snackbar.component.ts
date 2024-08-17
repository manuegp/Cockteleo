import { Component, Inject, inject } from '@angular/core';
import {  MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [MatSnackBarModule],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.css'
})
export class SnackbarComponent {
  constructor( @Inject(MAT_SNACK_BAR_DATA) public data: any){}
  snackBarRef = inject(MatSnackBarRef);
}
