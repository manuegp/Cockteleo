import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private _snackBar = inject(MatSnackBar);
  constructor() { }

  public openErrorLoginSnackbar(errorMessage: string ){
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: 5 * 1000,
      data: {message: errorMessage},
      panelClass:'custom-snackbar-error',
      politeness: 'off'
    });
  }

  public openRecipeSnackbar(message: string ){
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: 5 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: 'custom-snackbar-success',
      data: {message: message},
      
      
    });
  }
}
