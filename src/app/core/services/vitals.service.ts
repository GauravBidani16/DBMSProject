// src/app/core/services/vitals.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class VitalsService {

  constructor(private http: HttpClient) { }

  // Get patient vitals logs
  getPatientVitals(patientId: number): Observable<any> {
    return this.http.get(`${API_URL}/vitals/patient/${patientId}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching vitals:', error);
          return throwError(() => error);
        })
      );
  }

  // Add new vitals log
  addVitals(vitalsData: any): Observable<any> {
    return this.http.post(`${API_URL}/vitals`, vitalsData)
      .pipe(
        catchError(error => {
          console.error('Error adding vitals:', error);
          return throwError(() => error);
        })
      );
  }

  // Get vitals log by ID
  getVitalsById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/vitals/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching vitals with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
}