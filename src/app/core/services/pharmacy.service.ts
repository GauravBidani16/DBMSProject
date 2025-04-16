import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  constructor(private http: HttpClient) { }

  getMedicines(): Observable<any> {
    return this.http.get(`${API_URL}/pharmacy/medicines`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching medicines:', error);
          return throwError(() => error);
        })
      );
  }

  getMedicineById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/pharmacy/medicines/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching medicine with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  getInventory(): Observable<any> {
    return this.http.get(`${API_URL}/pharmacy/inventory`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching inventory:', error);
          return throwError(() => error);
        })
      );
  }

  addToInventory(inventoryData: any): Observable<any> {
    return this.http.post(`${API_URL}/pharmacy/inventory`, inventoryData)
      .pipe(
        catchError(error => {
          console.error('Error adding to inventory:', error);
          return throwError(() => error);
        })
      );
  }

  addMedicine(medicineData: any): Observable<any> {
    return this.http.post(`${API_URL}/pharmacy/medicines`, medicineData)
      .pipe(
        catchError(error => {
          console.error('Error adding medicine:', error);
          return throwError(() => error);
        })
      );
  }

  getPrescriptions(): Observable<any> {
    return this.http.get(`${API_URL}/pharmacy/prescriptions`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching prescriptions:', error);
          return throwError(() => error);
        })
      );
  }

  getPrescriptionById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/pharmacy/prescriptions/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching prescription with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  createPrescription(prescriptionData: any): Observable<any> {
    return this.http.post(`${API_URL}/pharmacy/prescriptions`, prescriptionData)
      .pipe(
        catchError(error => {
          console.error('Error creating prescription:', error);
          return throwError(() => error);
        })
      );
  }

  dispenseMedication(prescriptionDetailId: number, data: any): Observable<any> {
    return this.http.post(`${API_URL}/pharmacy/prescriptions/dispense/${prescriptionDetailId}`, data)
      .pipe(
        catchError(error => {
          console.error('Error dispensing medication:', error);
          return throwError(() => error);
        })
      );
  }

  getSuppliers(): Observable<any> {
    return this.http.get(`${API_URL}/pharmacy/suppliers`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching suppliers:', error);
          return throwError(() => error);
        })
      );
  }
}