import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, Subject, of, map, catchError } from 'rxjs';
import { apiRoot } from '../environments/environment';

const API_V1 = apiRoot();

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private httpBackend = inject(HttpBackend);
  private router = inject(Router);
  /** Avoids interceptor recursion when refreshing tokens. */
  private refreshHttp = new HttpClient(this.httpBackend);
  private apiUrl = `${API_V1}/auth`;

  private currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  currentUser$ = this.currentUserSubject.asObservable();

  private persistSession(res: any) {
    localStorage.setItem('token', res.token);
    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    const prev = JSON.parse(localStorage.getItem('user') || '{}');
    const merged = {
      ...prev,
      ...res,
      token: res.token,
      refreshToken: res.refreshToken,
      userId: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
    };
    localStorage.setItem('user', JSON.stringify(merged));
    this.currentUserSubject.next(merged);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => this.persistSession(user))
    );
  }

  register(data: { email: string; fullName: string; passwordHash: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((user: any) => this.persistSession(user))
    );
  }

  /** Google OAuth access token → app session (backend verifies token with Google userinfo). */
  loginWithGoogleAccessToken(accessToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google`, { accessToken }).pipe(
      tap((user: any) => this.persistSession(user))
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  /** Uses HttpBackend client so the global interceptor does not recurse. */
  refreshAccessToken(): Observable<boolean> {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) {
      return of(false);
    }
    return this.refreshHttp.post<any>(`${this.apiUrl}/refresh`, { refreshToken: rt }).pipe(
      tap((res) => this.persistSession(res)),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('cart');
    this.currentUserSubject.next(null);
    this.router.navigate(['/'], { replaceUrl: true });
  }

  get token() { return localStorage.getItem('token'); }
  get role() { return this.currentUserSubject.value?.role; }
  get currentUserValue() { return this.currentUserSubject.value; }

  updateUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword });
  }
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  /** Proxied through Spring Boot so JWT + user context are enforced server-side. */
  private chatUrl = `${API_V1}/chat/ask`;
  private chatStreamUrl = `${API_V1}/chat/ask/stream`;
  sessionId: string | null = null;

  query(prompt: string, history: string[]): Observable<any> {
    return this.http.post(this.chatUrl, {
      query: prompt,
      history: history,
      session_id: this.sessionId,
    }).pipe(tap((res: any) => {
      if (res.session_id) this.sessionId = res.session_id;
    }));
  }

  queryStream(prompt: string, history: string[],
              onStep: (step: any) => void, onFinal: (result: any) => void, onError: (err: string) => void) {
    const body = JSON.stringify({
      query: prompt, history, session_id: this.sessionId
    });
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(this.chatStreamUrl, {
      method: 'POST',
      headers,
      body,
    }).then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) { onError('No response stream'); return; }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === 'step') onStep(parsed);
              else if (parsed.type === 'final') {
                if (parsed.session_id) this.sessionId = parsed.session_id;
                onFinal(parsed);
              }
              else if (parsed.type === 'error') onError(parsed.message);
            } catch {}
          }
        }
      }
    }).catch(err => onError(err.message || 'Stream failed'));
  }

  clearSession() {
    this.sessionId = null;
  }
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${API_V1}/products`;

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMyStoreProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-store`);
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

  getAllReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews/all`);
  }

  respondToReview(reviewId: number, response: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reviews/${reviewId}/respond`, { response });
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${API_V1}/orders`;

  createOrder(order: any): Observable<any> {
    return this.http.post(this.apiUrl, order);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMyOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private http = inject(HttpClient);
  private apiUrl = `${API_V1}/stores`;

  getStores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API_V1}/admin/users`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${API_V1}/orders`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${API_V1}/analytics/admin-stats`);
  }

  banUser(id: number): Observable<any> {
    return this.http.post(`${API_V1}/admin/users/${id}/ban`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${API_V1}/admin/users/${id}`);
  }

  getSalesBreakdown(): Observable<any> {
    return this.http.get(`${API_V1}/analytics/sales-breakdown`);
  }

  getStoreComparison(): Observable<any[]> {
    return this.http.get<any[]>(`${API_V1}/analytics/store-comparison`);
  }

  getCustomerSegments(): Observable<any> {
    return this.http.get(`${API_V1}/analytics/customer-segments`);
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${API_V1}/admin/audit-logs`);
  }

  createAuditLog(action: string, type: string, detail: string): Observable<any> {
    return this.http.post(`${API_V1}/admin/audit-logs`, { action, type, detail });
  }
}

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private http = inject(HttpClient);
  private apiUrl = `${API_V1}/shipments`;

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
  private apiUrl = `${API_V1}/categories`;

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
  private apiUrl = `${API_V1}/profiles`;

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
    return this.http.post(`${API_V1}/chat/ask`, { query, history });
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
