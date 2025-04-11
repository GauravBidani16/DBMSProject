import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {

  patientStatistics = [
    { month: 'January', admissions: 65, discharged: 28, revenue: 75000 },
    { month: 'February', admissions: 59, discharged: 48, revenue: 68000 },
    { month: 'March', admissions: 80, discharged: 40, revenue: 82000 },
    { month: 'April', admissions: 81, discharged: 19, revenue: 85000 },
    { month: 'May', admissions: 56, discharged: 86, revenue: 62000 },
    { month: 'June', admissions: 55, discharged: 27, revenue: 59000 },
    { month: 'July', admissions: 40, discharged: 90, revenue: 47000 }
  ];

}
