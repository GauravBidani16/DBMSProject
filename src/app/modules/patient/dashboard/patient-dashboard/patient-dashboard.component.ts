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
import { VitalsService } from '../../../../core/services/vitals.service';

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
  latestVitals: any = null;
  loading = true;
new: any;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private messageService: MessageService,
    private vitalsService: VitalsService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (this.currentUser && this.currentUser.patientId) {
      this.loadPatientData(this.currentUser.patientId);
      this.loadLatestVitals(this.currentUser.patientId);
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
          // Make sure data is coming through
          console.log('Fetched appointments:', data);
          
          // Sort by date to get upcoming appointments
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
          
          this.upcomingAppointments = data
            .filter((app: any) => {
              // Convert string date to Date object for comparison
              const appDate = new Date(app.AppointmentDate);
              appDate.setHours(0, 0, 0, 0);
              
              // Filter for upcoming appointments (today or later) and with "Scheduled" status
              return appDate >= today && app.Status === 'Scheduled';
            })
            .sort((a: any, b: any) => {
              // Sort by date (ascending)
              const dateA = new Date(a.AppointmentDate);
              const dateB = new Date(b.AppointmentDate);
              
              // If same date, sort by time
              if (dateA.getTime() === dateB.getTime()) {
                return a.StartTime.localeCompare(b.StartTime);
              }
              
              return dateA.getTime() - dateB.getTime();
            });
          
          console.log('Upcoming appointments:', this.upcomingAppointments);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading appointments:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load your appointments'
          });
        }
      });
  }

  loadLatestVitals(patientId: number) {
    this.vitalsService.getLatestVitals(patientId)
      .subscribe({
        next: (data) => {
          this.latestVitals = data;
          console.log('Latest vitals:', data);
        },
        error: (error) => {
          console.error('Error loading vitals:', error);
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

  getNextAppointment() {
    if (this.upcomingAppointments && this.upcomingAppointments.length > 0) {
      return this.upcomingAppointments[0];
    }
    return null;
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
  
  
  formatDate(dateOfBirth: string) {
    const dob = new Date(dateOfBirth);
    return dob.getFullYear() + "-" + dob.getMonth() + "-" + dob.getDay();
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