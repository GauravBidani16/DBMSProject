import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule
  ],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss'
})
export class DoctorDashboardComponent {
  todayAppointments = [
    { id: 1, patientName: 'John Smith', time: '09:00 AM', type: 'Check-up', status: 'Scheduled' },
    { id: 2, patientName: 'Mary Johnson', time: '10:30 AM', type: 'Follow-up', status: 'Completed' },
    { id: 3, patientName: 'Robert Davis', time: '11:45 AM', type: 'Consultation', status: 'Cancelled' },
    { id: 4, patientName: 'Sarah Wilson', time: '02:15 PM', type: 'Check-up', status: 'Scheduled' },
    { id: 5, patientName: 'Michael Brown', time: '03:30 PM', type: 'Emergency', status: 'Waiting' }
  ];
  
  recentPatients = [
    { id: 101, name: 'Emma Thompson', age: 45, lastVisit: '2025-03-28', condition: 'Hypertension' },
    { id: 102, name: 'David Miller', age: 32, lastVisit: '2025-04-01', condition: 'Diabetes Type 2' },
    { id: 103, name: 'Lisa Clark', age: 28, lastVisit: '2025-04-02', condition: 'Pregnancy' },
    { id: 104, name: 'James Wilson', age: 56, lastVisit: '2025-04-03', condition: 'Arthritis' }
  ];
  
  patientStatistics = [
    { condition: 'Hypertension', count: 25, percentage: 18 },
    { condition: 'Diabetes', count: 18, percentage: 13 },
    { condition: 'Asthma', count: 14, percentage: 10 },
    { condition: 'Arthritis', count: 11, percentage: 8 },
    { condition: 'Heart Disease', count: 8, percentage: 6 },
    { condition: 'Other', count: 62, percentage: 45 }
  ];
  
  getSeverity(status: string) {
    switch (status) {
      case 'Scheduled':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      case 'Waiting':
        return 'warning';
      default:
        return 'info';
    }
  }

}
