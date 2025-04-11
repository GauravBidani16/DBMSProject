// src/app/core/services/billing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private http: HttpClient) { }

  // Get all services/billable items
  getServices(): Observable<any> {
    return this.http.get(`${API_URL}/billing/services`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching services:', error);
          return throwError(() => error);
        })
      );
  }

  // Get all bills
  getBills(): Observable<any> {
    return this.http.get(`${API_URL}/billing/bills`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching bills:', error);
          return throwError(() => error);
        })
      );
  }

  // Get bill by ID
  getBillById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/billing/bills/${id}`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error(`Error fetching bill with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Create new bill
  createBill(billData: any): Observable<any> {
    return this.http.post(`${API_URL}/billing/bills`, billData)
      .pipe(
        catchError(error => {
          console.error('Error creating bill:', error);
          return throwError(() => error);
        })
      );
  }

  // Update bill status
  updateBillStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${API_URL}/billing/bills/${id}/status`, { status })
      .pipe(
        catchError(error => {
          console.error('Error updating bill status:', error);
          return throwError(() => error);
        })
      );
  }

  // Get payment methods
  getPaymentMethods(): Observable<any> {
    return this.http.get(`${API_URL}/billing/payment-methods`)
      .pipe(
        map((response: any) => {
          if (response && response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching payment methods:', error);
          return throwError(() => error);
        })
      );
  }

  // Record payment
  recordPayment(paymentData: any): Observable<any> {
    return this.http.post(`${API_URL}/billing/payments`, paymentData)
      .pipe(
        catchError(error => {
          console.error('Error recording payment:', error);
          return throwError(() => error);
        })
      );
  }
}