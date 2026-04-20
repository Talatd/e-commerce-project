import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div
      style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;"
    >
      <p style="font-family:'Playfair Display',serif;font-size:28px;margin-bottom:8px;">Page not found</p>
      <p style="font-size:13px;color:var(--text2);margin-bottom:24px;">This URL does not exist in Nexus.</p>
      <div style="display:flex;gap:12px;">
        <a
          routerLink="/"
          style="padding:10px 20px;border-radius:20px;background:var(--teal);color:#080808;text-decoration:none;font-size:13px;font-weight:600;"
          >Home</a
        >
        <a
          routerLink="/login"
          style="padding:10px 20px;border-radius:20px;border:1px solid var(--border);color:var(--text2);text-decoration:none;font-size:13px;"
          >Login</a
        >
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
