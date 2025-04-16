import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';

import { BillingService } from '../../../core/services/billing.service';
import { PrimeNgImports } from '../../../primengModules';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './billing-dashboard.component.html',
  styleUrl: './billing-dashboard.component.scss'
})
export class BillingDashboardComponent implements OnInit {
  bills: any[] = [];
  filteredBills: any[] = [];
  loading = true;
  
  searchText: string = '';
  selectedStatus: any = null;
  
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Draft', value: 'Draft' },
    { label: 'Issued', value: 'Issued' },
    { label: 'Partially Paid', value: 'Partially Paid' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Overdue', value: 'Overdue' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  constructor(
    private billingService: BillingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills() {
    this.billingService.getBills()
      .subscribe({
        next: (data) => {
          this.bills = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load bills'
          });
          this.loading = false;
        }
      });
  }

  applyFilters() {
    this.filteredBills = this.bills.filter(bill => {
      if (this.selectedStatus && bill.Status !== this.selectedStatus) {
        return false;
      }
      
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        return bill.PatientName.toLowerCase().includes(searchLower) ||
               bill.BillID.toString().includes(searchLower);
      }
      
      return true;
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partially Paid':
        return 'warning';
      case 'Issued':
        return 'info';
      case 'Draft':
        return 'secondary';
      case 'Overdue':
        return 'danger';
      case 'Cancelled':
        return 'danger';
      default:
        return null;
    }
  }

  getOverdueBills() {
    return this.bills.filter(bill => bill.Status === 'Overdue').length;
  }

  getPendingBills() {
    return this.bills.filter(bill => bill.Status === 'Issued' || bill.Status === 'Partially Paid').length;
  }

  getTotalRevenue() {
    return this.bills
      .filter(bill => bill.Status === 'Paid' || bill.Status === 'Partially Paid')
      .reduce((total, bill) => {
        if (bill.Status === 'Paid') {
          return total + bill.TotalAmount;
        } else {
          return total + (bill.TotalAmount * 0.5);
        }
      }, 0);
  }
}