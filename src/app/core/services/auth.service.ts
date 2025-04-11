// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  register(registrationData: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/register`, registrationData)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/login`, { email, password })
      .pipe(
        map(response => {
          // Store user details and token in local storage to keep user logged in
          if (response && response.success && response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }
  

  logout(): void {
    // Remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  getUserRole(): string | null {
    return this.currentUserValue ? this.currentUserValue.role : null;
  }
}