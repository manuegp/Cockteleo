import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private _snackBar = inject(MatSnackBar);
  constructor(private authService: AuthService, private fb: FormBuilder) {}

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // public logInWithGoogle(): void {
  //   this.authService.logInWithGoogle();
  // }
  public logOut() {
    this.authService.logOut();
  }

  async onRegister() {
    if (this.registerForm.valid) {
      try {
        console.log('Registro datos:', this.registerForm.value);
        await this.authService.registerWithEmailPassword(this.registerForm.value)  
      } catch (error) {
        this.showError(error)
      }
      
    }
  }

  async onLogin() {
    if (this.loginForm.valid) {
      try {
        await this.authService.loginWithEmailPassword(this.loginForm.value.email, this.loginForm.value.password);
      } catch (error) {
        this.showError(error); // Suponiendo que tienes una función para manejar el error
      }
    }
  }

  showError(error:any) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: 5 * 1000,
      data: {error: error},
      panelClass:'custom-snackbar-error'
    });
  }
    
  }


