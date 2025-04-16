import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { SelectModule } from 'primeng/select';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CalendarModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss'
})
export class AppointmentFormComponent implements OnInit {

  today = new Date();

  appointment = {
    patientId: null,
    doctorId: null,
    appointmentType: null,
    appointmentDate: new Date(),
    startTime: "",
    endTime: null,
    notes: ''
  };

  patients: any[] = [];
  doctors: any[] = [];
  loading = false;

  appointmentTypes = [
    { label: 'Consultation', value: 'Consultation' },
    { label: 'Follow-up', value: 'Follow-up' },
    { label: 'Sample Collection', value: 'Sample Collection' },
    { label: 'Emergency', value: 'Emergency' }
  ];

  timeSlots = [
    { label: '09:00 AM', value: '09:00' },
    { label: '09:30 AM', value: '09:30' },
    { label: '10:00 AM', value: '10:00' },
    { label: '10:30 AM', value: '10:30' },
    { label: '11:00 AM', value: '11:00' },
    { label: '11:30 AM', value: '11:30' },
    { label: '12:00 PM', value: '12:00' },
    { label: '01:00 PM', value: '13:00' },
    { label: '01:30 PM', value: '13:30' },
    { label: '02:00 PM', value: '14:00' },
    { label: '02:30 PM', value: '14:30' },
    { label: '03:00 PM', value: '15:00' },
    { label: '03:30 PM', value: '15:30' },
    { label: '04:00 PM', value: '16:00' },
    { label: '04:30 PM', value: '16:30' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      next: (data) => {
        console.log(data);
        if(data && data.role == 'Patient') {
          this.loadPatientById(data.patientId);
          this.loadDoctors();
        } else if (data && data.role == 'Doctor') {
          this.loadPatients();
          this.loadDoctorById(data.doctorId);
        } else {
          this.loadPatients();
          this.loadDoctors();
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
  }

  loadPatientById(id: any) {
    this.patientService.getPatientById(id)
      .subscribe({
        next: (data) => {
          this.patients = [data];
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load patient information.'
          });
        }
      });
  }

  loadPatients() {
    this.patientService.getAllPatients()
      .subscribe({
        next: (data) => {
          this.patients = data;
          console.log(data);
          
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load patients'
          });
        }
      });
  }

  loadDoctorById(id: any) {
    this.doctorService.getDoctorById(id)
      .subscribe({
        next: (data: any[]) => {
          this.doctors = [data];
          console.log(data);
          
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load doctors'
          });
        }
      });
  }

  loadDoctors() {
    this.doctorService.getDoctors()
      .subscribe({
        next: (data) => {
          this.doctors = data;
          console.log(data);
          
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load doctors'
          });
        }
      });
  }

  submitForm() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Calculate end time (30 minutes after start time)
    let endTime = this.calculateEndTime(this.appointment.startTime);

    // Format date for API
    let formattedDate = this.formatDate(this.appointment.appointmentDate);

    // Prepare data for API
    const appointmentData = {
      patientId: this.appointment.patientId,
      doctorId: this.appointment.doctorId,
      appointmentType: this.appointment.appointmentType,
      appointmentDate: formattedDate,
      startTime: this.appointment.startTime,
      endTime: endTime,
      notes: this.appointment.notes
    };

    this.appointmentService.createAppointment(appointmentData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Appointment Created',
            detail: 'The appointment has been successfully scheduled.'
          });

          // Navigate back to appointment list after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/appointment']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create appointment'
          });
        }
      });
  }

  calculateEndTime(startTime: string): string {
    // Simple function to add 30 minutes to the start time
    // In a real app, this would be more sophisticated
    const [hours, minutes] = startTime.split(':').map(Number);
    let newHours = hours;
    let newMinutes = minutes + 30;
    
    if (newMinutes >= 60) {
      newHours += 1;
      newMinutes -= 60;
    }
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  validateForm(): boolean {
    if (!this.appointment.patientId) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please select a patient'});
      return false;
    }
    
    if (!this.appointment.doctorId) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please select a doctor'});
      return false;
    }
    
    if (!this.appointment.appointmentDate) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please select a date'});
      return false;
    }
    
    if (!this.appointment.startTime) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please select a start time'});
      return false;
    }
    
    if (!this.appointment.appointmentType) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please select an appointment type'});
      return false;
    }
    
    return true;
  }

  cancel() {
    this.router.navigate(['/appointment']);
  }
}