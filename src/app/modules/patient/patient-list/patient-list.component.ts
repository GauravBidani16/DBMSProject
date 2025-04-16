import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { PatientService } from '../../../core/services/patient.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];
  loading = false;
  searchText = '';

  constructor(
    private patientService: PatientService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.patientService.getAllPatients()
      .subscribe({
        next: (data) => {
          this.patients = data;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load patients'
          });
          this.loading = false;
        }
      });
  }

  viewPatient(patientId: number) {
    this.router.navigate(['/patient', patientId]);
  }

  addNewPatient() {
    this.router.navigate(['/patient', 'new']);
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

  filterPatients() {
    if (!this.searchText) {
      return this.patients;
    }
    
    const searchLower = this.searchText.toLowerCase();
    return this.patients.filter(patient => 
      patient.FirstName.toLowerCase().includes(searchLower) ||
      patient.LastName.toLowerCase().includes(searchLower) ||
      patient.Email.toLowerCase().includes(searchLower) ||
      patient.PhoneNumber.includes(this.searchText)
    );
  }
}