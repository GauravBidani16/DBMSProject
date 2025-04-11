import { Routes } from '@angular/router';
import { DoctorDashboardComponent } from './dashboard/doctor-dashboard/doctor-dashboard.component';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    component: DoctorDashboardComponent
  }
];