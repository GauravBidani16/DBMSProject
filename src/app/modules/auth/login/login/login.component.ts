import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../../../core/services/auth.service';
import { PrimeNgImports } from '../../../../primengModules';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: PrimeNgImports,
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