import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MessageService } from 'primeng/api';

import { PatientService } from '../../../core/services/patient.service';
import { VitalsService } from '../../../core/services/vitals.service';
import { AuthService } from '../../../core/services/auth.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  patientId: number = 0;
  patient: any = null;
  appointments: any[] = [];
  prescriptions: any[] = [];
  vitalsHistory: any[] = [];
  loading = true;
  currentUserRole: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private vitalsService: VitalsService,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserRole = this.authService.getUserRole();
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      this.loadPatientData();
    });
  }

  loadPatientData() {
    this.loading = true;
    this.patientService.getPatientById(this.patientId)
      .subscribe({
        next: (data) => {
          this.patient = data;
          this.loading = false;

          this.loadAppointments();
          this.loadVitalsHistory();
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

  loadVitalsHistory() {
    this.vitalsService.getPatientVitals(this.patientId)
      .subscribe({
        next: (data) => {
          this.vitalsHistory = data;
        },
        error: (error) => {
          console.error('Error loading vitals history:', error);
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
    if (this.currentUserRole == 'Patient'){
      this.router.navigate(['patient', 'dashboard']);
    } else {
      this.router.navigate(['/patient']);
    }
  }

  editPatient() {
    this.router.navigate(['/patient', this.patientId, 'edit']);
  }
}