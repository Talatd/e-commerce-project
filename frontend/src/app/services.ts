import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, Subject } from 'rxjs';

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
  get currentUserValue() { return this.currentUserSubject.value; }

  updateUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
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

  submitReview(productId: number, userId: number, rating: number, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/reviews`, { userId, rating, comment });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/orders';

  createOrder(order: any): Observable<any> {
    return this.http.post(this.apiUrl, order);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/stores';

  getStores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/users');
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/orders');
  }

  getStats(): Observable<any> {
    return this.http.get('http://localhost:8080/api/v1/analytics/admin-stats');
  }

  banUser(id: number): Observable<any> {
    return this.http.post(`http://localhost:8080/api/users/${id}/ban`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/users/${id}`);
  }

  getSalesBreakdown(): Observable<any> {
    return this.http.get('http://localhost:8080/api/v1/analytics/sales-breakdown');
  }
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<{msg: string, type: 'success' | 'error' | 'info'}>();
  toasts$ = this.toastSubject.asObservable();

  show(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastSubject.next({msg, type});
  }
}
