import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { PharmacyService } from '../../../core/services/pharmacy.service';

import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-medicine-add',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './medicine-add.component.html',
  styleUrl: './medicine-add.component.scss'
})
export class MedicineAddComponent implements OnInit {
  medicine = {
    name: '',
    category: '',
    description: '',
    dosageForm: '',
    unitOfMeasure: '',
    genericName: '',
    manufacturer: '',
    isControlled: false
  };

  dosageFormOptions = [
    { label: 'Tablet', value: 'Tablet' },
    { label: 'Capsule', value: 'Capsule' },
    { label: 'Syrup', value: 'Syrup' },
    { label: 'Injection', value: 'Injection' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Ointment', value: 'Ointment' },
    { label: 'Drops', value: 'Drops' },
    { label: 'Inhaler', value: 'Inhaler' },
    { label: 'Spray', value: 'Spray' },
    { label: 'Powder', value: 'Powder' }
  ];

  unitOptions = [
    { label: 'mg', value: 'mg' },
    { label: 'g', value: 'g' },
    { label: 'ml', value: 'ml' },
    { label: 'mcg', value: 'mcg' },
    { label: 'IU', value: 'IU' },
    { label: 'mEq', value: 'mEq' },
    { label: '%', value: '%' }
  ];

  categoryOptions = [
    { label: 'Analgesic', value: 'Analgesic' },
    { label: 'Antibiotic', value: 'Antibiotic' },
    { label: 'Antiviral', value: 'Antiviral' },
    { label: 'Antifungal', value: 'Antifungal' },
    { label: 'Antihistamine', value: 'Antihistamine' },
    { label: 'Antihypertensive', value: 'Antihypertensive' },
    { label: 'Cardiovascular', value: 'Cardiovascular' },
    { label: 'Respiratory', value: 'Respiratory' },
    { label: 'Gastrointestinal', value: 'Gastrointestinal' },
    { label: 'Psychiatric', value: 'Psychiatric' },
    { label: 'Neurological', value: 'Neurological' },
    { label: 'Endocrine', value: 'Endocrine' },
    { label: 'Vitamins', value: 'Vitamins' },
    { label: 'Other', value: 'Other' }
  ];

  loading = false;

  constructor(
    private pharmacyService: PharmacyService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    this.pharmacyService.addMedicine(this.medicine)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Medicine added successfully'
          });
          
          setTimeout(() => {
            this.router.navigate(['/pharmacy']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to add medicine'
          });
        }
      });
  }

  validateForm(): boolean {
    if (!this.medicine.name) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Medicine name is required'
      });
      return false;
    }

    if (!this.medicine.category) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Category is required'
      });
      return false;
    }

    if (!this.medicine.dosageForm) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Dosage form is required'
      });
      return false;
    }

    if (!this.medicine.unitOfMeasure) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Unit of measure is required'
      });
      return false;
    }

    return true;
  }

  cancel() {
    this.router.navigate(['/pharmacy']);
  }
}