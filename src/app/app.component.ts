import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from './core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    MenubarModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  items: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.updateMenu();
  }

  updateMenu() {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      
      // Basic menu items
      this.items = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: role === 'Admin' ? '/admin' : 
                     (role === 'Doctor' ? '/doctor' : '/patient')
        }
      ];
      
      // Additional menu items based on role
      if (role === 'Admin' || role === 'Doctor') {
        this.items.push(
          {
            label: 'Patients',
            icon: 'pi pi-users',
            routerLink: '/patients'
          },
          {
            label: 'Appointments',
            icon: 'pi pi-calendar',
            routerLink: '/appointments'
          }
        );
      }
      
      if (role === 'Admin') {
        this.items.push(
          {
            label: 'Administration',
            icon: 'pi pi-cog',
            items: [
              {
                label: 'Users',
                icon: 'pi pi-user-edit',
                routerLink: '/admin/users'
              },
              {
                label: 'Reports',
                icon: 'pi pi-chart-bar',
                routerLink: '/admin/reports'
              }
            ]
          }
        );
      }
    } else {
      this.items = [
        {
          label: 'Login',
          icon: 'pi pi-sign-in',
          routerLink: '/auth/login'
        }
      ];
    }
  }
  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  logout() {
    this.authService.logout();
    this.updateMenu();
  }
}
