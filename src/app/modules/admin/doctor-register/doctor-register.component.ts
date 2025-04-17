import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-doctor-register',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './doctor-register.component.html',
  styleUrl: './doctor-register.component.scss'
})
export class DoctorRegisterComponent implements OnInit {
  doctorData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    specialization: '',
    licenseNumber: '',
    departmentId: null,
    consultationFee: null,
    qualification: ''
  };

  departments: any[] = [];
  loading = false;
  currentUser: any;

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (!this.currentUser || this.currentUser.role !== 'Admin') {
      this.messageService.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'Only administrators can register doctors'
      });
      this.router.navigate(['/']);
      return;
    }

    this.loadDepartments();
  }

  loadDepartments() {
    this.doctorService.getDepartments()
      .subscribe({
        next: (data) => {
          this.departments = data.map((dept: any) => ({
            label: dept.Name,
            value: dept.DepartmentID
          }));
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load departments'
          });
        }
      });
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    this.doctorService.registerDoctor(this.doctorData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Doctor registered successfully'
          });
          
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to register doctor'
          });
        }
      });
  }

  validateForm(): boolean {
    if (!this.doctorData.firstName || !this.doctorData.lastName) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'First name and last name are required'
      });
      return false;
    }

    if (!this.doctorData.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Email is required'
      });
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.doctorData.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter a valid email address'
      });
      return false;
    }

    if (!this.doctorData.password || this.doctorData.password.length < 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Password must be at least 6 characters long'
      });
      return false;
    }

    if (!this.doctorData.specialization) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Specialization is required'
      });
      return false;
    }

    if (!this.doctorData.licenseNumber) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'License number is required'
      });
      return false;
    }

    if (!this.doctorData.departmentId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Department is required'
      });
      return false;
    }

    if (!this.doctorData.consultationFee) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Consultation fee is required'
      });
      return false;
    }

    if (!this.doctorData.qualification) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Consultation fee is required'
      });
      return false;
    }

    return true;
  }

  cancel() {
    this.router.navigate(['/admin']);
  }
}