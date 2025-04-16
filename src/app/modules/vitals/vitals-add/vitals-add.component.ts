import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MessageService } from 'primeng/api';
import { VitalsService } from '../../../core/services/vitals.service';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';

import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-vitals-add',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './vitals-add.component.html',
  styleUrl: './vitals-add.component.scss'
})
export class VitalsAddComponent implements OnInit {
  vitalsData: any = {
    patientId: null,
    heartRate: null,
    bloodPressure: {
      systolic: null,
      diastolic: null
    },
    temperature: null,
    oxygenSaturation: null,
    notes: ''
  };
  
  patients: any[] = [];
  selectedPatient: any = null;
  loading = false;
  currentUser: any;

  constructor(
    private vitalsService: VitalsService,
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        this.vitalsData.patientId = +params['patientId'];
        this.loadPatientDetails(this.vitalsData.patientId);
      } else {
        this.loadPatients();
      }
    });
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
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load patients'
          });
        }
      });
  }

  loadPatientDetails(patientId: number) {
    this.patientService.getPatientById(patientId)
      .subscribe({
        next: (data) => {
          this.selectedPatient = data;
        },
        error: (error) => {
          console.error('Error loading patient details:', error);
        }
      });
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    const formData = {
      ...this.vitalsData,
      recordedBy: this.currentUser.id
    };

    this.vitalsService.addVitals(formData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Vitals recorded successfully'
          });
          
          setTimeout(() => {
            if (this.vitalsData.patientId) {
              this.router.navigate(['/patient', this.vitalsData.patientId]);
            } else {
              this.router.navigate(['/vitals']);
            }
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to record vitals'
          });
        }
      });
  }

  validateForm(): boolean {
    if (!this.vitalsData.patientId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please select a patient'
      });
      return false;
    }

    if (!this.vitalsData.heartRate && 
        !(this.vitalsData.bloodPressure.systolic && this.vitalsData.bloodPressure.diastolic) && 
        !this.vitalsData.temperature && 
        !this.vitalsData.oxygenSaturation) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please record at least one vital sign'
      });
      return false;
    }

    if (this.vitalsData.heartRate && (this.vitalsData.heartRate < 30 || this.vitalsData.heartRate > 220)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Heart rate should be between 30 and 220 bpm'
      });
      return false;
    }

    if (this.vitalsData.bloodPressure.systolic && !this.vitalsData.bloodPressure.diastolic) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please provide both systolic and diastolic values'
      });
      return false;
    }

    if (!this.vitalsData.bloodPressure.systolic && this.vitalsData.bloodPressure.diastolic) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please provide both systolic and diastolic values'
      });
      return false;
    }

    if (this.vitalsData.bloodPressure.systolic && 
        (this.vitalsData.bloodPressure.systolic < 60 || this.vitalsData.bloodPressure.systolic > 250)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Systolic pressure should be between 60 and 250 mmHg'
      });
      return false;
    }

    if (this.vitalsData.bloodPressure.diastolic && 
        (this.vitalsData.bloodPressure.diastolic < 30 || this.vitalsData.bloodPressure.diastolic > 150)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Diastolic pressure should be between 30 and 150 mmHg'
      });
      return false;
    }

    if (this.vitalsData.temperature && (this.vitalsData.temperature < 32 || this.vitalsData.temperature > 45)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Temperature should be between 32°C and 45°C'
      });
      return false;
    }

    if (this.vitalsData.oxygenSaturation && 
        (this.vitalsData.oxygenSaturation < 50 || this.vitalsData.oxygenSaturation > 100)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Oxygen saturation should be between 50% and 100%'
      });
      return false;
    }

    return true;
  }

  cancel() {
    if (this.vitalsData.patientId) {
      this.router.navigate(['/patient', this.vitalsData.patientId]);
    } else {
      this.router.navigate(['/vitals']);
    }
  }
}