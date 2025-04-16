// src/app/modules/bed-management/bed-dashboard/bed-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import { BedService } from '../../../core/services/bed.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-bed-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './bed-dashboard.component.html',
  styleUrl: './bed-dashboard.component.scss'
})
export class BedDashboardComponent implements OnInit {
  beds: any[] = [];
  currentAdmissions: any[] = [];
  
  // Computed properties
  totalBeds: number = 0;
  availableBeds: number = 0;
  occupiedBeds: number = 0;
  
  admitDialog: boolean = false;
  dischargeDialog: boolean = false;
  
  patients: any[] = [];
  doctors: any[] = [];
  availableBedsOptions: any[] = []; // Renamed to avoid conflict
  
  newAdmission: any = {
    patientId: null,
    doctorId: null,
    bedId: null,
    admissionReason: '',
    diagnosisAtAdmission: '',
    notes: ''
  };
  
  selectedAdmission: any = null;
  dischargeNotes: string = '';
  
  loading: boolean = true;
  currentUser: any;

  constructor(
    private bedService: BedService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadBeds();
    this.loadCurrentAdmissions();
  }

  loadBeds() {
    this.bedService.getAllBeds()
      .subscribe({
        next: (data) => {
          this.beds = data;
          this.calculateBedCounts();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load beds'
          });
          this.loading = false;
        }
      });
  }

  // Calculate bed counts
  calculateBedCounts() {
    this.totalBeds = this.beds.length;
    this.availableBeds = this.beds.filter(bed => bed.Status === 'Available').length;
    this.occupiedBeds = this.beds.filter(bed => bed.Status === 'Occupied').length;
  }

  loadCurrentAdmissions() {
    this.bedService.getCurrentAdmissions()
      .subscribe({
        next: (data) => {
          this.currentAdmissions = data;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load current admissions'
          });
        }
      });
  }

  openAdmitDialog() {
    // Reset form
    this.newAdmission = {
      patientId: null,
      doctorId: null,
      bedId: null,
      admissionReason: '',
      diagnosisAtAdmission: '',
      notes: ''
    };
    
    // Load required data for dropdowns
    this.loadPatients();
    this.loadDoctors();
    this.loadAvailableBedsOptions();
    
    // If current user is a doctor, pre-select them
    if (this.currentUser && this.currentUser.role === 'Doctor' && this.currentUser.doctorId) {
      this.newAdmission.doctorId = this.currentUser.doctorId;
    }
    
    this.admitDialog = true;
  }

  loadPatients() {
    this.patientService.getAllPatients()
      .subscribe({
        next: (data) => {
          this.patients = data.map((e: any) => {
            return {
              ...e,
              patientName: e.FirstName + " " + e.LastName
            }
          });
        },
        error: (error) => {
          console.error('Error loading patients:', error);
        }
      });
  }

  loadDoctors() {
    this.doctorService.getDoctors()
      .subscribe({
        next: (data) => {
          this.doctors = data.map((e: any) => {
            return {
              ...e,
              doctorName: e.FirstName + " " + e.LastName
            }
          });;
        },
        error: (error) => {
          console.error('Error loading doctors:', error);
        }
      });
  }

  loadAvailableBedsOptions() {
    this.bedService.getAvailableBeds()
      .subscribe({
        next: (data) => {
          this.availableBedsOptions = data.map((bed: any) => ({
            label: `Room ${bed.RoomNumber} - Bed ${bed.BedNumber} (${bed.RoomTypeName})`,
            value: bed.BedID
          }));
        },
        error: (error) => {
          console.error('Error loading available beds:', error);
        }
      });
  }

  admitPatient() {
    // Validate required fields
    if (!this.newAdmission.patientId || !this.newAdmission.doctorId || 
        !this.newAdmission.bedId || !this.newAdmission.admissionReason) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }
    
    // Send admission request
    this.bedService.admitPatient(this.newAdmission)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Patient Admitted',
            detail: 'Patient has been successfully admitted'
          });
          this.admitDialog = false;
          
          // Reload data
          this.loadBeds();
          this.loadCurrentAdmissions();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to admit patient'
          });
        }
      });
  }

  openDischargeDialog(admission: any) {
    this.selectedAdmission = admission;
    this.dischargeNotes = '';
    this.dischargeDialog = true;
  }

  dischargePatient() {
    if (!this.selectedAdmission) {
      return;
    }
    
    const dischargeData = {
      notes: this.dischargeNotes,
      dischargeRemarks: this.dischargeNotes,
      userId: this.currentUser.id
    };
    
    this.bedService.dischargePatient(this.selectedAdmission.AdmissionID, dischargeData)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Patient Discharged',
            detail: 'Patient has been successfully discharged'
          });
          this.dischargeDialog = false;
          
          // Reload data
          this.loadBeds();
          this.loadCurrentAdmissions();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to discharge patient'
          });
        }
      });
  }

  getBedStatusColor(status: string): string {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700 border-round px-2 py-1';
      case 'Occupied':
        return 'bg-red-100 text-red-700 border-round px-2 py-1';
      case 'Reserved':
        return 'bg-blue-100 text-blue-700 border-round px-2 py-1';
      case 'Under Maintenance':
        return 'bg-gray-100 text-gray-700 border-round px-2 py-1';
      default:
        return '';
    }
  }
}