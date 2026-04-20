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
    <div class="page-frame">
      <div class="navbar-nexus">
        <div style="display:flex;align-items:center;gap:15px;flex-wrap:wrap;">
          <div class="logo-admin" [routerLink]="consumerNav.shop"><app-nexus-logo size="sm" wordmark="Nexus Settings"></app-nexus-logo></div>
          <app-consumer-nav-pills *ngIf="editUser?.role === 'CONSUMER'" style="display:flex;align-items:center;" />
        </div>
        <div class="nav-r-nexus" style="display:flex;align-items:center;gap:10px;">
          <app-nexus-theme-toggle></app-nexus-theme-toggle>
          <div class="mag-pill" style="font-size:11px; padding:6px 14px; border-radius:12px;" (click)="goBack()">← Exit Settings</div>
        </div>
      </div>

      <div class="body-frame">
        <div class="sidebar-nexus" style="width:240px; min-width:240px; padding:20px 16px;">
          <div class="sg-label-admin">Account</div>
          <div class="sitem-nexus" [class.active]="tab === 'personal'" (click)="tab = 'personal'"><div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.1"/><path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Personal Info</div></div>
          <div class="sitem-nexus" [class.active]="tab === 'password'" (click)="tab = 'password'"><div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 15 15" fill="none"><rect x="2.5" y="6" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Security</div></div>
          
          <div class="sg-label-admin">Shopping</div>
          <div class="sitem-nexus" [class.active]="tab === 'addresses'" (click)="tab = 'addresses'"><div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/></svg>Addresses</div></div>
          
          <div class="sidebar-foot-nexus">
            <div class="s-user-nexus" style="opacity:0.6;">
              <div><div class="su-name-nexus">{{editUser.fullName}}</div><div class="su-role-nexus">{{editUser.role?.toLowerCase()}}</div></div>
            </div>
          </div>
        </div>

        <div class="main-nexus">
          <div class="panel-nexus" [class.active]="tab === 'personal'" *ngIf="tab === 'personal'">
            <div class="top-bar-nexus">
              <div><div class="page-title-nexus">Personal Details</div><div class="page-sub-nexus">Manage your identification and contact info.</div></div>
              <button class="sc-btn-nexus primary" (click)="saveProfile($event)">Save Changes</button>
            </div>
            
            <div class="card-nexus" style="margin-top:20px; padding:24px;">
              <div style="display:flex; align-items:center; gap:20px; margin-bottom:32px;">
                <div class="nav-av-nexus" style="width:64px; height:64px; font-size:24px;">{{editUser.fullName?.charAt(0)}}</div>
                <div>
                  <div style="font-size:18px; font-weight:600; color:var(--text);">{{editUser.fullName}}</div>
                  <div style="font-size:13px; color:var(--text3); margin-top:2px;">{{editUser.email}}</div>
                </div>
              </div>

              <div class="grid-2-nexus" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div class="field-nexus"><label>Full Name</label><input [(ngModel)]="editUser.fullName" placeholder="Your full name"/></div>
                <div class="field-nexus"><label>Email Address</label><input [(ngModel)]="editUser.email" type="email" placeholder="email@example.com"/></div>
                <div class="field-nexus"><label>Phone Number</label><input [(ngModel)]="editUser.phone" placeholder="+90 5XX XXX XX XX"/></div>
                <div class="field-nexus">
                  <label>Role</label>
                  <input [value]="editUser.role" disabled style="opacity:0.5; cursor:not-allowed;"/>
                </div>
              </div>

              <div style="height:1px;background:var(--border);margin:24px 0;"></div>
              <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:16px;font-weight:600;">Profile Details</div>
              <div class="grid-2-nexus" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div class="field-nexus"><label>Gender</label><input [(ngModel)]="profile.gender" placeholder="e.g. Male, Female, Other"/></div>
                <div class="field-nexus"><label>Age</label><input [(ngModel)]="profile.age" type="number" placeholder="25"/></div>
                <div class="field-nexus"><label>City</label><input [(ngModel)]="profile.city" placeholder="e.g. Istanbul"/></div>
                <div class="field-nexus"><label>Country</label><input [(ngModel)]="profile.country" placeholder="e.g. Turkey"/></div>
                <div class="field-nexus">
                  <label>Membership</label>
                  <input [value]="profile.membershipType" disabled style="opacity:0.5; cursor:not-allowed;"/>
                </div>
                <div class="field-nexus">
                  <label>Total Spend</label>
                  <input [value]="((profile.totalSpend || 0) | currency)" disabled style="opacity:0.5; cursor:not-allowed;"/>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-nexus" [class.active]="tab === 'password'" *ngIf="tab === 'password'">
             <div class="top-bar-nexus"><div><div class="page-title-nexus">Security</div><div class="page-sub-nexus">Change your access credentials.</div></div></div>
             <div class="card-nexus" style="max-width:400px; padding:24px; margin-top:20px;">
                <div class="field-nexus" style="margin-bottom:15px;"><label>Current Password</label><input type="password" placeholder="••••••••" [(ngModel)]="currentPassword"/></div>
                <div class="field-nexus" style="margin-bottom:15px;"><label>New Password</label><input type="password" placeholder="••••••••" [(ngModel)]="newPassword" (input)="updatePwStrength($event)"/></div>
                <div style="display:flex; gap:4px; margin-bottom:15px;">
                  <div *ngFor="let i of [1,2,3,4]" [style.background]="pwS >= i ? pwC : 'var(--glass)'" style="flex:1; height:3px; border-radius:2px;"></div>
                </div>
                <p *ngIf="pwError" style="color:var(--red);font-size:12px;margin-bottom:10px;">{{pwError}}</p>
                <p *ngIf="pwSuccess" style="color:var(--green);font-size:12px;margin-bottom:10px;">{{pwSuccess}}</p>
                <button class="sc-btn-nexus primary" style="width:100%;" (click)="changePassword()">Update Password</button>
             </div>
          </div>

          <div class="panel-nexus" [class.active]="tab === 'addresses'" *ngIf="tab === 'addresses'">
             <div class="top-bar-nexus"><div><div class="page-title-nexus">Addresses</div><div class="page-sub-nexus">Manage your shipping locations.</div></div></div>
             <div class="grid-2-nexus" style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px;">
                <div class="card-nexus" style="padding:20px; border-color:var(--teal-glow);">
                   <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                      <div style="font-weight:600; font-size:14px;">Home</div>
                      <div class="spill-nexus sp-green">Default</div>
                   </div>
                   <div style="font-size:12px; color:var(--text2); margin-top:10px; line-height:1.5;">Halaskargazi Cad. No:42, Şişli/İstanbul</div>
                </div>
                <div class="table-card-nexus" style="padding:20px;">
                  <div class="gc-title-nexus" style="margin-bottom:15px;">Sales by Category</div>
                  <div style="display:flex; flex-direction:column; gap:12px;">
                    <div *ngFor="let c of breakdown.categories" style="display:flex; align-items:center; justify-content:space-between;">
                      <div style="font-size:12px; color:var(--text2);">{{c.name}}</div>
                      <div style="font-size:12px; color:var(--text); font-weight:500;">{{c.value | currency}}</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-frame { height: 100vh; display:flex; flex-direction:column; background:var(--bg); }
    .navbar-nexus { padding:14px 24px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); background:rgba(8,8,8,0.9); backdrop-filter:blur(20px); z-index:100; }
    .body-frame { display:flex; flex:1; overflow:hidden; }
    .sidebar-nexus { border-right:1px solid var(--border); background:rgba(8,8,8,0.2); }
    .main-nexus { flex:1; overflow-y:auto; padding:32px; }
    .panel-nexus { display:none; }
    .panel-nexus.active { display:block; animation: fadeUp 0.4s ease; }
    .card-nexus { background:var(--glass); border:1px solid var(--border); border-radius:16px; backdrop-filter:blur(20px); }
    .field-nexus label { display:block; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; font-weight:600; }
    .field-nexus input { width:100%; background:var(--glass2); border:1px solid var(--border); border-radius:10px; padding:10px 14px; color:var(--text); font-size:13px; outline:none; transition:0.2s; }
    .field-nexus input:focus { border-color:var(--teal); background:var(--glass); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  `]
})
export class SettingsComponent implements OnInit {
  readonly consumerNav = CONSUMER_NAV;
  tab = 'personal';
  editUser: any = {};
  profile: any = { gender: '', age: null, city: '', country: '', membershipType: 'BASIC' };
  pwS = 0; pwC = '';
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

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.editUser = { ...u };
        this.profileService.getMyProfile().subscribe({
          next: (p: any) => { if (p) this.profile = { ...this.profile, ...p }; },
          error: () => { }
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

  saveProfile(event: any) {
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="set-spin">◌</span> Saving...';

    this.profileService.save(this.profile).subscribe({
      next: (saved: any) => {
        if (saved) this.profile = { ...this.profile, ...saved };
        this.auth.updateUser(this.editUser);
        this.toast.show('Profile updated successfully!', 'success');
        btn.innerHTML = '✓ Saved';
        setTimeout(() => { btn.innerHTML = oldText; btn.disabled = false; }, 2000);
      },
      error: () => {
        this.auth.updateUser(this.editUser);
        this.toast.show('Profile updated (local only)', 'info');
        btn.innerHTML = oldText; btn.disabled = false;
      }
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
      }
    });
  }

  updatePwStrength(ev: any) {
    const v = ev.target.value || '';
    this.pwS = 0;
    if (v.length >= 6) this.pwS++;
    if (v.length >= 10) this.pwS++;
    if (/[0-9]/.test(v)) this.pwS++;
    if (/[A-Z]/.test(v)) this.pwS++;
    const colors = ['#E07070', '#E8A94A', '#E8A94A', '#3EC98A'];
    this.pwC = this.pwS > 0 ? colors[this.pwS - 1] : '';
  }
}
