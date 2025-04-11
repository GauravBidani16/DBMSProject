// src/app/modules/pharmacy/inventory-add/inventory-add.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PharmacyService } from '../../../core/services/pharmacy.service';

@Component({
  selector: 'app-inventory-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: './inventory-add.component.html',
  styleUrl: './inventory-add.component.scss'
})
export class InventoryAddComponent implements OnInit {
  inventoryItem: any = {
    medicineId: null,
    batchNumber: '',
    supplierId: null,
    purchaseDate: new Date(),
    expiryDate: null,
    quantityReceived: null,
    unitCost: null,
    sellingPrice: null,
    storageLocation: ''
  };

  medicines: any[] = [];
  suppliers: any[] = [];
  
  maxDate = new Date();
  minDate = new Date();
  loading = false;

  constructor(
    private pharmacyService: PharmacyService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
    this.loadSuppliers();
  }

  loadMedicines() {
    this.pharmacyService.getMedicines()
      .subscribe({
        next: (data) => {
          this.medicines = data.map((medicine: any) => ({
            label: medicine.Name,
            value: medicine.MedicineID
          }));
        },
        error: (error) => {
          console.error('Error loading medicines:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load medicines'
          });
        }
      });
  }

  loadSuppliers() {
    this.pharmacyService.getSuppliers()
      .subscribe({
        next: (data) => {
          this.suppliers = data.map((supplier: any) => ({
            label: supplier.Name,
            value: supplier.SupplierID
          }));
        },
        error: (error) => {
          console.error('Error loading suppliers:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load suppliers'
          });
        }
      });
  }

  submitForm() {
    // Validate the form
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Format dates
    const formattedData = {
      ...this.inventoryItem,
      purchaseDate: this.formatDate(this.inventoryItem.purchaseDate),
      expiryDate: this.formatDate(this.inventoryItem.expiryDate)
    };

    this.pharmacyService.addToInventory(formattedData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Inventory added successfully'
          });
          
          // Navigate back to pharmacy dashboard after a short delay
          setTimeout(() => {
            this.router.navigate(['/pharmacy']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to add inventory'
          });
        }
      });
  }

  validateForm(): boolean {
    if (!this.inventoryItem.medicineId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please select a medicine'
      });
      return false;
    }

    if (!this.inventoryItem.batchNumber) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Batch number is required'
      });
      return false;
    }

    if (!this.inventoryItem.supplierId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please select a supplier'
      });
      return false;
    }

    if (!this.inventoryItem.expiryDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Expiry date is required'
      });
      return false;
    }

    if (!this.inventoryItem.quantityReceived || this.inventoryItem.quantityReceived <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Quantity must be greater than zero'
      });
      return false;
    }

    if (!this.inventoryItem.unitCost || this.inventoryItem.unitCost <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Unit cost must be greater than zero'
      });
      return false;
    }

    if (!this.inventoryItem.sellingPrice || this.inventoryItem.sellingPrice <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Selling price must be greater than zero'
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
    this.router.navigate(['/pharmacy']);
  }
}