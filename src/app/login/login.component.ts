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
import { SnackbarService } from '../services/snackbar/snackbar.service';
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
  
  constructor(private authService: AuthService, private fb: FormBuilder, private snackbarService: SnackbarService) {}


  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  
  public logOut() {
    this.authService.logOut();
  }

  async onRegister() {
    if (this.registerForm.valid) {
      try {
        console.log('Registro datos:', this.registerForm.value);
        await this.authService.registerWithEmailPassword(this.registerForm.value)  
      } catch (error:any) {
        this.snackbarService.openErrorLoginSnackbar(error.message as string)
      }
      
    }
  }

  async onLogin() {
    if (this.loginForm.valid) {
      try {
        await this.authService.loginWithEmailPassword(this.loginForm.value.email, this.loginForm.value.password);
      } catch (error:any) {
        this.snackbarService.openErrorLoginSnackbar(error.message as string)
      }
    }
  }

  
    
  }


