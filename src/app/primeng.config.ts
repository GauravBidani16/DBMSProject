import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';


const PRIMENG_MODULES = [
  CommonModule,
  RouterModule,
  CardModule,
  ButtonModule,
  TableModule,
  ToastModule,
  TabViewModule
];

@NgModule({
  imports: [...PRIMENG_MODULES],
  exports: PRIMENG_MODULES
})
export class PrimeNgModules {}