import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { PrimeNgImports } from '../../../../primengModules';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss'
})
export class DoctorDashboardComponent implements OnInit {
  doctorInfo: any = null;
  myPatients: any[] = [];
  todayAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  
  loading = true;
  currentUser: any;

  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (this.currentUser && this.currentUser.doctorId) {
      this.loadDoctorData(this.currentUser.doctorId);
      this.loadAppointments(this.currentUser.doctorId);
      this.loadPatients(this.currentUser.doctorId);
    } else {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Doctor information not found'
      });
    }
  }

  loadDoctorData(doctorId: number) {
    this.doctorService.getDoctorById(doctorId)
      .subscribe({
        next: (data) => {
          this.doctorInfo = data;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load doctor information'
          });
          this.loading = false;
        }
      });
  }

  loadAppointments(doctorId: number) {
    this.appointmentService.getDoctorAppointments(doctorId)
      .subscribe({
        next: (data) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          this.todayAppointments = data.filter((app: any) => {
            const appDate = new Date(app.AppointmentDate);
            appDate.setHours(0, 0, 0, 0);
            return appDate.getTime() === today.getTime();
          });
          
          this.upcomingAppointments = data.filter((app: any) => {
            const appDate = new Date(app.AppointmentDate);
            appDate.setHours(0, 0, 0, 0);
            return appDate.getTime() > today.getTime() && app.Status === 'Scheduled';
          }).slice(0, 5);
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
        }
      });
  }

  loadPatients(doctorId: number) {
    this.doctorService.getDoctorPatients(doctorId)
      .subscribe({
        next: (data) => {
          this.myPatients = data.slice(0, 5);
        },
        error: (error) => {
          console.error('Error loading patients:', error);
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
      case 'No-Show':
        return 'warn';
      default:
        return 'info';
    }
  }
}