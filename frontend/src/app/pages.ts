import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AiService, ProductService } from './services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:400px; margin: 100px auto; padding:2rem; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.1); background:white; font-family:sans-serif;">
      <h2 style="text-align:center; color:#1a1a1a;">SmartStore Login</h2>
      <p style="text-align:center; color:#666; font-size:0.9rem;">Advanced E-Commerce Platform</p>
      <input [(ngModel)]="email" placeholder="Email" style="width:100%; padding:1rem; margin-top:1.5rem; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
      <input [(ngModel)]="password" type="password" placeholder="Password" style="width:100%; padding:1rem; margin-top:1rem; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
      <button (click)="onLogin()" style="width:100%; padding:1rem; background:linear-gradient(135deg, #007bff, #0056b3); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:1.5rem;">Launch Dashboard</button>
      <p *ngIf="error" style="color:#d9534f; text-align:center; margin-top:1rem; font-size:0.9rem;">{{error}}</p>
    </div>
  `
})
export class LoginComponent {
  email = 'admin@smartstore.com';
  password = 'admin123';
  error = '';
  auth = inject(AuthService);
  router = inject(Router);

  onLogin() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        if (user.role === 'ADMIN') this.router.navigate(['/admin']);
        else if (user.role === 'MANAGER') this.router.navigate(['/manager']);
        else this.router.navigate(['/consumer']);
      },
      error: () => this.error = 'Invalid credentials'
    });
  }
}

@Component({
  selector: 'app-consumer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem; font-family:sans-serif;">
      <div class="products-section">
        <h2 style="color:#1a1a1a;">Available Products</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:1.5rem;">
          <div *ngFor="let p of products" style="padding:1rem; border:1px solid #eee; border-radius:12px; background:white; transition: 0.3s; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
            <h4 style="margin:0 0 0.5rem 0;">{{p.name}}</h4>
            <div style="color:#007bff; font-weight:bold; margin-bottom:0.5rem;">{{p.basePrice | currency}}</div>
            <button (click)="checkSentiment(p)" style="font-size:0.7rem; padding:0.4rem 0.8rem; border:1px solid #007bff; color:#007bff; background:transparent; border-radius:20px; cursor:pointer;">Analyze Vibes 🧠</button>
            <div *ngIf="sentiments[p.productId]" style="margin-top:0.5rem; font-size:0.8rem; padding:0.5rem; border-radius:8px;" [style.background]="sentiments[p.productId].averageScore > 0.5 ? '#d4edda' : '#f8d7da'">
               Review Sentiment: <b>{{sentiments[p.productId].sentimentLabel}}</b>
            </div>
          </div>
        </div>
      </div>
      
      <div class="ai-chat" style="background:#1a1a1a; color:white; padding:1.5rem; border-radius:16px; height:85vh; display:flex; flex-direction:column; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.5rem;">
           <span style="font-size:1.5rem;">🤖</span>
           <h3 style="margin:0; background:linear-gradient(to right, #007bff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">SmartStore AI Advisor</h3>
        </div>
        
        <div style="flex:1; overflow-y:auto; margin-bottom:1rem; padding-right:0.5rem;">
          <div *ngFor="let msg of chatMessages" [style.textAlign]="msg.sender === 'user' ? 'right' : 'left'" style="margin-bottom:1rem;">
            <div [style.background]="msg.sender === 'user' ? '#007bff' : '#2a2a2a'" [style.borderRadius]="msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'" style="display:inline-block; padding:0.8rem 1.2rem; max-width:85%; font-size:0.9rem; line-height:1.4;">
              {{msg.text}}
            </div>
          </div>
        </div>

        <div style="display:flex; background:#2a2a2a; padding:0.5rem; border-radius:10px;">
          <input [(ngModel)]="prompt" (keyup.enter)="sendQuery()" placeholder="Search data or ask questions..." style="flex:1; padding:0.8rem; background:transparent; border:none; color:white; outline:none;">
          <button (click)="sendQuery()" style="background:#007bff; color:white; border:none; width:40px; height:40px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;">➤</button>
        </div>
      </div>
    </div>
  `
})
export class ConsumerComponent implements OnInit {
  products: any[] = [];
  sentiments: any = {};
  prompt = '';
  chatMessages: any[] = [{ sender: 'ai', text: 'Welcome back! How can I assist with your shopping today?' }];
  history: string[] = [];

  auth = inject(AuthService);
  ai = inject(AiService);
  productService = inject(ProductService);

  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.products = res);
  }

  checkSentiment(p: any) {
    this.productService.getSentiment(p.productId).subscribe(res => {
      this.sentiments[p.productId] = res;
    });
  }

  sendQuery() {
    if (!this.prompt) return;
    const userMsg = this.prompt;
    this.chatMessages.push({ sender: 'user', text: userMsg });
    this.prompt = '';

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.ai.query(userMsg, user.userId || 1, user.role, this.history).subscribe(res => {
      this.chatMessages.push({ sender: 'ai', text: res.response });
      this.history.push(`User: ${userMsg}`, `AI: ${res.response}`);
    });
  }
}

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="font-family:sans-serif;">
      <h2 style="color:#1a1a1a;">Business Intelligence Dashboard</h2>
      <div style="grid-template-columns:repeat(3, 1fr); display:grid; gap:1rem; margin-bottom:2rem;">
        <div style="background:#007bff; color:white; padding:1.5rem; border-radius:12px;"><h4>Sales Flow</h4><p>Live Monitoring</p></div>
        <div style="background:#28a745; color:white; padding:1.5rem; border-radius:12px;"><h4>Inventory</h4><p>Optimal Levels</p></div>
        <div style="background:#6c757d; color:white; padding:1.5rem; border-radius:12px;"><h4>Reviews</h4><p>Sentiment Positive</p></div>
      </div>
      <table style="width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
        <tr style="background:#f8f9fa; text-align:left;">
          <th style="padding:1rem;">Product</th><th style="padding:1rem;">Category</th><th style="padding:1rem;">Base Price</th>
        </tr>
        <tr *ngFor="let p of products" style="border-top:1px solid #eee;">
          <td style="padding:1rem;">{{p.name}}</td><td style="padding:1rem;">{{p.category}}</td><td style="padding:1rem;">{{p.basePrice | currency}}</td>
        </tr>
      </table>
    </div>
  `
})
export class ManagerComponent implements OnInit {
  products: any[] = [];
  productService = inject(ProductService);
  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.products = res);
  }
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="font-family:sans-serif;">
       <h2 style="color:#1a1a1a;">System Administration</h2>
       <div style="background:#fff3cd; border:1px solid #ffeeba; padding:1rem; border-radius:8px; margin-bottom:1.5rem;">
          ⚠️ <b>Security Alert:</b> RBAC policies are strictly enforced. All database actions are logged.
       </div>
       <div style="background:white; padding:2rem; border-radius:12px; border:1px solid #eee;">
          <h4>Active Integration Logs (DS4, DS5, DS6)</h4>
          <p>ETL Pipeline Status: <b>OK</b></p>
          <p>Database Health (3NF): <b>Optimal</b></p>
       </div>
    </div>
  `
})
export class AdminComponent {}
