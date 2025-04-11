import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'doctor',
    loadChildren: () => import('./modules/doctor/doctor.routes').then(m => m.DOCTOR_ROUTES)
  },
  {
    path: 'patient',
    loadChildren: () => import('./modules/patient/patient.routes').then(m => m.PATIENT_ROUTES)
  },
  {
    path: 'appointment',
    loadChildren: () => import('./modules/appointment/appointment.routes').then(m => m.APPOINTMENT_ROUTES)
  },
  {
    path: 'beds',
    loadChildren: () => import('./modules/bed-management/bed-management.routes').then(m => m.BED_MANAGEMENT_ROUTES)
  },
  {
    path: 'pharmacy',
    loadChildren: () => import('./modules/pharmacy/pharmacy.routes').then(m => m.PHARMACY_ROUTES)
  },
  {
    path: 'billing',
    loadChildren: () => import('./modules/billing/billing.routes').then(m => m.BILLING_ROUTES)
  },
  {
    path: 'vitals',
    loadChildren: () => import('./modules/vitals/vitals.routes').then(m => m.VITALS_ROUTES)
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];