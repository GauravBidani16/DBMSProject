// src/app/modules/patient/patient-detail/patient-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TabViewModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  patientId: number = 0;
  patient: any = null;
  appointments: any[] = [];
  prescriptions: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      this.loadPatientData();
    });
  }

  loadPatientData() {
    this.loading = true;
    
    // Load patient details
    this.patientService.getPatientById(this.patientId)
      .subscribe({
        next: (data) => {
          this.patient = data;
          this.loading = false;
          
          // Load appointments
          this.loadAppointments();
          
          // Load prescriptions
          this.loadPrescriptions();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load patient details'
          });
          this.loading = false;
        }
      });
  }

  loadAppointments() {
    this.patientService.getPatientAppointments(this.patientId)
      .subscribe({
        next: (data) => {
          this.appointments = data;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
        }
      });
  }

  loadPrescriptions() {
    this.patientService.getPatientPrescriptions(this.patientId)
      .subscribe({
        next: (data) => {
          this.prescriptions = data;
        },
        error: (error) => {
          console.error('Error loading prescriptions:', error);
        }
      });
  }

  getAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
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

  scheduleAppointment() {
    this.router.navigate(['/appointment/create'], { 
      queryParams: { patientId: this.patientId } 
    });
  }

  goBack() {
    this.router.navigate(['/patient']);
  }

  editPatient() {
    this.router.navigate(['/patient', this.patientId, 'edit']);
  }
}