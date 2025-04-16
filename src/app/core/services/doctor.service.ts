// src/app/core/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private http: HttpClient) { }

  getDoctors(): Observable<any> {
    return this.http.get(`${API_URL}/doctors`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching doctors:', error);
          return throwError(() => error);
        })
      );
  }

  // Get doctor by ID
  getDoctorById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/doctors/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching doctor with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  getDepartments(): Observable<any> {
    return this.http.get(`${API_URL}/doctors/department`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching departments:', error);
          return throwError(() => error);
        })
      );
  }

  registerDoctor(doctorData: any): Observable<any> {
    return this.http.post(`${API_URL}/doctors`, doctorData)
      .pipe(
        catchError(error => {
          console.error('Error registering doctor:', error);
          return throwError(() => error);
        })
      );
  }
}