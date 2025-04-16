import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { DoctorRegisterComponent } from './doctor-register/doctor-register.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'register-doctor',
    component: DoctorRegisterComponent
  }
];