import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { MessageService } from 'primeng/api';

import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './patient-edit.component.html',
  styleUrl: './patient-edit.component.scss'
})
export class PatientEditComponent implements OnInit {
  patientId: number = 0;
  patient: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: null,
    gender: null,
    bloodGroup: null,
    phoneNumber: '',
    height: null,
    weight: null,
    address: '',
    allergies: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactRelation: ''
  };
  isNewPatient = false;
  loading = false;
  defaultDOB = new Date()
  currentUser: any;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (this.route?.routeConfig?.path === 'new') {
        this.isNewPatient = true;
      } else {
        this.patientId = +params['id'];
        this.loadPatientData();
      }
    });
  }

  loadPatientData() {
    this.loading = true;
    this.patientService.getPatientById(this.patientId)
      .subscribe({
        next: (data) => {
          this.patient = {
            firstName: data.FirstName,
            lastName: data.LastName,
            dateOfBirth: new Date(data.DateOfBirth),
            gender: data.Gender,
            bloodGroup: data.BloodGroup,
            email: data.Email,
            phoneNumber: data.PhoneNumber,
            address: data.Address,
            allergies: data.Allergies,
            medicalHistory: data.MedicalHistory,
            emergencyContactName: data.EmergencyContactName,
            emergencyContactNumber: data.EmergencyContactNumber,
            emergencyContactRelation: data.EmergencyContactRelation
          };
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load patient data'
          });
          this.loading = false;
        }
      });
  }

  savePatient() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    const patientData = {
      firstName: this.patient.firstName,
      lastName: this.patient.lastName,
      dateOfBirth: this.formatDate(this.patient.dateOfBirth),
      gender: this.patient.gender,
      bloodGroup: this.patient.bloodGroup,
      email: this.patient.email,
      phoneNumber: this.patient.phoneNumber,
      address: this.patient.address,
      allergies: this.patient.allergies,
      medicalHistory: this.patient.medicalHistory,
      emergencyContactName: this.patient.emergencyContactName,
      emergencyContactNumber: this.patient.emergencyContactNumber,
      emergencyContactRelation: this.patient.emergencyContactRelation
    };

    if (this.isNewPatient) {
      const newPatientData = {
        ...patientData,
        email: this.patient.email,
        password: this.patient.password
      };
      
      this.patientService.createPatient(newPatientData)
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Patient created successfully'
            });
            
            setTimeout(() => {
              this.router.navigate(['/patient']);
            }, 2000);
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to create patient'
            });
          }
        });
    } else {
      this.patientService.updatePatient(this.patientId, patientData)
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Patient information updated successfully'
            });
            
            setTimeout(() => {
              this.router.navigate(['/patient', this.patientId]);
            }, 2000);
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to update patient information'
            });
          }
        });
    }
  }

  validateForm(): boolean {
    if (!this.patient.firstName || !this.patient.lastName) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'First name and last name are required'
      });
      return false;
    }
    
    if (!this.patient.dateOfBirth) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Date of birth is required'
      });
      return false;
    }
    
    if (!this.patient.gender) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Gender is required'
      });
      return false;
    }
    
    if (!this.patient.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Email is required'
      });
      return false;
    }
    
    return true;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  cancel() {
    if (this.isNewPatient) {
      this.router.navigate(['/patient']);
    } else {
      this.router.navigate(['/patient', this.patientId]);
    }
  }
}