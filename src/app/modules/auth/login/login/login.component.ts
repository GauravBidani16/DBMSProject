import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  errorMessage = '';

  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) { }

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
            this.router.navigate(['/patient/dashboard']); // Updated to go to patient dashboard
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
