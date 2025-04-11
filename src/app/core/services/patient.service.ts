// src/app/core/services/patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  // Get all patients
  getAllPatients(): Observable<any> {
    return this.http.get(`${API_URL}/patients`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching patients:', error);
          return throwError(() => error);
        })
      );
  }

  // Get patient by ID
  getPatientById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/patients/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching patient with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Update patient information
  updatePatient(id: number, patientData: any): Observable<any> {
    return this.http.put(`${API_URL}/patients/${id}`, patientData)
      .pipe(
        catchError(error => {
          console.error('Error updating patient:', error);
          return throwError(() => error);
        })
      );
  }

  // Get patient's medical history
  getPatientMedicalHistory(id: number): Observable<any> {
    return this.http.get(`${API_URL}/patients/${id}/history`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error(`Error fetching medical history for patient ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Get patient's appointments
  getPatientAppointments(id: number): Observable<any> {
    return this.http.get(`${API_URL}/appointments/patient/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error(`Error fetching appointments for patient ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Get patient's prescriptions
  getPatientPrescriptions(id: number): Observable<any> {
    return this.http.get(`${API_URL}/pharmacy/prescriptions/patient/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error(`Error fetching prescriptions for patient ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
}