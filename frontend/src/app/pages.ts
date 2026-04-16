import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AiService } from './services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:400px; margin: 100px auto; padding:2rem; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.1); background:white;">
      <h2 style="text-align:center; margin-bottom:1.5rem;">SmartStore Login</h2>
      <input [(ngModel)]="email" placeholder="Email" style="width:100%; padding:0.8rem; margin-bottom:1rem; border:1px solid #ddd; border-radius:6px;">
      <input [(ngModel)]="password" type="password" placeholder="Password" style="width:100%; padding:0.8rem; margin-bottom:1rem; border:1px solid #ddd; border-radius:6px;">
      <button (click)="onLogin()" style="width:100%; padding:1rem; background:#007bff; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Login</button>
      <p *ngIf="error" style="color:red; text-align:center; margin-top:1rem;">{{error}}</p>
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
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
      <div class="main-content">
        <h3>Welcome, {{auth.currentUser$ | async | json}}</h3>
        <p>Browse our catalog or talk to the AI advisor.</p>
        <div style="background:#f4f7f6; height:300px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#888;">
          [ Product List Component Placeholder ]
        </div>
      </div>
      
      <div class="ai-chat" style="background:#1a1a1a; color:white; padding:1.5rem; border-radius:12px; height:80vh; display:flex; flexDirection:column;">
        <h4 style="color:#007bff; margin-top:0;">🤖 SmartStore Advisor</h4>
        <div style="flex:1; overflow-y:auto; margin-bottom:1rem; font-size:0.9rem;">
          <div *ngFor="let msg of messages" [style.textAlign]="msg.sender === 'user' ? 'right' : 'left'" style="margin-bottom:0.8rem;">
            <div [style.background]="msg.sender === 'user' ? '#007bff' : '#333'" style="display:inline-block; padding:0.6rem 1rem; border-radius:12px; max-width:80%;">
              {{msg.text}}
            </div>
          </div>
        </div>
        <div style="display:flex;">
          <input [(ngModel)]="prompt" (keyup.enter)="sendQuery()" placeholder="Ask anything about products..." style="flex:1; padding:0.8rem; background:#333; border:none; color:white; border-radius:6px 0 0 6px;">
          <button (click)="sendQuery()" style="background:#007bff; color:white; border:none; padding:1rem; border-radius:0 6px 6px 0; cursor:pointer;">Send</button>
        </div>
      </div>
    </div>
  `
})
export class ConsumerComponent {
  prompt = '';
  messages: any[] = [{ sender: 'ai', text: 'Hello! I am your Technical Advisor. How can I help you today?' }];
  auth = inject(AuthService);
  ai = inject(AiService);

  sendQuery() {
    if (!this.prompt) return;
    const userMsg = this.prompt;
    this.messages.push({ sender: 'user', text: userMsg });
    this.prompt = '';

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.ai.query(userMsg, user.userId || 1, user.role).subscribe(res => {
      this.messages.push({ sender: 'ai', text: res.response });
    });
  }
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `<h3>Admin Control Center</h3><p>System health and User management logic goes here.</p>`
})
export class AdminComponent {}

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule],
  template: `<h3>Manager Dashboard</h3><p>Sales analytics and Inventory reports go here.</p>`
})
export class ManagerComponent {}
