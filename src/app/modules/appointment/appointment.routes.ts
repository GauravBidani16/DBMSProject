import { Routes } from '@angular/router';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';

export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    component: AppointmentListComponent
  },
  {
    path: 'create',
    component: AppointmentFormComponent
  }
];