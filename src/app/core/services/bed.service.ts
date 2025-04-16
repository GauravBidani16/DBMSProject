import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class BedService {

  constructor(private http: HttpClient) { }

  getRoomTypes(): Observable<any> {
    return this.http.get(`${API_URL}/beds/room-types`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching room types:', error);
          return throwError(() => error);
        })
      );
  }

  getRooms(): Observable<any> {
    return this.http.get(`${API_URL}/beds/rooms`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching rooms:', error);
          return throwError(() => error);
        })
      );
  }

  getAllBeds(): Observable<any> {
    return this.http.get(`${API_URL}/beds/beds`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching beds:', error);
          return throwError(() => error);
        })
      );
  }

  getAvailableBeds(): Observable<any> {
    return this.http.get(`${API_URL}/beds/beds/available`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching available beds:', error);
          return throwError(() => error);
        })
      );
  }

  getCurrentAdmissions(): Observable<any> {
    return this.http.get(`${API_URL}/beds/admissions`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching admissions:', error);
          return throwError(() => error);
        })
      );
  }

  getAdmissionById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/beds/admissions/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching admission with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  admitPatient(admissionData: any): Observable<any> {
    return this.http.post(`${API_URL}/beds/admissions`, admissionData)
      .pipe(
        catchError(error => {
          console.error('Error admitting patient:', error);
          return throwError(() => error);
        })
      );
  }

  dischargePatient(admissionId: number, data: any): Observable<any> {
    return this.http.post(`${API_URL}/beds/admissions/${admissionId}/discharge`, data)
      .pipe(
        catchError(error => {
          console.error('Error discharging patient:', error);
          return throwError(() => error);
        })
      );
  }

  transferPatient(admissionId: number, data: any): Observable<any> {
    return this.http.post(`${API_URL}/beds/admissions/${admissionId}/transfer`, data)
      .pipe(
        catchError(error => {
          console.error('Error transferring patient:', error);
          return throwError(() => error);
        })
      );
  }

  addRoom(roomData: any): Observable<any> {
    return this.http.post(`${API_URL}/beds/rooms`, roomData)
      .pipe(
        catchError(error => {
          console.error('Error adding room:', error);
          return throwError(() => error);
        })
      );
  }

  addRoomType(roomTypeData: any): Observable<any> {
    return this.http.post(`${API_URL}/beds/room-types`, roomTypeData)
      .pipe(
        catchError(error => {
          console.error('Error adding room type:', error);
          return throwError(() => error);
        })
      );
  }
}