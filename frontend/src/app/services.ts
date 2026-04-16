import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/auth';
  
  private currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', user.token);
        this.currentUserSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  get token() { return localStorage.getItem('token'); }
  get role() { return this.currentUserSubject.value?.role; }
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private aiUrl = 'http://localhost:8000/api/v1/chatbot/query';

  query(prompt: string, userId: number, role: string, history: string[]): Observable<any> {
    return this.http.post(this.aiUrl, { query: prompt, user_id: userId, role: role, history: history });
  }
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/products';

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSentiment(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}/reviews/sentiment`);
  }
}
