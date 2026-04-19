import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, Subject } from 'rxjs';
const API = 'http://localhost:8080';
const AI_API = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${API}/api/v1/auth`;

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

  register(data: { email: string; fullName: string; passwordHash: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
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
    localStorage.removeItem('cart');
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
  private aiUrl = `${AI_API}/api/v1/chatbot/query`;
  sessionId: string | null = null;

  query(prompt: string, userId: number, role: string, history: string[]): Observable<any> {
    return this.http.post(this.aiUrl, {
      query: prompt,
      user_id: userId,
      role: role,
      history: history,
      session_id: this.sessionId,
    }).pipe(tap((res: any) => {
      if (res.session_id) this.sessionId = res.session_id;
    }));
  }

  clearSession() {
    this.sessionId = null;
  }
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${API}/api/v1/products`;

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/reviews`);
  }

  getSentiment(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}/reviews/sentiment`);
  }

  submitReview(productId: number, rating: number, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/reviews`, { rating, comment });
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
  private apiUrl = `${API}/api/v1/orders`;

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
  private apiUrl = `${API}/api/v1/stores`;

  getStores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/api/v1/admin/users`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/api/v1/orders`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${API}/api/v1/analytics/admin-stats`);
  }

  banUser(id: number): Observable<any> {
    return this.http.post(`${API}/api/v1/admin/users/${id}/ban`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${API}/api/v1/admin/users/${id}`);
  }

  getSalesBreakdown(): Observable<any> {
    return this.http.get(`${API}/api/v1/analytics/sales-breakdown`);
  }

  getStoreComparison(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/api/v1/analytics/store-comparison`);
  }
}

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private http = inject(HttpClient);
  private apiUrl = `${API}/api/v1/shipments`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getByOrder(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/${orderId}`);
  }

  track(trackingNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/track/${trackingNumber}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${API}/api/v1/categories`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTree(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tree`);
  }

  create(category: any): Observable<any> {
    return this.http.post(this.apiUrl, category);
  }

  update(id: number, category: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, category);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CustomerProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${API}/api/v1/profiles`;

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  getByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  save(profile: any): Observable<any> {
    return this.http.post(this.apiUrl, profile);
  }
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  ask(query: string, history: string[] = []): Observable<any> {
    return this.http.post(`${API}/api/v1/chat/ask`, { query, history });
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
