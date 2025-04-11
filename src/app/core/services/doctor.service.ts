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

  // Get all doctors
  getDoctors(): Observable<any> {
    return this.http.get(`${API_URL}/doctors`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            // Format doctors for dropdown
            return response.data.map((doctor: any) => ({
              label: `Dr. ${doctor.FirstName} ${doctor.LastName} - ${doctor.Specialization}`,
              value: doctor.DoctorID
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching doctors:', error);
          return throwError(() => error);
        })
      );
  }
}