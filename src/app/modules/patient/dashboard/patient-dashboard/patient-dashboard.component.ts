// src/app/modules/patient/dashboard/patient-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientService } from '../../../../core/services/patient.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss'
})
export class PatientDashboardComponent implements OnInit {
  currentUser: any;
  patientData: any = null;
  upcomingAppointments: any[] = [];
  recentPrescriptions: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private messageService: MessageService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (this.currentUser && this.currentUser.patientId) {
      this.loadPatientData(this.currentUser.patientId);
    } else {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Patient information not found'
      });
    }
  }

  loadPatientData(patientId: number) {
    this.patientService.getPatientById(patientId)
      .subscribe({
        next: (data) => {
          this.patientData = data;
          this.loadAppointments(patientId);
          this.loadPrescriptions(patientId);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load patient data'
          });
        }
      });
  }

  loadAppointments(patientId: number) {
    this.patientService.getPatientAppointments(patientId)
      .subscribe({
        next: (data) => {
          // Sort and get upcoming appointments
          this.upcomingAppointments = data
            .filter((app: any) => app.Status === 'Scheduled')
            .sort((a: any, b: any) => new Date(a.AppointmentDate).getTime() - new Date(b.AppointmentDate).getTime())
            .slice(0, 5); // Get only the first 5 upcoming appointments
          
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading appointments:', error);
        }
      });
  }

  loadPrescriptions(patientId: number) {
    this.patientService.getPatientPrescriptions(patientId)
      .subscribe({
        next: (data) => {
          // Sort and get most recent prescriptions
          this.recentPrescriptions = data
            .sort((a: any, b: any) => new Date(b.PrescriptionDate).getTime() - new Date(a.PrescriptionDate).getTime())
            .slice(0, 3); // Get only the 3 most recent prescriptions
        },
        error: (error) => {
          console.error('Error loading prescriptions:', error);
        }
      });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Scheduled':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }

  getNextAppointment() {
    return this.upcomingAppointments.length > 0 ? this.upcomingAppointments[0] : null;
  }
  
  calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }
}