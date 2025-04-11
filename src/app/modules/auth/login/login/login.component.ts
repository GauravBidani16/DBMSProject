// src/app/modules/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    ToastModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  loading = false;
  errorMessage = '';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}
  
  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (response) => {
          this.loading = false;
          
          // Navigate based on user role
          const role = this.authService.getUserRole();
          if (role === 'Admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'Doctor') {
            this.router.navigate(['/doctor']);
          } else if (role === 'Patient') {
            this.router.navigate(['/patient/dashboard']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid credentials. Please try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: this.errorMessage
          });
        }
      });
  }
}