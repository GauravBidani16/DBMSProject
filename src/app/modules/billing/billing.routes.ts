// src/app/modules/billing/billing.routes.ts
import { Routes } from '@angular/router';
import { BillingDashboardComponent } from './billing-dashboard/billing-dashboard.component';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    component: BillingDashboardComponent
  }
];