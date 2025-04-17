import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: PrimeNgImports,
  providers: [MessageService],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  loading = false;

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Consultation', value: 'Consultation' },
    { label: 'Follow-up', value: 'Follow-up' },
    { label: 'Sample Collection', value: 'Sample Collection' },
    { label: 'Emergency', value: 'Emergency' }
  ];

  selectedStatus: any = null;
  selectedType: any = null;
  searchText: string = '';
  viewAppointmentDialog: boolean = false;
  selectedAppointment: any = null;
  patientId: any = null;
  doctorId: any = null;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      next: (data) => {
        console.log(data);
        if(data && data.role == 'Patient') {
          this.patientId = data.patientId;
        } else if (data && data.role == 'Doctor'){
          this.doctorId = data.doctorId;
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No user found. Please log in.'
        });
      }
    })
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAppointments()
      .subscribe({
        next: (data) => {
          if (this.patientId && this.patientId > 0) {
            this.appointments = data.filter((e: any) => e.PatientID == this.patientId);
          } else if(this.doctorId && this.doctorId > 0){
            this.appointments = data.filter((e: any) => e.DoctorID == this.doctorId);
          } else {
            this.appointments = data;
          }
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load appointments'
          });
          this.loading = false;
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

  createAppointment() {
    this.router.navigate(['/appointment/create']);
  }

  viewAppointment(appointment: any) {
    this.selectedAppointment = appointment;
    this.viewAppointmentDialog = true;
  }

  updateStatus(appointment: any, status: string) {
    this.appointmentService.updateAppointmentStatus(appointment.AppointmentID, status)
      .subscribe({
        next: (response) => {
          appointment.Status = status;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: `Appointment has been marked as ${status}`
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update appointment status'
          });
        }
      });
  }

  applyFilters() {
    this.filteredAppointments = this.appointments.filter(appointment => {
      if (this.selectedStatus && appointment.Status !== this.selectedStatus) {
        return false;
      }
      
      if (this.selectedType && appointment.AppointmentType !== this.selectedType) {
        return false;
      }
      
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        return appointment.PatientName.toLowerCase().includes(searchLower) ||
               appointment.DoctorName.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }
}