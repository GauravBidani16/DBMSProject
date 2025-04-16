// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// PrimeNG
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

import { AuthService } from './core/services/auth.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MenubarModule,
    ButtonModule,
    ToastModule
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  items: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.updateMenu();

    // Update menu when user logs in/out
    this.authService.currentUser.subscribe(() => {
      this.updateMenu();
    });
  }

  updateMenu() {
    if (this.isLoggedIn()) {
      const role = this.authService.getUserRole();
      
      // Basic menu items
      this.items = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: role === 'Admin' ? '/admin' : 
                     (role === 'Doctor' ? '/doctor' : '/patient/dashboard')
        }
      ];
      
      // Admin gets access to all modules
      if (role === 'Admin') {
        this.items.push(
          {
            label: 'Patient Management',
            icon: 'pi pi-users',
            items: [
              {
                label: 'All Patients',
                icon: 'pi pi-list',
                routerLink: '/patient'
              },
              {
                label: 'Add Patient',
                icon: 'pi pi-user-plus',
                routerLink: '/patient/new'
              }
            ]
          },
          {
            label: 'Register Doctor',
            icon: 'pi pi-user-edit',
            routerLink: '/admin/register-doctor'
          },
          {
            label: 'Appointments',
            icon: 'pi pi-calendar',
            routerLink: '/appointment'
          },
          {
            label: 'Beds Management',
            icon: 'pi pi-th-large',
            routerLink: '/beds'
          },
          {
            label: 'Pharmacy',
            icon: 'pi pi-briefcase',
            items: [
              {
                label: 'Dashboard',
                icon: 'pi pi-home',
                routerLink: '/pharmacy'
              },
              {
                label: 'Add Inventory',
                icon: 'pi pi-plus',
                routerLink: '/pharmacy/inventory/add'
              },
              {
                label: 'Add Medicine',
                icon: 'pi pi-plus',
                routerLink: '/pharmacy/medicines/add'
              }
            ]
          },
          {
            label: 'Vitals',
            icon: 'pi pi-heart',
            routerLink: '/vitals/log'
          }
        );
      }
      
      // Doctor gets access to patients, appointments, pharmacy, and vitals
      else if (role === 'Doctor') {
        this.items.push(
          {
            label: 'Patients',
            icon: 'pi pi-users',
            routerLink: '/patient'
          },
          {
            label: 'Appointments',
            icon: 'pi pi-calendar',
            routerLink: '/appointment'
          },
          {
            label: 'Beds Management',
            icon: 'pi pi-th-large',
            routerLink: '/beds'
          },
          {
            label: 'Pharmacy',
            icon: 'pi pi-briefcase',
            routerLink: '/pharmacy'
          },
          {
            label: 'Record Vitals',
            icon: 'pi pi-heart',
            routerLink: '/vitals/log'
          }
        );
      }
      
      // Patient gets access to their appointments, vitals, and prescriptions
      else if (role === 'Patient') {
        this.items.push(
          {
            label: 'My Profile',
            icon: 'pi pi-user',
            routerLink: `/patient/${this.authService.currentUserValue.patientId}`
          },
          {
            label: 'Appointments',
            icon: 'pi pi-calendar',
            routerLink: '/appointment'
          },
          {
            label: 'My Vitals',
            icon: 'pi pi-heart',
            routerLink: `/patient/${this.authService.currentUserValue.patientId}`
          }
        );
      }
    } else {
      this.items = [
        {
          label: 'Login',
          icon: 'pi pi-sign-in',
          routerLink: '/auth/login'
        },
        {
          label: 'Register',
          icon: 'pi pi-user-plus',
          routerLink: '/auth/register'
        }
      ];
    }
  }
  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  logout() {
    this.authService.logout();
  }
}