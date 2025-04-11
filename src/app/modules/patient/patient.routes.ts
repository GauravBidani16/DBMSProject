import { Routes } from '@angular/router';
import { PatientDashboardComponent } from './dashboard/patient-dashboard/patient-dashboard.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { PatientEditComponent } from './patient-edit/patient-edit.component';
import { PatientListComponent } from './patient-list/patient-list.component';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    component: PatientListComponent
  },
  {
    path: 'dashboard',
    component: PatientDashboardComponent
  },
  {
    path: 'new',
    component: PatientEditComponent
  },
  {
    path: ':id',
    component: PatientDetailComponent
  },
  {
    path: ':id/edit',
    component: PatientEditComponent
  }
];