import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AdminService, CustomerProfileService, ToastService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';
import { ConsumerNavPillsComponent } from '../consumer-nav-pills.component';
import { CONSUMER_NAV } from '../consumer-nav.paths';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NexusLogoComponent, NexusThemeToggleComponent, ConsumerNavPillsComponent],
  template: `
    <div class="set-page">
      <header class="set-navbar">
        <div class="set-navbar-grid">
          <a class="set-navbar-brand" [routerLink]="consumerNav.shop" style="text-decoration:none;color:inherit;">
            <app-nexus-logo size="sm" wordmark="Nexus Settings"></app-nexus-logo>
          </a>
          <div class="set-navbar-pills">
            <app-consumer-nav-pills *ngIf="editUser?.role === 'CONSUMER'" />
          </div>
          <div class="set-nav-r">
            <app-nexus-theme-toggle></app-nexus-theme-toggle>
            <button type="button" class="set-nbtn" (click)="goBack()">← Exit Settings</button>
          </div>
        </div>
      </header>

      <div class="set-body">
        <aside class="set-sidebar">
          <div class="set-sidebar-title">Account</div>
          <div class="set-sitem" [class.active]="tab === 'personal'" (click)="tab = 'personal'">
            <svg class="set-sitem-icon" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.1" />
              <path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
            </svg>
            Personal Info
          </div>
          <div class="set-sitem" [class.active]="tab === 'password'" (click)="tab = 'password'">
            <svg class="set-sitem-icon" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <rect x="2.5" y="6" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.1" />
              <path d="M5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
            </svg>
            Security
          </div>

          <div class="set-sidebar-title">Shopping</div>
          <div class="set-sitem" [class.active]="tab === 'addresses'" (click)="tab = 'addresses'">
            <svg class="set-sitem-icon" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1" />
            </svg>
            Addresses
          </div>

          <div class="set-sidebar-title">Preferences</div>
          <div class="set-sitem" [class.active]="tab === 'notifications'" (click)="tab = 'notifications'">
            <svg class="set-sitem-icon" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M7.5 1.5C5.3 1.5 3.5 3.3 3.5 5.5V8l-1 1.5h10L11.5 8V5.5c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1" />
              <path d="M6 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="currentColor" stroke-width="1.1" />
            </svg>
            Notifications
          </div>

          <ng-container *ngIf="isStaff">
            <div class="set-sidebar-title">Business</div>
            <div class="set-sitem" [class.active]="tab === 'analytics'" (click)="tab = 'analytics'">
              <svg class="set-sitem-icon" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M2.5 12.5V8M7.5 12.5V4M12.5 12.5v-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
              </svg>
              Insights
            </div>
          </ng-container>

          <div class="set-danger-item" (click)="tab = 'danger'">Danger zone</div>

          <div class="set-sidebar-title" style="margin-top:24px;opacity:0.5;">Signed in</div>
          <div style="padding:0 10px;font-size:11px;color:var(--text3);line-height:1.4;">
            <div style="color:var(--text2);font-weight:500;">{{ editUser.fullName }}</div>
            <div>{{ editUser.role?.toLowerCase() }}</div>
          </div>
        </aside>

        <main class="set-main">
          <ng-container *ngIf="tab === 'personal'">
            <div class="set-sec-head">
              <div>
                <div class="set-sec-title">Personal Details</div>
                <div class="set-sec-sub">Manage your identification and contact info.</div>
              </div>
              <button type="button" class="set-save-btn" (click)="saveProfile($event)">Save Changes</button>
            </div>

            <div class="set-avatar-section">
              <div class="set-av-circle">{{ editUser.fullName?.charAt(0) }}</div>
              <div class="set-av-info">
                <div class="set-av-name">{{ editUser.fullName }}</div>
                <div class="set-av-email">{{ editUser.email }}</div>
              </div>
              <button type="button" class="set-av-btn" disabled title="Coming soon">Change photo</button>
            </div>

            <div class="set-form-grid">
              <div class="set-field">
                <span class="set-fl">Full Name</span>
                <input class="set-fi" [(ngModel)]="editUser.fullName" placeholder="Your full name" />
              </div>
              <div class="set-field">
                <span class="set-fl">Email Address</span>
                <input class="set-fi" [(ngModel)]="editUser.email" type="email" placeholder="email@example.com" />
              </div>
              <div class="set-field">
                <span class="set-fl">Phone Number</span>
                <input class="set-fi" [(ngModel)]="editUser.phone" placeholder="+90 5XX XXX XX XX" />
              </div>
              <div class="set-field">
                <span class="set-fl">Role</span>
                <input class="set-fi" [value]="editUser.role" disabled style="opacity:0.55;cursor:not-allowed" />
              </div>
            </div>

            <div style="height:1px;background:var(--border);margin:28px 0;"></div>
            <div class="set-sec-sub" style="margin-bottom:18px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;color:var(--text3);">Profile details</div>
            <div class="set-form-grid">
              <div class="set-field">
                <span class="set-fl">Gender</span>
                <input class="set-fi" [(ngModel)]="profile.gender" placeholder="e.g. Male, Female, Other" />
              </div>
              <div class="set-field">
                <span class="set-fl">Age</span>
                <input class="set-fi" [(ngModel)]="profile.age" type="number" placeholder="25" />
              </div>
              <div class="set-field">
                <span class="set-fl">City</span>
                <input class="set-fi" [(ngModel)]="profile.city" placeholder="e.g. Istanbul" />
              </div>
              <div class="set-field">
                <span class="set-fl">Country</span>
                <input class="set-fi" [(ngModel)]="profile.country" placeholder="e.g. Turkey" />
              </div>
              <div class="set-field">
                <span class="set-fl">Membership</span>
                <input class="set-fi" [value]="profile.membershipType" disabled style="opacity:0.55;cursor:not-allowed" />
              </div>
              <div class="set-field">
                <span class="set-fl">Total Spend</span>
                <input class="set-fi" [value]="(profile.totalSpend || 0) | currency" disabled style="opacity:0.55;cursor:not-allowed" />
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="tab === 'password'">
            <div class="set-sec-head">
              <div>
                <div class="set-sec-title">Security</div>
                <div class="set-sec-sub">Change your access credentials.</div>
              </div>
            </div>
            <div style="max-width:420px;margin-top:8px;">
              <div class="set-field set-form-full">
                <span class="set-fl">Current Password</span>
                <input class="set-fi" type="password" placeholder="••••••••" [(ngModel)]="currentPassword" />
              </div>
              <div class="set-field set-form-full">
                <span class="set-fl">New Password</span>
                <input class="set-fi" type="password" placeholder="••••••••" [(ngModel)]="newPassword" (input)="updatePwStrength($event)" />
              </div>
              <div class="set-pw-bars" style="margin-bottom:14px;">
                <div *ngFor="let i of [1, 2, 3, 4]" class="set-pw-bar" [style.background]="pwS >= i ? pwC : 'rgba(255,255,255,0.06)'"></div>
              </div>
              <p *ngIf="pwError" style="color:var(--red);font-size:12px;margin-bottom:10px;">{{ pwError }}</p>
              <p *ngIf="pwSuccess" style="color:var(--green);font-size:12px;margin-bottom:10px;">{{ pwSuccess }}</p>
              <button type="button" class="set-save-btn" style="width:100%;justify-content:center;" (click)="changePassword()">Update Password</button>
            </div>
          </ng-container>

          <ng-container *ngIf="tab === 'addresses'">
            <div class="set-sec-head">
              <div>
                <div class="set-sec-title">Addresses</div>
                <div class="set-sec-sub">Manage your shipping locations.</div>
              </div>
            </div>
            <div class="set-addr-list">
              <div class="set-addr-card default-card">
                <div class="set-addr-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="var(--teal)" stroke-width="1.1" /></svg>
                </div>
                <div class="set-addr-body">
                  <div class="set-addr-name">
                    Home
                    <span class="set-default-badge">Default</span>
                  </div>
                  <div class="set-addr-detail">Halaskargazi Cad. No:42, Şişli / İstanbul</div>
                  <div class="set-addr-actions">
                    <span class="set-addr-act">Edit</span>
                    <span class="set-addr-act danger">Remove</span>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" class="set-add-new-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" /></svg>
              Add new address
            </button>
          </ng-container>

          <ng-container *ngIf="tab === 'notifications'">
            <div class="set-sec-head">
              <div>
                <div class="set-sec-title">Notifications</div>
                <div class="set-sec-sub">Choose how you want to be alerted.</div>
              </div>
            </div>
            <div class="set-notif-list">
              <div class="set-notif-row">
                <div class="set-notif-icon" style="background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);">
                  <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5C5.3 1.5 3.5 3.3 3.5 5.5V8l-1 1.5h10L11.5 8V5.5c0-2.2-1.8-4-4-4Z" stroke="#3ECFB2" stroke-width="1.1" /></svg>
                </div>
                <div class="set-notif-body">
                  <div class="set-notif-title">Order updates</div>
                  <div class="set-notif-desc">Real-time tracking of packages</div>
                </div>
                <div class="set-tog" [class.on]="notifPrefs.orders" [class.off]="!notifPrefs.orders" (click)="notifPrefs.orders = !notifPrefs.orders" role="switch" [attr.aria-checked]="notifPrefs.orders">
                  <div class="set-tog-thumb"></div>
                </div>
              </div>
              <div class="set-notif-row">
                <div class="set-notif-icon" style="background:var(--amber-dim);border:1px solid rgba(232,169,74,0.2);">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12S2.5 8.5 2.5 4.5a4.5 4.5 0 0 1 9 0C11.5 8.5 7 12 7 12Z" stroke="#E8A94A" stroke-width="1.1" /></svg>
                </div>
                <div class="set-notif-body">
                  <div class="set-notif-title">Marketing &amp; deals</div>
                  <div class="set-notif-desc">Price drops and offers</div>
                </div>
                <div class="set-tog" [class.on]="notifPrefs.marketing" [class.off]="!notifPrefs.marketing" (click)="notifPrefs.marketing = !notifPrefs.marketing" role="switch" [attr.aria-checked]="notifPrefs.marketing">
                  <div class="set-tog-thumb"></div>
                </div>
              </div>
            </div>
            <button type="button" class="set-save-btn" style="margin-top:20px;" (click)="toast.show('Preferences saved', 'success')">Save preferences</button>
          </ng-container>

          <ng-container *ngIf="tab === 'analytics' && isStaff">
            <div class="set-sec-head">
              <div>
                <div class="set-sec-title">Sales insights</div>
                <div class="set-sec-sub">Category breakdown (admin)</div>
              </div>
            </div>
            <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:20px;max-width:480px;">
              <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text3);margin-bottom:14px;">Sales by category</div>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div *ngFor="let c of breakdown.categories" style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
                  <span style="color:var(--text2);">{{ c.name }}</span>
                  <span style="color:var(--text);font-weight:500;">{{ c.value | currency }}</span>
                </div>
                <div *ngIf="!breakdown.categories?.length" style="font-size:12px;color:var(--text3);">No data yet.</div>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="tab === 'danger'">
            <div class="set-sec-head">
              <div>
                <div class="set-sec-title">Danger zone</div>
                <div class="set-sec-sub">Irreversible actions for your account.</div>
              </div>
            </div>
            <div class="set-danger-zone" style="max-width:480px;">
              <div class="set-dz-title">Delete account</div>
              <div class="set-dz-desc">Permanently remove your account and associated data. This cannot be undone.</div>
              <button type="button" class="set-dz-btn" disabled title="Contact support">Deactivate account</button>
            </div>
          </ng-container>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  readonly consumerNav = CONSUMER_NAV;
  tab:
    | 'personal'
    | 'password'
    | 'addresses'
    | 'notifications'
    | 'analytics'
    | 'danger' = 'personal';
  editUser: any = {};
  profile: any = { gender: '', age: null, city: '', country: '', membershipType: 'BASIC' };
  notifPrefs = { orders: true, marketing: false };
  pwS = 0;
  pwC = '';
  breakdown: any = { categories: [] };
  currentPassword = '';
  newPassword = '';
  pwError = '';
  pwSuccess = '';

  auth = inject(AuthService);
  adminService = inject(AdminService);
  profileService = inject(CustomerProfileService);
  toast = inject(ToastService);
  router = inject(Router);

  get isStaff(): boolean {
    const r = this.editUser?.role;
    return r === 'ADMIN' || r === 'MANAGER';
  }

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.editUser = { ...u };
        this.profileService.getMyProfile().subscribe({
          next: (p: any) => {
            if (p) this.profile = { ...this.profile, ...p };
          },
          error: () => {},
        });
        if (u.role === 'ADMIN' || u.role === 'MANAGER') {
          this.adminService.getSalesBreakdown().subscribe(res => {
            this.breakdown = res;
          });
        }
      }
    });
  }

  goBack() {
    const role = this.editUser.role || 'CONSUMER';
    if (role === 'ADMIN') this.router.navigate(['/admin']);
    else if (role === 'MANAGER') this.router.navigate(['/manager']);
    else this.router.navigate([CONSUMER_NAV.shop]);
  }

  saveProfile(event: Event) {
    const btn = event.currentTarget as HTMLButtonElement;
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="set-spin">◌</span> Saving...';

    this.profileService.save(this.profile).subscribe({
      next: (saved: any) => {
        if (saved) this.profile = { ...this.profile, ...saved };
        this.auth.updateUser(this.editUser);
        this.toast.show('Profile updated successfully!', 'success');
        btn.innerHTML = '✓ Saved';
        setTimeout(() => {
          btn.innerHTML = oldText;
          btn.disabled = false;
        }, 2000);
      },
      error: () => {
        this.auth.updateUser(this.editUser);
        this.toast.show('Profile updated (local only)', 'info');
        btn.innerHTML = oldText;
        btn.disabled = false;
      },
    });
  }

  changePassword() {
    this.pwError = '';
    this.pwSuccess = '';
    if (!this.currentPassword || !this.newPassword) {
      this.pwError = 'Please fill in both fields.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.pwError = 'New password must be at least 6 characters.';
      return;
    }
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.pwSuccess = 'Password changed successfully!';
        this.currentPassword = '';
        this.newPassword = '';
        this.pwS = 0;
      },
      error: (err: any) => {
        this.pwError = err?.error?.message || 'Failed to change password.';
      },
    });
  }

  updatePwStrength(ev: Event) {
    const v = (ev.target as HTMLInputElement).value || '';
    this.pwS = 0;
    if (v.length >= 6) this.pwS++;
    if (v.length >= 10) this.pwS++;
    if (/[0-9]/.test(v)) this.pwS++;
    if (/[A-Z]/.test(v)) this.pwS++;
    const colors = ['#E07070', '#E8A94A', '#E8A94A', '#3EC98A'];
    this.pwC = this.pwS > 0 ? colors[this.pwS - 1] : '';
  }
}
