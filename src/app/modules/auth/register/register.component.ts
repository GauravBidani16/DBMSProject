import { Component } from '@angular/core';
import { Router } from '@angular/router';


import { MessageService } from 'primeng/api';

import { AuthService } from '../../../core/services/auth.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registrationData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: null as Date | null,
    gender: null as string | null,
    phoneNumber: '',
    bloodGroup: null as string | null,
    address: ''
  };

  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];

  bloodGroupOptions = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
    { label: 'Unknown', value: 'Unknown' }
  ];

  loading = false;
  maxDate = new Date();

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  register() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    const formattedData = {
      ...this.registrationData,
      dateOfBirth: this.formatDate(this.registrationData.dateOfBirth)
    };

    this.authService.register(formattedData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Your account has been created. You can now log in.'
          });
          
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Registration Failed',
            detail: error.error?.message || 'Failed to create account. Please try again.'
          });
        }
      });
  }

  validateForm(): boolean {
    if (!this.registrationData.firstName || !this.registrationData.lastName) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'First name and last name are required'
      });
      return false;
    }

    if (!this.registrationData.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Email is required'
      });
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.registrationData.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter a valid email address'
      });
      return false;
    }

    if (!this.registrationData.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Password is required'
      });
      return false;
    }

    if (this.registrationData.password.length < 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Password must be at least 6 characters long'
      });
      return false;
    }

    if (this.registrationData.password !== this.registrationData.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Passwords do not match'
      });
      return false;
    }

    if (!this.registrationData.dateOfBirth) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Date of birth is required'
      });
      return false;
    }

    if (!this.registrationData.gender) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Gender is required'
      });
      return false;
    }

    return true;
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}