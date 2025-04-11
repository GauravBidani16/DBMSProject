// src/app/modules/vitals/vitals.routes.ts
import { Routes } from '@angular/router';
import { VitalsAddComponent } from './vitals-add/vitals-add.component';

export const VITALS_ROUTES: Routes = [
  {
    path: 'log',
    component: VitalsAddComponent
  }
];