import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DialogModule,
    ToastModule,
    FormsModule
  ],
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

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAppointments()
      .subscribe({
        next: (data) => {
          this.appointments = data;
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
          // Update the status in the local array
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
      // Filter by status if selected
      if (this.selectedStatus && appointment.Status !== this.selectedStatus) {
        return false;
      }
      
      // Filter by type if selected
      if (this.selectedType && appointment.AppointmentType !== this.selectedType) {
        return false;
      }
      
      // Filter by search text
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        return appointment.PatientName.toLowerCase().includes(searchLower) ||
               appointment.DoctorName.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }
}