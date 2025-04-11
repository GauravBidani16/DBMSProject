// src/app/modules/bed-management/bed-management.routes.ts
import { Routes } from '@angular/router';
import { BedDashboardComponent } from './bed-dashboard/bed-dashboard.component';

export const BED_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: BedDashboardComponent
  }
];