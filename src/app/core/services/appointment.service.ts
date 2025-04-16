import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) { }

  getAppointments(): Observable<any> {
    return this.http.get(`${API_URL}/appointments`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching appointments:', error);
          return throwError(() => error);
        })
      );
  }

  getAppointmentById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/appointments/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching appointment with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${API_URL}/appointments`, appointmentData)
      .pipe(
        catchError(error => {
          console.error('Error creating appointment:', error);
          return throwError(() => error);
        })
      );
  }

  getDoctorAppointments(doctorId: number): Observable<any> {
    return this.http.get(`${API_URL}/appointments/doctor/${doctorId}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error(`Error fetching appointments for doctor ${doctorId}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Update appointment status
  updateAppointmentStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${API_URL}/appointments/${id}/status`, { status })
      .pipe(
        catchError(error => {
          console.error(`Error updating appointment status:`, error);
          return throwError(() => error);
        })
      );
  }
}