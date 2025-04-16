// src/app/modules/pharmacy/pharmacy.routes.ts
import { Routes } from '@angular/router';
import { PharmacyDashboardComponent } from './pharmacy-dashboard/pharmacy-dashboard.component';
import { InventoryAddComponent } from './inventory-add/inventory-add.component';
import { MedicineAddComponent } from './medicine-add/medicine-add.component';

export const PHARMACY_ROUTES: Routes = [
  {
    path: '',
    component: PharmacyDashboardComponent
  },
  {
    path: 'inventory/add',
    component: InventoryAddComponent
  },
  {
    path: 'medicines/add',
    component: MedicineAddComponent
  }
];