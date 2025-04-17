import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';
import { AdminService } from '../../../../core/services/admin.service';
import { PrimeNgImports } from '../../../../primengModules';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: PrimeNgImports,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: any = null;
  loading = true;

  constructor(
    private adminService: AdminService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    this.adminService.getDashboardStats()
      .subscribe({
        next: (data) => {
          this.dashboardStats = data;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load dashboard statistics'
          });
          this.loading = false;
        }
      });
  }
}