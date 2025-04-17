import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './pharmacy-dashboard.component.html',
  styleUrl: './pharmacy-dashboard.component.scss'
})
export class PharmacyDashboardComponent implements OnInit {
  medicines: any[] = [];
  inventory: any[] = [];
  
  loading = true;
  lowStockThreshold = 50;

  constructor(
    private pharmacyService: PharmacyService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
    this.loadInventory();
  }

  loadMedicines() {
    this.pharmacyService.getMedicines()
      .subscribe({
        next: (data: any[]) => {
          this.medicines = data;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load medicines'
          });
          this.loading = false;
        }
      });
  }

  loadInventory() {
    this.pharmacyService.getInventory()
      .subscribe({
        next: (data: any[]) => {
          this.inventory = data;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load inventory'
          });
        }
      });
  }

  getInventoryStatus(quantity: number): string {
    if (quantity <= 0) {
      return 'Out of Stock';
    } else if (quantity < this.lowStockThreshold) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  }

  getInventoryStatusColor(quantity: number): string {
    if (quantity <= 0) {
      return 'bg-red-100 text-red-700 border-round px-2 py-1';
    } else if (quantity < this.lowStockThreshold) {
      return 'bg-yellow-100 text-yellow-700 border-round px-2 py-1';
    } else {
      return 'bg-green-100 text-green-700 border-round px-2 py-1';
    }
  }

  getLowStockItems(): any[] {
    return this.inventory.filter(item => item.QuantityInStock < this.lowStockThreshold);
  }

  getExpiringItems(): any[] {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    return this.inventory.filter(item => {
      const expiryDate = new Date(item.ExpiryDate);
      return expiryDate <= threeMonthsLater && expiryDate >= today;
    });
  }
}