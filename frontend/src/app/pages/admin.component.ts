import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, ProductService, StoreService, AdminService, OrderService, CategoryService, CustomerProfileService, ToastService, AiService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';
import { Chart } from './chart-register';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { apiRoot } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NexusLogoComponent, NexusThemeToggleComponent],
  template: `
<style>
.admin-page { background:var(--bg); color:var(--text); min-height:100vh; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
:host-context(html.light-mode) .navbar-a{background:rgba(245,242,237,0.96);}
:host-context(html.light-mode) .sidebar-a{background:rgba(245,242,237,0.55);}
.navbar-a { display:flex; align-items:center; justify-content:space-between; padding:12px 24px; border-bottom:1px solid var(--border); background:rgba(8,8,8,0.95); backdrop-filter:blur(20px); flex-shrink:0; z-index:100; }
.logo-a { font-family:'Playfair Display',serif; font-style:italic; font-size:18px; color:var(--text); display:flex; align-items:center; gap:8px; }
.logo-dot-a { width:6px; height:6px; border-radius:50%; background:var(--teal); box-shadow:0 0 8px var(--teal-glow); }
.badge-a { background:var(--teal-dim); border:1px solid rgba(62,207,178,0.2); color:var(--teal); font-size:9px; padding:2px 8px; border-radius:8px; text-transform:uppercase; letter-spacing:0.06em; }
.pc-badges { display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; margin-bottom:8px; }
.pc-badge { font-size:9px; font-weight:700; padding:2px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.02em; background:var(--glass2); color:var(--text2); }
.nav-r-a { display:flex; align-items:center; gap:12px; }
.nav-av-a { width:30px; height:30px; border-radius:50%; background:var(--teal-dim); border:1px solid rgba(62,207,178,0.2); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:var(--teal); }

.body-a { display:flex; flex:1; overflow:hidden; position:relative; min-height:0; }
/* Ensure sidebar stays clickable even if main overlays render. */
.sidebar-a { width:200px; min-width:200px; border-right:1px solid var(--border); background:rgba(8,8,8,0.4); display:flex; flex-direction:column; padding:16px 10px; position:relative; z-index:20; }
.sg-label-a { font-size:8.5px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); padding:0 12px; margin:14px 0 6px; }
.sg-label-a:first-child { margin-top:0; }
.sitem-a { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; font-size:13px; color:var(--text2); cursor:pointer; transition:all 0.2s; margin-bottom:2px; justify-content:space-between; }
.sitem-a.active { background:var(--teal-dim); color:var(--teal2); border:1px solid rgba(62,207,178,0.15); }
.sitem-a:not(.active):hover { background:var(--glass); color:var(--text); }
.sitem-l-a { display:flex; align-items:center; gap:10px; }
.sitem-badge-a { font-size:9px; padding:1px 6px; border-radius:8px; background:var(--glass2); color:var(--text2); }
.sitem-badge-a.green { background:var(--teal-dim); color:var(--teal); }

.sidebar-foot-a { margin-top:auto; padding-top:12px; border-top:1px solid var(--border); }
.s-user-a { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:12px; transition:all 0.2s; cursor:pointer; }
.s-user-a:hover { background:var(--glass); }
.su-name-a { font-size:12px; font-weight:500; color:var(--text); }
.su-role-a { font-size:10px; color:var(--text3); }

.main-a { flex:1; overflow-y:auto; padding:24px; position:relative; z-index:1; min-height:0; }
.panel-a { display:none; animation:fade-up 0.4s ease forwards; }
.panel-a.active { display:block; }
@keyframes fade-up { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }

.top-bar-a { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:24px; }
.page-title-a { font-family:'Playfair Display',serif; font-size:24px; font-style:italic; font-weight:400; color:var(--text); }
.page-sub-a { font-size:12px; color:var(--text3); margin-top:4px; }
.top-actions-a { display:flex; gap:8px; }
.tbtn-a { padding:8px 16px; border-radius:20px; font-size:12px; cursor:pointer; font-family:inherit; transition:all 0.2s; }
.tbtn-ghost-a { background:var(--glass); border:1px solid var(--border2); color:var(--text2); }
.tbtn-ghost-a:hover { color:var(--text); border-color:var(--text3); }
.tbtn-primary-a { background:var(--teal); border:none; color:#080808; font-weight:600; }
.tbtn-primary-a:hover { background:var(--teal2); transform:translateY(-1px); }

.kpi-row-a { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
.kpi-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:18px 20px; transition:all 0.3s; }
.kpi-a:hover { border-color:var(--teal-dim); transform:translateY(-2px); }
.kpi-label-a { font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:8px; }
.kpi-val-a { font-family:'Playfair Display',serif; font-size:26px; color:var(--text); line-height:1; font-weight:400; }
.kpi-delta-a { font-size:11px; margin-top:8px; display:flex; align-items:center; gap:4px; }
.up-a { color:var(--green); }
.dn-a { color:var(--red); }

.chart-row-a { display:grid; grid-template-columns:1fr 280px; gap:16px; margin-bottom:24px; }
.gcard-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
.gc-head-a { padding:14px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
.gc-title-a { font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text2); font-weight:600; }
.gc-link-a { font-size:11px; color:var(--text3); cursor:pointer; }
.gc-body-a { padding:20px; }

.bar-chart-a { display:flex; align-items:flex-end; gap:8px; height:120px; }
.bc-col-a { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
.bc-bar-a { width:100%; border-radius:4px 4px 0 0; background:rgba(62,207,178,0.12); transition:all 0.4s; position:relative; }
.bc-bar-a:hover { background:rgba(62,207,178,0.3); }
.bc-bar-a.active { background:var(--teal); box-shadow:0 0 15px var(--teal-glow); }
.bc-label-a { font-size:9px; color:var(--text3); font-family:'JetBrains Mono',monospace; }

.donut-wrap-a { display:flex; align-items:center; gap:20px; }
.donut-legend-a { display:flex; flex-direction:column; gap:10px; }
.dl-item-a { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text2); }
.dl-dot-a { width:8px; height:8px; border-radius:50%; }

.table-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:24px; }
.tbl-a { width:100%; border-collapse:collapse; }
.tbl-a th { padding:12px 20px; text-align:left; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); border-bottom:1px solid var(--border); font-weight:600; }
.tbl-a td { padding:14px 20px; font-size:13px; color:var(--text2); border-bottom:1px solid rgba(255,255,255,0.03); }
.tbl-a tr:last-child td { border-bottom:none; }
.tbl-a tr:hover td { background:rgba(255,255,255,0.02); }
.td-mono-a { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--teal2); }
.td-name-a { color:var(--text); font-weight:500; }
.spill-a { display:inline-flex; align-items:center; gap:6px; font-size:11px; padding:3px 10px; border-radius:999px; font-weight:600; letter-spacing:0.02em; border:1px solid transparent; }
.sp-green-a { background:rgba(62,201,138,0.14); color:var(--green); border-color:rgba(62,201,138,0.28); }
.sp-blue-a { background:rgba(107,168,200,0.14); color:var(--blue); border-color:rgba(107,168,200,0.28); }
.sp-amber-a { background:rgba(232,169,74,0.14); color:var(--amber); border-color:rgba(232,169,74,0.30); }
.sp-red-a { background:rgba(224,112,112,0.14); color:var(--red); border-color:rgba(224,112,112,0.32); }
.sp-gray-a { background:rgba(140,140,140,0.12); color:var(--text2); border-color:rgba(140,140,140,0.22); }
.audit-filters{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border);flex-wrap:wrap;}
.af-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.af-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto;}
.af-input{padding:8px 12px;border-radius:12px;border:1px solid var(--border);background:var(--glass);color:var(--text);font-size:12px;min-width:220px;outline:none;}
.af-input::placeholder{color:var(--text3);}
.af-select{padding:8px 12px;border-radius:12px;border:1px solid var(--border);background:var(--glass);color:var(--text);font-size:12px;outline:none;}
.af-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1px solid var(--border);background:var(--glass2);color:var(--text2);font-size:11px;cursor:pointer;user-select:none;transition:all 0.15s;}
.af-chip.active{background:var(--red-dim);border-color:var(--red-border);color:var(--red);}
.af-chip:hover{color:var(--text);border-color:var(--text3);}

.store-grid-a { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.store-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:20px; transition:all 0.3s; }
.store-card-a:hover { border-color:var(--teal-dim); transform:translateY(-2px); }
.sc-top-a { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
.sc-name-a { font-size:15px; font-weight:600; color:var(--text); }
.sc-owner-a { font-size:11px; color:var(--text3); margin-top:2px; }
.sc-status-a { font-size:10px; padding:3px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:5px; }
.sc-status-a.open { background:var(--green-dim); color:var(--green); border:1px solid rgba(62,201,138,0.2); }
.sc-status-a.closed { background:var(--red-dim); color:var(--red); border:1px solid var(--red-border); }
.sc-dot-a { width:6px; height:6px; border-radius:50%; }
.sc-dot-a.on { background:var(--green); box-shadow:0 0 4px var(--green); }
.sc-stats-a { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; padding:15px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.sc-stat-a { text-align:center; }
.sc-stat-v-a { font-size:16px; font-weight:600; color:var(--text); }
.sc-stat-l-a { font-size:9px; color:var(--text3); text-transform:uppercase; margin-top:4px; letter-spacing:0.04em; }
.sc-actions-a { display:flex; gap:8px; }
.sc-btn-a { flex:1; padding:8px 0; border-radius:12px; font-size:12px; cursor:pointer; text-align:center; border:1px solid var(--border); background:var(--glass2); color:var(--text2); transition:all 0.2s; }
.sc-btn-a.danger { color:var(--red); border-color:rgba(224,112,112,0.2); }
.sc-btn-a:hover:not(.danger) { color:var(--text); border-color:var(--text3); }
.sc-btn-a.danger:hover { background:var(--red-dim); }
.ue-select{
  width:100%;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid var(--border);
  background:var(--glass);
  color:var(--text);
  outline:none;
  appearance:none;
  -webkit-appearance:none;
  -moz-appearance:none;
  font-family:inherit;
  font-size:12.5px;
}
.ue-select:focus{border-color:rgba(62,207,178,0.35);box-shadow:0 0 0 3px rgba(62,207,178,0.12);}
.ue-select option{background:#0b0d0c;color:#e6f0ee;}
::host-context(html.light-mode) .ue-select option{background:#ffffff;color:#1a1916;}

.prod-mgmt-grid-a { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.pm-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; overflow:hidden; transition:all 0.3s; }
.pm-card-a:hover { border-color:var(--teal-dim); transform:translateY(-2px); }
.pm-img-a { height:120px; background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--border); position:relative; overflow:hidden; }
.pm-img-a::after { content:''; position:absolute; inset:0; pointer-events:none; z-index:2; background:radial-gradient(ellipse 88% 88% at 50% 48%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.25) 100%); }
:host-context(html.light-mode) .pm-img-a::after { background:radial-gradient(ellipse 88% 88% at 50% 48%, rgba(0,0,0,0) 24%, rgba(0,0,0,0.2) 100%); }
.pm-img-a-photo { position:absolute; inset:8px; width:calc(100% - 16px); height:calc(100% - 16px); object-fit:cover; object-position:center; border-radius:14px; z-index:1; display:block; }
.pm-body-a { padding:15px; }
.pm-name-a { font-size:13px; font-weight:600; color:var(--text); margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pm-row-a { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.pm-price-a { font-family:'Playfair Display',serif; font-size:16px; color:var(--text); }
.pm-stock-a { font-size:10px; padding:2px 8px; border-radius:8px; }
.pm-stock-a.ok { background:var(--green-dim); color:var(--green); }
.pm-stock-a.low { background:var(--amber-dim); color:var(--amber); }

.set-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:24px; max-width:600px; }
.set-row-a { display:flex; align-items:center; justify-content:space-between; padding:16px 0; border-bottom:1px solid var(--border); }
.set-row-a:last-child { border-bottom:none; }
.set-info-a { flex:1; }
.set-title-a { font-size:14px; font-weight:600; color:var(--text); margin-bottom:4px; }
.set-desc-a { font-size:12px; color:var(--text3); }
.set-tog-a { width:40px; height:22px; border-radius:12px; background:var(--glass2); border:1px solid var(--border); position:relative; cursor:pointer; transition:all 0.3s; }
.set-tog-a.on { background:var(--teal-dim); border-color:var(--teal-glow); }
.set-tog-thumb-a { position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:var(--text3); transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.set-tog-a.on .set-tog-thumb-a { transform:translateX(18px); background:var(--teal); box-shadow:0 0 8px var(--teal-glow); }
.chat-shell-a{background:var(--glass);border:1px solid var(--border);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;min-height:560px;}
.chat-head-a{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border);}
.chat-name-a{font-size:13px;font-weight:700;color:var(--text);}
.chat-sub-a{font-size:11px;color:var(--text3);margin-top:2px;}
.chat-body-a{flex:1;overflow:auto;padding:18px 20px;display:flex;flex-direction:column;gap:12px;}
.chat-body-a::-webkit-scrollbar{width:2px;}
.chat-body-a::-webkit-scrollbar-thumb{background:var(--border2);}
.cu-a{display:flex;justify-content:flex-end;}
.cu-b-a{max-width:70%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);border-radius:16px 16px 4px 16px;padding:10px 12px;font-size:13px;color:var(--text);line-height:1.55;}
.ca-a{display:flex;align-items:flex-start;gap:10px;}
.ca-av-a{width:28px;height:28px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ca-b-a{flex:1;background:var(--glass2);border:1px solid var(--border2);border-radius:4px 16px 16px 16px;padding:10px 12px;font-size:13px;color:var(--text2);line-height:1.6;}
.ai-text-a{white-space:pre-wrap;color:var(--text2);font-size:13px;line-height:1.8;letter-spacing:0.01em;}
.ai-text-a b{color:var(--text);font-weight:650;}
.ai-hint-a{margin-top:10px;padding:10px 12px;background:rgba(232,169,74,0.08);border:1px solid rgba(232,169,74,0.18);border-radius:10px;color:var(--text2);font-size:12px;line-height:1.65;}
.ai-hint-a .t{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--amber);margin-bottom:6px;font-weight:700;}
.gr-a{background:var(--red-dim);border:1px solid rgba(224,112,112,0.25);border-radius:10px;padding:10px 12px;margin-bottom:8px;}
.grh-a{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--red);margin-bottom:8px;}
.grr-a{display:grid;grid-template-columns:140px 1fr;gap:6px 10px;font-size:11.5px;}
.grk-a{color:var(--text3);}
.grv-a{color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:11px;}
.chat-foot-a{border-top:1px solid var(--border);padding:14px 20px;}
.chat-in-a{display:flex;gap:10px;align-items:center;background:rgba(255,255,255,0.05);border:1px solid var(--border2);border-radius:14px;padding:10px 12px;}
.chat-in-a input{flex:1;background:transparent;border:none;outline:none;color:var(--text);font-size:13px;}
.chat-send-a{width:34px;height:34px;border-radius:50%;background:var(--teal);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.chat-send-a:disabled{opacity:0.5;cursor:not-allowed;}
.chat-send-a:hover:not(:disabled){background:var(--teal2);}
.typing-row-a{display:flex;align-items:flex-start;gap:10px;opacity:0.95;}
.typing-bubble-a{background:var(--glass2);border:1px solid var(--border2);border-radius:4px 16px 16px 16px;padding:10px 12px;display:flex;align-items:center;gap:10px;min-width:190px;}
.typing-label-a{font-size:12px;color:var(--text3);}
.dots-a{display:inline-flex;gap:4px;align-items:center;}
.dot-a{width:5px;height:5px;border-radius:50%;background:rgba(110,222,200,0.8);animation:dotb-a 1s infinite ease-in-out;}
.dot-a:nth-child(2){animation-delay:0.15s;opacity:0.8;}
.dot-a:nth-child(3){animation-delay:0.3s;opacity:0.6;}
@keyframes dotb-a{0%,80%,100%{transform:translateY(0);opacity:0.5;}40%{transform:translateY(-3px);opacity:1;}}
</style>

<div class="admin-page">
  <!-- NAVBAR -->
  <div class="navbar-a">
    <div style="display:flex;align-items:center;gap:12px;">
      <div class="logo-a"><app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo></div>
      <div class="badge-a">Admin</div>
    </div>
    <div class="nav-r-a">
      <app-nexus-theme-toggle></app-nexus-theme-toggle>
      <div class="nav-notif-a" style="position:relative; width:34px; height:34px; background:var(--glass); border:1px solid var(--border); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5c-2.2 0-4 1.8-4 4V9l-1 1.5h10l-1-1.5V5.5c0-2.2-1.8-4-4-4Z" stroke="var(--text2)" stroke-width="1.1"/><path d="M6 12c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="var(--text2)" stroke-width="1.1"/></svg>
        <div style="position:absolute; top:-1px; right:-1px; width:8px; height:8px; border-radius:50%; background:var(--red); border:1.5px solid #080808;"></div>
      </div>
    </div>
  </div>

  <div class="body-a">
    <!-- SIDEBAR -->
    <div class="sidebar-a">
      <div class="sg-label-a">Overview</div>
      <div class="sitem-a" [class.active]="tab === 'dashboard'" (click)="tab = 'dashboard'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.6"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>Dashboard</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'analytics'" (click)="tab = 'analytics'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10L4 6l3 2 5-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>Analytics</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'assistant'" (click)="tab = 'assistant'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L1 4v5l5.5 3L12 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M6.5 1v5.5M1 4l5.5 2.5L12 4" stroke="currentColor" stroke-width="1.1"/></svg>AI Assistant</div>
      </div>

      <div class="sg-label-a">Management</div>
      <div class="sitem-a" [class.active]="tab === 'stores'" (click)="tab = 'stores'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 5.5h10v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6Z" stroke="currentColor" stroke-width="1.1"/><path d="M.5 3l.8-1.5h10.4L12.5 3a2 2 0 0 1-2 2.5h-8A2 2 0 0 1 .5 3Z" stroke="currentColor" stroke-width="1.1"/></svg>Stores</div>
        <div class="sitem-badge-a green">{{stores.length}}</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'users'" (click)="tab = 'users'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11.5c0-2.7 2-4 5-4s5 1.3 5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Users</div>
        <div class="sitem-badge-a">{{users.length}}</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'products'" (click)="tab = 'products'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L1 4v5l5.5 3L12 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>Products</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'orders'" (click)="tab = 'orders'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h1.5l2 7h6l1.5-4.5H4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="11" r="1" fill="currentColor"/></svg>Orders</div>
      </div>

      <div class="sitem-a" [class.active]="tab === 'categories'" (click)="tab = 'categories'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h4v4H2zM7 2h4v4H7zM2 7h4v4H2zM7 7h4v4H7z" stroke="currentColor" stroke-width="1.1"/></svg>Categories</div>
      </div>

      <div class="sitem-a" [class.active]="tab === 'comparison'" (click)="tab = 'comparison'; loadStoreComparison()">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 11V6h2.5v5H1zM5.25 11V3h2.5v8h-2.5zM9.5 11V1H12v10H9.5z" stroke="currentColor" stroke-width="1.1"/></svg>Store Comparison</div>
      </div>

      <div class="sg-label-a">System</div>
      <div class="sitem-a" [class.active]="tab === 'auditlogs'" (click)="tab = 'auditlogs'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 2h7v9H3z" stroke="currentColor" stroke-width="1.1"/><path d="M5 5h3M5 7h2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>Audit Logs</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'settings'" (click)="tab = 'settings'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Config</div>
      </div>

      <div class="sidebar-foot-a">
        <div class="s-user-a" (click)="logout()">
          <div class="nav-av-a" style="flex-shrink:0;">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
          <div style="min-width:0;">
            <div class="su-name-a" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{auth.currentUserValue?.fullName}}</div>
            <div class="su-role-a">Admin · Logout</div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-a">
      <div *ngIf="isLoading" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(8,8,8,0.7); z-index:10; backdrop-filter:blur(4px);">
        <div class="set-spin" style="font-size:32px; color:var(--teal);">◌</div>
        <div style="margin-top:12px; font-size:10px; letter-spacing:0.12em; color:var(--teal);">SYNCHRONIZING DATA...</div>
      </div>

      <!-- DASHBOARD PANEL -->
      <div class="panel-a active" *ngIf="tab === 'dashboard'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Dashboard</div><div class="page-sub-a">Friday, 17 April · Platform overview</div></div>
          <div class="top-actions-a">
            <button class="tbtn-a tbtn-ghost-a">Export Report</button>
            <button class="tbtn-a tbtn-primary-a">+ Add Store</button>
          </div>
        </div>

        <div class="kpi-row-a">
          <div class="kpi-a"><div class="kpi-label-a">Platform Revenue</div><div class="kpi-val-a">{{stats.totalRevenue | currency}}</div><div class="kpi-delta-a up-a">↑ {{stats.revenueGrowth}}% this month</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Total Orders</div><div class="kpi-val-a">{{stats.totalOrders || 0}}</div><div class="kpi-delta-a up-a">↑ Active</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Active Stores</div><div class="kpi-val-a">{{stats.totalStores || 0}}</div><div class="kpi-delta-a up-a">↑ Online</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Total Users</div><div class="kpi-val-a">{{stats.totalUsers || 0}}</div><div class="kpi-delta-a up-a">↑ {{stats.activeSessions}} live sessions</div></div>
        </div>

        <div class="chart-row-a">
          <div class="gcard-a">
            <div class="gc-head-a"><div class="gc-title-a">Revenue by Month</div><div class="gc-link-a">Full report →</div></div>
            <div class="gc-body-a" style="height:260px;"><canvas #adminRevenueChart></canvas></div>
          </div>
          <div class="gcard-a">
            <div class="gc-head-a"><div class="gc-title-a">Revenue Split</div></div>
            <div class="gc-body-a" style="height:260px;"><canvas #adminCategoryChart></canvas></div>
          </div>
        </div>

        <div class="table-card-a">
          <div class="gc-head-a"><div class="gc-title-a">Recent Orders — All Stores</div><div class="gc-link-a">View all →</div></div>
          <table class="tbl-a">
            <thead><tr><th>Order</th><th>Customer</th><th>Store</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of orders.slice(0,5)">
                <td class="td-mono-a">#{{o.orderId}}</td>
                <td class="td-name-a">{{o.user?.fullName || 'N/A'}}</td>
                <td>{{o.items?.length || 0}} items</td>
                <td>{{o.totalAmount | currency}}</td>
                <td>
                  <span
                    class="spill-a"
                    [class.sp-green-a]="o.status==='DELIVERED'"
                    [class.sp-blue-a]="o.status==='SHIPPED' || o.status==='PROCESSING'"
                    [class.sp-amber-a]="o.status==='PENDING'"
                    [class.sp-red-a]="o.status==='CANCELLED'"
                    [class.sp-gray-a]="o.status==='RETURNED'">
                    ● {{o.status}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ANALYTICS PANEL -->
      <div class="panel-a active" *ngIf="tab === 'analytics'">
        <div class="top-bar-a"><div><div class="page-title-a">Analytics</div><div class="page-sub-a">Deep platform insights.</div></div></div>
        <div class="kpi-row-a">
          <div class="kpi-a"><div class="kpi-label-a">Conversion Rate</div><div class="kpi-val-a">3.2%</div><div class="kpi-delta-a up-a">↑ 0.4%</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Avg Order Value</div><div class="kpi-val-a">$68.5</div><div class="kpi-delta-a up-a">↑ 12%</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Return Rate</div><div class="kpi-val-a">4.8%</div><div class="kpi-delta-a dn-a">↑ 0.2%</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Active Sessions</div><div class="kpi-val-a">847</div><div class="kpi-delta-a up-a">Live</div></div>
        </div>
        <div class="gcard-a">
          <div class="gc-head-a"><div class="gc-title-a">Traffic by Store</div></div>
          <div class="gc-body-a">
             <div style="display:flex; flex-direction:column; gap:16px;">
                <div *ngFor="let s of stores.slice(0,4)" style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:12px; color:var(--text2); width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{s.name}}</span>
                  <div style="flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;">
                    <div [style.width.%]="s.rating * 20" style="height:100%; background:var(--teal); border-radius:4px;"></div>
                  </div>
                  <span style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text3); width:30px;">{{(s.rating*20).toFixed(0)}}%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- STORES PANEL -->
      <div class="panel-a active" *ngIf="tab === 'stores'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Store Management</div><div class="page-sub-a">Approve, open or close stores.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a">+ New Store</button></div>
        </div>
        <div class="store-grid-a">
          <div class="store-card-a" *ngFor="let s of stores">
            <div class="sc-top-a">
              <div><div class="sc-name-a">{{s.name}}</div><div class="sc-owner-a">Owner: {{s.ownerName}}</div></div>
              <div class="sc-status-a" [class.open]="s.status === 'OPEN'" [class.closed]="s.status !== 'OPEN'">
                <div class="sc-dot-a" [class.on]="s.status === 'OPEN'"></div>{{s.status}}
              </div>
            </div>
            <div class="sc-stats-a">
              <div class="sc-stat-a"><div class="sc-stat-v-a">{{s.totalRevenue | currency}}</div><div class="sc-stat-l-a">Revenue</div></div>
              <div class="sc-stat-a"><div class="sc-stat-v-a">{{s.orderCount}}</div><div class="sc-stat-l-a">Orders</div></div>
              <div class="sc-stat-a"><div class="sc-stat-v-a">{{s.rating}}★</div><div class="sc-stat-l-a">Rating</div></div>
            </div>
            <div class="sc-actions-a">
              <button class="sc-btn-a" (click)="openStoreView(s)">View</button>
              <button class="sc-btn-a danger" (click)="toggleStoreStatus(s)">{{s.status === 'OPEN' ? 'Close' : 'Open'}}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- STORE VIEW MODAL -->
      <div *ngIf="storeViewOpen" style="position:fixed; inset:0; z-index:12000; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(8,8,8,0.72); backdrop-filter:blur(10px);">
        <div style="width:min(720px, 96vw); background:var(--bg); border:1px solid var(--border2); border-radius:16px; overflow:hidden; box-shadow:0 20px 70px rgba(0,0,0,0.5);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border);">
            <div style="min-width:0;">
              <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Store details</div>
              <div style="font-size:16px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{selectedStore?.name}}</div>
              <div style="font-size:12px; color:var(--text3); margin-top:2px;">Owner: {{selectedStore?.ownerName}} · ID: {{selectedStore?.id}}</div>
            </div>
            <button class="sc-btn-a" style="max-width:120px;" (click)="closeStoreView()">Close</button>
          </div>
          <div style="padding:16px 18px;">
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:14px;">
              <div style="background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:12px 14px;">
                <div style="font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3);">Revenue</div>
                <div style="margin-top:6px; font-size:18px; font-weight:700; color:var(--text);">{{selectedStore?.totalRevenue | currency}}</div>
              </div>
              <div style="background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:12px 14px;">
                <div style="font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3);">Orders</div>
                <div style="margin-top:6px; font-size:18px; font-weight:700; color:var(--text);">{{selectedStore?.orderCount || 0}}</div>
              </div>
              <div style="background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:12px 14px;">
                <div style="font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3);">Status</div>
                <div style="margin-top:6px; font-size:18px; font-weight:700; color:var(--text);">{{selectedStore?.status}}</div>
              </div>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="tbtn-a tbtn-ghost-a" style="padding:8px 12px;" (click)="toggleStoreStatus(selectedStore)">Toggle Open/Close</button>
              <button class="tbtn-a tbtn-ghost-a" style="padding:8px 12px;" (click)="tab='comparison'; loadStoreComparison(); closeStoreView()">Open Comparison</button>
            </div>
          </div>
        </div>
      </div>

      <!-- CROSS-STORE COMPARISON PANEL -->
      <div class="panel-a active" *ngIf="tab === 'comparison'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Cross-Store Comparison</div><div class="page-sub-a">Compare stores by revenue, orders, rating & avg. order value.</div></div>
        </div>
        <div *ngIf="storeComparison.length === 0" style="text-align:center;padding:48px;color:var(--text3);font-size:13px;">Loading comparison data...</div>
        <div *ngIf="storeComparison.length > 0">
          <div style="margin-bottom:20px;">
            <canvas #storeComparisonChart style="width:100%;max-height:320px;"></canvas>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);text-align:left;">
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">#</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">Store</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">Owner</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Revenue</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Orders</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Avg. Order</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Rating</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of storeComparison; let i = index" style="border-bottom:1px solid rgba(255,255,255,0.03);">
                  <td style="padding:10px 12px;color:var(--text3);">{{i + 1}}</td>
                  <td style="padding:10px 12px;font-weight:500;">{{s.name}}</td>
                  <td style="padding:10px 12px;color:var(--text3);">{{s.owner}}</td>
                  <td style="padding:10px 12px;text-align:right;color:#3ECFB2;font-weight:500;">{{s.revenue | currency}}</td>
                  <td style="padding:10px 12px;text-align:right;">{{s.orders}}</td>
                  <td style="padding:10px 12px;text-align:right;">{{s.avgOrderValue | currency}}</td>
                  <td style="padding:10px 12px;text-align:right;">{{s.rating}} ★</td>
                  <td style="padding:10px 12px;">
                    <span style="padding:2px 8px;border-radius:4px;font-size:10px;" [style.background]="s.status === 'OPEN' ? 'rgba(62,207,178,0.12)' : 'rgba(224,112,112,0.12)'" [style.color]="s.status === 'OPEN' ? '#3ECFB2' : '#E07070'">{{s.status}}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- USERS PANEL -->
      <div class="panel-a active" *ngIf="tab === 'users'">
        <div class="top-bar-a">
          <div><div class="page-title-a">User Management</div><div class="page-sub-a">View, suspend or ban users.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a" (click)="openUserAdd()">+ Add User</button></div>
        </div>
        <div class="table-card-a">
          <table class="tbl-a">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="td-name-a">{{u.fullName}}</td>
                <td>{{u.email}}</td>
                <td><span class="spill-a sp-blue-a">{{u.role}}</span></td>
                <td>
                  <span class="spill-a" [class.sp-green-a]="u.enabled" [class.sp-amber-a]="!u.enabled">
                    {{u.enabled ? 'Active' : 'Banned'}}
                  </span>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="sc-btn-a" style="padding:4px 10px; font-size:10px;" (click)="openUserEdit(u)">Edit</button>
                    <button class="sc-btn-a danger" style="padding:4px 10px; font-size:10px;" (click)="banUser(u)" [disabled]="!u.enabled">Ban</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- USER EDIT MODAL -->
      <div *ngIf="userEditOpen" style="position:fixed; inset:0; z-index:12000; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(8,8,8,0.72); backdrop-filter:blur(10px);">
        <div style="width:min(640px, 96vw); background:var(--bg); border:1px solid var(--border2); border-radius:16px; overflow:hidden; box-shadow:0 20px 70px rgba(0,0,0,0.5);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border);">
            <div style="min-width:0;">
              <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Edit user</div>
              <div style="font-size:16px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{userEditModel.fullName}}</div>
              <div style="font-size:12px; color:var(--text3); margin-top:2px;">{{userEditModel.email}} · ID: {{userEditModel.userId}}</div>
            </div>
            <button class="sc-btn-a" style="max-width:120px;" (click)="closeUserEdit()">Close</button>
          </div>
          <div style="padding:16px 18px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Role</div>
                <select [(ngModel)]="userEditModel.role" class="ue-select">
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="CONSUMER">CONSUMER</option>
                </select>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Status</div>
                <div style="display:flex; gap:10px; align-items:center; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass);">
                  <span class="spill-a" [class.sp-green-a]="userEditModel.enabled" [class.sp-amber-a]="!userEditModel.enabled">
                    {{userEditModel.enabled ? 'Active' : 'Banned'}}
                  </span>
                  <button class="sc-btn-a danger" style="padding:6px 10px; font-size:11px;" (click)="unbanUser(userEditModel)" [disabled]="userEditModel.enabled">Unban</button>
                </div>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Full name</div>
                <input [(ngModel)]="userEditModel.fullName" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" />
              </div>
            </div>
            <div style="display:flex; gap:10px; margin-top:14px;">
              <button class="tbtn-a tbtn-primary-a" style="flex:1;" (click)="saveUserEdit()" [disabled]="userEditSaving">Save changes</button>
              <button class="tbtn-a tbtn-ghost-a" style="flex:1;" (click)="closeUserEdit()">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- USER ADD MODAL -->
      <div *ngIf="userAddOpen" style="position:fixed; inset:0; z-index:12000; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(8,8,8,0.72); backdrop-filter:blur(10px);">
        <div style="width:min(640px, 96vw); background:var(--bg); border:1px solid var(--border2); border-radius:16px; overflow:hidden; box-shadow:0 20px 70px rgba(0,0,0,0.5);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border);">
            <div style="min-width:0;">
              <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Add user</div>
              <div style="font-size:16px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">New User</div>
            </div>
            <button class="sc-btn-a" style="max-width:120px;" (click)="closeUserAdd()">Close</button>
          </div>
          <div style="padding:16px 18px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Full name</div>
                <input [(ngModel)]="userAddModel.fullName" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="John Doe"/>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Email</div>
                <input [(ngModel)]="userAddModel.email" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="john@example.com"/>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Password</div>
                <input [(ngModel)]="userAddModel.passwordHash" type="password" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="Password"/>
              </div>
            </div>
            <div style="display:flex; gap:10px; margin-top:14px;">
              <button class="tbtn-a tbtn-primary-a" style="flex:1;" (click)="saveUserAdd()" [disabled]="userAddSaving">Create User</button>
              <button class="tbtn-a tbtn-ghost-a" style="flex:1;" (click)="closeUserAdd()">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCTS PANEL -->
      <div class="panel-a active" *ngIf="tab === 'products'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Product Catalog</div><div class="page-sub-a">Manage all store products.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a" (click)="openProductAdd()">+ Add Product</button></div>
        </div>
        <div *ngFor="let g of productGroups" style="margin-bottom:18px;">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px;padding:0 2px;">
            <div>
              <div style="font-family:'Playfair Display',serif;font-style:italic;font-size:18px;color:var(--text);line-height:1;">
                {{g.storeName}}
              </div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px;">{{g.products.length}} products</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="spill-a sp-blue-a" style="font-size:10px;">Store view</span>
            </div>
          </div>

          <div class="prod-mgmt-grid-a">
            <div class="pm-card-a" *ngFor="let p of g.products">
              <div class="pm-img-a">
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" class="pm-img-a-photo" [alt]="p.name"/>
                <svg *ngIf="!p.imageUrl" width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="9" width="32" height="20" rx="3" stroke="var(--teal)" stroke-width="1.1" opacity="0.3"/></svg>
              </div>
              <div class="pm-body-a">
                <div class="pm-name-a">{{p.name}}</div>
                <div style="font-size:10px;color:var(--text3);margin:-2px 0 10px;">{{p.category || '—'}} · {{p.brand || '—'}}</div>
                <div class="pm-row-a">
                  <div class="pm-price-a">{{p.basePrice | currency}}</div>
                  <div class="pm-stock-a" [class.ok]="(p.stockQuantity || 0) > 5" [class.low]="(p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 5" [class.sp-red-a]="(p.stockQuantity || 0) <= 0">
                    {{(p.stockQuantity || 0) <= 0 ? 'Out' : ((p.stockQuantity || 0) <= 5 ? (p.stockQuantity + ' left') : 'In Stock')}}
                  </div>
                </div>
                <div class="sc-actions-a">
                  <button class="sc-btn-a" (click)="openProductEdit(p)">Edit</button>
                  <button class="sc-btn-a danger" (click)="deleteProduct(p)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCT ADD MODAL -->
      <div *ngIf="productAddOpen" style="position:fixed; inset:0; z-index:12000; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(8,8,8,0.72); backdrop-filter:blur(10px);">
        <div style="width:min(720px, 96vw); background:var(--bg); border:1px solid var(--border2); border-radius:16px; overflow:hidden; box-shadow:0 20px 70px rgba(0,0,0,0.5);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border);">
            <div style="min-width:0;">
              <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Add product (admin)</div>
              <div style="font-size:16px; font-weight:700; color:var(--text);">New product</div>
              <div style="font-size:12px; color:var(--text3); margin-top:2px;">Select store and fill minimal fields</div>
            </div>
            <button class="sc-btn-a" style="max-width:120px;" (click)="closeProductAdd()">Close</button>
          </div>
          <div style="padding:16px 18px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Store</div>
                <select [(ngModel)]="productAddModel.storeId" class="ue-select">
                  <option [ngValue]="null">Select store…</option>
                  <option *ngFor="let s of stores" [ngValue]="s.id">{{s.name}}</option>
                </select>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Category</div>
                <input [(ngModel)]="productAddModel.category" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="e.g. Keyboards"/>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Name</div>
                <input [(ngModel)]="productAddModel.name" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="Product name"/>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Brand</div>
                <input [(ngModel)]="productAddModel.brand" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="Brand"/>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Price</div>
                <input [(ngModel)]="productAddModel.basePrice" type="number" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="0"/>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Stock</div>
                <input [(ngModel)]="productAddModel.stockQuantity" type="number" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="0"/>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Image URL</div>
                <input [(ngModel)]="productAddModel.imageUrl" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="https://..."/>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Description</div>
                <textarea [(ngModel)]="productAddModel.description" rows="3" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text); resize:none;" placeholder="Short description..."></textarea>
              </div>
            </div>
            <div style="display:flex; gap:10px; margin-top:14px;">
              <button class="tbtn-a tbtn-primary-a" style="flex:1;" (click)="saveProductAdd()" [disabled]="productAddSaving">Create</button>
              <button class="tbtn-a tbtn-ghost-a" style="flex:1;" (click)="closeProductAdd()">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCT EDIT MODAL -->
      <div *ngIf="productEditOpen" style="position:fixed; inset:0; z-index:12000; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(8,8,8,0.72); backdrop-filter:blur(10px);">
        <div style="width:min(720px, 96vw); background:var(--bg); border:1px solid var(--border2); border-radius:16px; overflow:hidden; box-shadow:0 20px 70px rgba(0,0,0,0.5);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border);">
            <div style="min-width:0;">
              <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Edit product (admin)</div>
              <div style="font-size:16px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{productEditModel.name}}</div>
              <div style="font-size:12px; color:var(--text3); margin-top:2px;">ID: {{productEditModel.productId}}</div>
            </div>
            <button class="sc-btn-a" style="max-width:120px;" (click)="closeProductEdit()">Close</button>
          </div>
          <div style="padding:16px 18px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Category</div>
                <input [(ngModel)]="productEditModel.category" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="e.g. Keyboards"/>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Brand</div>
                <input [(ngModel)]="productEditModel.brand" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="Brand"/>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Name</div>
                <input [(ngModel)]="productEditModel.name" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="Product name"/>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Price</div>
                <input [(ngModel)]="productEditModel.basePrice" type="number" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="0"/>
              </div>
              <div>
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Stock</div>
                <input [(ngModel)]="productEditModel.stockQuantity" type="number" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="0"/>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Image URL</div>
                <input [(ngModel)]="productEditModel.imageUrl" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text);" placeholder="https://..."/>
              </div>
              <div style="grid-column:1 / -1;">
                <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:6px;">Description</div>
                <textarea [(ngModel)]="productEditModel.description" rows="3" style="width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background:var(--glass); color:var(--text); resize:none;" placeholder="Short description..."></textarea>
              </div>
            </div>
            <div style="display:flex; gap:10px; margin-top:14px;">
              <button class="tbtn-a tbtn-primary-a" style="flex:1;" (click)="saveProductEdit()" [disabled]="productEditSaving">Save changes</button>
              <button class="tbtn-a tbtn-ghost-a" style="flex:1;" (click)="closeProductEdit()">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ORDERS PANEL -->
      <div class="panel-a active" *ngIf="tab === 'orders'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Order Management</div><div class="page-sub-a">View and manage all platform orders.</div></div>
        </div>
        <div class="table-card-a">
          <table class="tbl-a">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of allOrders">
                <td class="td-mono-a">#ORD-{{o.orderId}}</td>
                <td class="td-name-a">{{o.user?.fullName || 'N/A'}}</td>
                <td>{{o.totalAmount | currency}}</td>
                <td>
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span
                      class="spill-a"
                      [ngClass]="{
                        'sp-green-a': (orderStatusDraft[o.orderId] || o.status) === 'DELIVERED',
                        'sp-blue-a': (orderStatusDraft[o.orderId] || o.status) === 'PROCESSING' || (orderStatusDraft[o.orderId] || o.status) === 'SHIPPED',
                        'sp-amber-a': (orderStatusDraft[o.orderId] || o.status) === 'PENDING',
                        'sp-red-a': (orderStatusDraft[o.orderId] || o.status) === 'CANCELLED',
                        'sp-gray-a': (orderStatusDraft[o.orderId] || o.status) === 'RETURNED'
                      }">
                      ● {{orderStatusDraft[o.orderId] || o.status}}
                    </span>
                    <select
                      class="ue-select"
                      [ngModel]="orderStatusDraft[o.orderId] || o.status"
                      (ngModelChange)="orderStatusDraft[o.orderId] = $event"
                      style="max-width:160px;">
                      <option *ngFor="let s of orderStatusOptions" [value]="s">{{s}}</option>
                    </select>
                  </div>
                </td>
                <td>{{o.orderDate | date:'short'}}</td>
                <td>
                  <div style="display:flex; gap:6px; align-items:center;">
                    <button
                      class="sc-btn-a"
                      style="padding:4px 10px; font-size:10px;"
                      (click)="saveOrderStatus(o)"
                      [disabled]="orderSaving[o.orderId] || ((orderStatusDraft[o.orderId] || o.status) === o.status)">
                      {{orderSaving[o.orderId] ? 'Saving…' : 'Save'}}
                    </button>
                    <button
                      class="sc-btn-a"
                      style="padding:4px 10px; font-size:10px;"
                      (click)="resetOrderStatus(o)"
                      [disabled]="orderSaving[o.orderId] || (orderStatusDraft[o.orderId] == null)">
                      Reset
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="allOrders.length === 0">
                <td colspan="6" style="text-align:center;color:var(--text3);padding:32px;">No orders yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CATEGORIES PANEL -->
      <div class="panel-a active" *ngIf="tab === 'categories'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Category Management</div><div class="page-sub-a">Manage product taxonomy.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a" (click)="addCategory()">+ Add Category</button></div>
        </div>
        <div class="table-card-a">
          <table class="tbl-a">
            <thead><tr><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td class="td-name-a">{{c.name}}</td>
                <td>{{c.description || '—'}}</td>
                <td><span class="spill-a" [class.sp-green-a]="c.active" [class.sp-amber-a]="!c.active">{{c.active ? 'Active' : 'Inactive'}}</span></td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="sc-btn-a danger" style="padding:4px 10px;font-size:10px;" (click)="deleteCategory(c)">Delete</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0"><td colspan="4" style="text-align:center;color:var(--text3);padding:32px;">No categories. Add one to get started.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AUDIT LOGS PANEL -->
      <div class="panel-a active" *ngIf="tab === 'auditlogs'">
        <div class="top-bar-a"><div><div class="page-title-a">Audit Logs</div><div class="page-sub-a">Platform activity monitoring.</div></div></div>
        <div class="table-card-a">
          <div class="audit-filters">
            <div class="af-left">
              <input class="af-input" placeholder="Search user / action / detail…" [(ngModel)]="auditQuery" />
              <select class="af-select" [(ngModel)]="auditAction">
                <option value="">All actions</option>
                <option *ngFor="let a of auditActionOptions" [value]="a">{{a}}</option>
              </select>
            </div>
            <div class="af-right">
              <div class="af-chip" [class.active]="auditOnlyLowStock" (click)="auditOnlyLowStock = !auditOnlyLowStock">
                ● LOW_STOCK_ALERT only
              </div>
              <button class="tbtn-a tbtn-ghost-a" style="padding:7px 14px;" (click)="loadAuditLogs()">Refresh</button>
            </div>
          </div>
          <table class="tbl-a">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>
              <tr *ngFor="let log of filteredAuditLogs">
                <td style="font-family:'JetBrains Mono',monospace;font-size:10px;">{{log.time}}</td>
                <td class="td-name-a">{{log.user}}</td>
                <td><span class="spill-a" [ngClass]="auditBadgeClass(log)">{{log.action}}</span></td>
                <td style="color:var(--text3);font-size:11px;">{{log.detail}}</td>
              </tr>
              <tr *ngIf="filteredAuditLogs.length === 0">
                <td colspan="4" style="text-align:center;color:var(--text3);padding:32px;">No matching logs.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI ASSISTANT PANEL (Admin / platform-wide) -->
      <div class="panel-a active" *ngIf="tab === 'assistant'">
        <div class="top-bar-a">
          <div><div class="page-title-a">AI Assistant</div><div class="page-sub-a">Platform-wide Text2SQL analytics (admin scope)</div></div>
          <div class="top-actions-a">
            <button class="tbtn-a tbtn-ghost-a" (click)="clearAiChat()">New Chat</button>
          </div>
        </div>
        <div class="chat-shell-a" style="min-height:560px;">
          <div class="chat-head-a">
            <div>
              <div class="chat-name-a">Nexus AI</div>
              <div class="chat-sub-a">Admin · cross-store allowed</div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="tbtn-a tbtn-ghost-a" style="padding:6px 12px;" (click)="seedAiExample('Compare total revenue of all stores')">Store comparison</button>
              <button class="tbtn-a tbtn-ghost-a" style="padding:6px 12px;" (click)="seedAiExample('How did sales change vs last month?')">MoM</button>
            </div>
          </div>
          <div class="chat-body-a">
            <ng-container *ngFor="let m of aiChatMessages">
              <div *ngIf="m.sender==='user'" class="cu-a"><div class="cu-b-a">{{m.text}}</div></div>
              <div *ngIf="m.sender==='ai'" class="ca-a">
                <div class="ca-av-a"><svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/></svg></div>
                <div class="ca-b-a">
                  <div class="gr-a" *ngIf="m.blocked">
                    <div class="grh-a">Guardrail — BLOCKED</div>
                    <div class="grr-a">
                      <div class="grk-a">detection_type</div><div class="grv-a">{{m.detection_type || '-'}}</div>
                      <div class="grk-a">guardrail</div><div class="grv-a">{{m.guardrail || '-'}}</div>
                      <div class="grk-a">requested_store</div><div class="grv-a">{{m.requested_store_id ? ('#' + m.requested_store_id) : '-'}}</div>
                    </div>
                  </div>
                  <div class="ai-text-a">{{m.text}}</div>
                  <div class="ai-hint-a" *ngIf="!m.blocked && m.noDataHint">
                    <div class="t">No data / Next steps</div>
                    <div>{{m.noDataHint}}</div>
                  </div>
                  <!-- SQL intentionally hidden in the UI for non-demo use -->
                </div>
              </div>
            </ng-container>
            <div *ngIf="aiBusy" class="typing-row-a">
              <div class="ca-av-a"><svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/></svg></div>
              <div class="typing-bubble-a">
                <div class="typing-label-a">Nexus AI is thinking</div>
                <div class="dots-a" aria-label="Loading">
                  <span class="dot-a"></span><span class="dot-a"></span><span class="dot-a"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="chat-foot-a">
            <div class="chat-in-a">
              <input placeholder="Ask platform analytics questions…" [(ngModel)]="aiPrompt" (keyup.enter)="sendAiQuery()" maxlength="500"/>
              <button class="chat-send-a" (click)="sendAiQuery()" [disabled]="!aiPrompt.trim() || aiBusy">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5L2 2l2 4.5-2 4.5 9-4.5Z" fill="#080808"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CONFIG PANEL -->
      <div class="panel-a active" *ngIf="tab === 'settings'">
        <div class="top-bar-a"><div><div class="page-title-a">System Config</div><div class="page-sub-a">Manage platform behavior.</div></div></div>
        <div class="set-card-a">
          <div class="set-row-a">
            <div class="set-info-a"><div class="set-title-a">Maintenance Mode</div><div class="set-desc-a">Disable public store access</div></div>
            <div class="set-tog-a" [class.on]="sysSettings.maintenance" (click)="sysSettings.maintenance = !sysSettings.maintenance"><div class="set-tog-thumb-a"></div></div>
          </div>
          <div class="set-row-a">
            <div class="set-info-a"><div class="set-title-a">AI Assistant</div><div class="set-desc-a">Enable Text2SQL support for customers</div></div>
            <div class="set-tog-a" [class.on]="sysSettings.aiAssistant" (click)="sysSettings.aiAssistant = !sysSettings.aiAssistant"><div class="set-tog-thumb-a"></div></div>
          </div>
          <div class="set-row-a">
            <div class="set-info-a"><div class="set-title-a">New Registrations</div><div class="set-desc-a">Allow visitors to create new accounts</div></div>
            <div class="set-tog-a" [class.on]="sysSettings.registrations" (click)="sysSettings.registrations = !sysSettings.registrations"><div class="set-tog-thumb-a"></div></div>
          </div>
          <div style="margin-top:24px;">
            <button class="tbtn-a tbtn-primary-a" style="width:100%;" (click)="saveSettings($event)">Save All Changes</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
  `,
})
export class AdminComponent implements OnInit, AfterViewInit {
  tab = 'dashboard';
  isLoading = true;
  auth = inject(AuthService);
  productService = inject(ProductService);
  storeService = inject(StoreService);
  adminService = inject(AdminService);
  orderService = inject(OrderService);
  categoryService = inject(CategoryService);
  toast = inject(ToastService);
  ai = inject(AiService);
  router = inject(Router);
  http = inject(HttpClient);

  @ViewChild('adminRevenueChart') adminRevenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('adminCategoryChart') adminCategoryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storeComparisonChart') storeComparisonCanvas!: ElementRef<HTMLCanvasElement>;
  private revChart: Chart | null = null;
  private catChart: Chart | null = null;
  private compChart: Chart | null = null;

  storeComparison: any[] = [];
  categories: any[] = [];
  auditLogs: any[] = [];
  auditQuery = '';
  auditAction = '';
  auditOnlyLowStock = false;
  aiPrompt = '';
  aiBusy = false;
  // Streaming/trace/SQL panels intentionally removed for non-demo use.
  aiChatMessages: any[] = [
    { sender: 'ai', text: 'Ask me anything about platform analytics. I will generate SQL and summarize results.' }
  ];
  aiHistory: string[] = [];

  stores: any[] = [];
  users: any[] = [];
  orders: any[] = [];
  allOrders: any[] = [];
  orderStatusOptions: string[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
  orderStatusDraft: Record<number, string> = {};
  orderSaving: Record<number, boolean> = {};
  pagedProducts: any[] = [];
  productGroups: Array<{ storeName: string; products: any[] }> = [];
  stats: any = {};

  storeViewOpen = false;
  selectedStore: any = null;

  userEditOpen = false;
  userEditSaving = false;
  userEditModel: any = { userId: null, fullName: '', email: '', role: 'CONSUMER', enabled: true };

  userAddOpen = false;
  userAddSaving = false;
  userAddModel: any = { fullName: '', email: '', passwordHash: '' };

  productAddOpen = false;
  productAddSaving = false;
  productAddModel: any = {
    storeId: null,
    name: '',
    brand: '',
    basePrice: 0,
    stockQuantity: 10,
    category: 'Accessories',
    description: '',
    imageUrl: ''
  };

  productEditOpen = false;
  productEditSaving = false;
  productEditModel: any = { productId: null, name: '', brand: '', basePrice: 0, stockQuantity: 0, category: '', description: '', imageUrl: '' };

  sysSettings = {
    maintenance: false,
    registrations: true,
    aiAssistant: true
  };

  ngOnInit() {
    this.refreshData();
    this.categoryService.getAll().subscribe(res => this.categories = res);
    this.loadAuditLogs();
    this.logAudit('Login', 'success', 'Admin authenticated via JWT');
  }

  loadAuditLogs() {
    this.adminService.getAuditLogs().subscribe({
      next: (logs) => this.auditLogs = logs.map(l => ({
        time: l.createdAt?.replace('T', ' ')?.slice(0, 19) || '',
        user: l.username || 'System',
        action: l.action,
        type: l.type,
        detail: l.detail
      })),
      error: () => { }
    });
  }

  get auditActionOptions(): string[] {
    const s = new Set<string>();
    (this.auditLogs || []).forEach(l => { if (l?.action) s.add(String(l.action)); });
    return Array.from(s).sort();
  }

  get filteredAuditLogs(): any[] {
    const q = (this.auditQuery || '').trim().toLowerCase();
    const action = (this.auditAction || '').trim();
    return (this.auditLogs || []).filter(l => {
      if (this.auditOnlyLowStock && String(l?.action || '') !== 'LOW_STOCK_ALERT') return false;
      if (action && String(l?.action || '') !== action) return false;
      if (!q) return true;
      const hay = `${l?.user || ''} ${l?.action || ''} ${l?.type || ''} ${l?.detail || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  auditBadgeClass(log: any): any {
    const action = String(log?.action || '');
    const type = String(log?.type || '');
    if (action === 'LOW_STOCK_ALERT') return { 'sp-red-a': true };
    if (type.toUpperCase().includes('INVENTORY')) return { 'sp-amber-a': true };
    if (type.toUpperCase().includes('SYSTEM')) return { 'sp-blue-a': true };
    return { 'sp-blue-a': true };
  }

  logAudit(action: string, type: string, detail: string) {
    this.adminService.createAuditLog(action, type, detail).subscribe({
      next: () => this.loadAuditLogs(),
      error: () => { }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.buildAdminCharts(), 800);
  }

  private buildAdminCharts() {
    if (this.adminRevenueCanvas?.nativeElement) {
      if (this.revChart) this.revChart.destroy();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const months: { y: number; m: number; label: string; key: string }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        months.push({
          y,
          m,
          label: `${monthNames[m]}`,
          key: `${y}-${String(m + 1).padStart(2, '0')}`,
        });
      }
      const idxByKey = new Map<string, number>(months.map((x, i) => [x.key, i]));
      const revenueByMonth = new Array(12).fill(0);
      (this.allOrders || []).forEach((o: any) => {
        const d = new Date(o.orderDate);
        if (isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const idx = idxByKey.get(key);
        if (idx === undefined) return;
        revenueByMonth[idx] += Number(o.totalAmount || 0);
      });
      this.revChart = new Chart(this.adminRevenueCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: months.map(x => x.label),
          datasets: [{
            label: 'Revenue ($)',
            data: revenueByMonth,
            borderColor: '#3ECFB2',
            backgroundColor: 'rgba(62,207,178,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3ECFB2',
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#7A918D', maxRotation: 0, autoSkip: false }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#7A918D' }, grid: { color: 'rgba(255,255,255,0.04)' } }
          }
        }
      });
    }

    if (this.adminCategoryCanvas?.nativeElement) {
      if (this.catChart) this.catChart.destroy();
      const catMap: Record<string, number> = {};
      this.pagedProducts.forEach((p: any) => { catMap[p.category || 'Other'] = (catMap[p.category || 'Other'] || 0) + 1; });
      const labels = Object.keys(catMap);
      const data = Object.values(catMap);
      const palette = ['#3ECFB2', '#6BA8C8', '#E8A94A', '#E07070', '#A78BFA', '#34D399', '#F472B6'];
      this.catChart = new Chart(this.adminCategoryCanvas.nativeElement, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: palette.slice(0, labels.length), borderWidth: 0 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#7A918D', padding: 12, font: { size: 10 } } } }
        }
      });
    }
  }

  refreshData() {
    this.isLoading = true;
    const errors: string[] = [];
    const safe = <T>(label: string, fallback: T) =>
      catchError((e: any) => {
        const code = e?.status ? `HTTP ${e.status}` : 'HTTP error';
        const msg = e?.error?.message || e?.message || e?.statusText || '';
        errors.push(`${label}: ${code}${msg ? ` — ${msg}` : ''}`);
        return of(fallback);
      });

    forkJoin({
      products: this.productService.getProducts().pipe(safe('products', [] as any[])),
      stores: this.storeService.getStores().pipe(safe('stores', [] as any[])),
      users: this.adminService.getUsers().pipe(safe('users', [] as any[])),
      orders: this.adminService.getOrders().pipe(safe('orders', [] as any[])),
      stats: this.adminService.getStats().pipe(safe('stats', {} as any)),
    }).subscribe({
      next: (res: any) => {
        this.pagedProducts = res.products || [];
        this.stores = res.stores || [];
        this.productGroups = this.computeProductGroups(this.pagedProducts, this.stores);
        this.users = res.users || [];

        const incomingOrders = Array.isArray(res.orders) ? res.orders : [];
        const sortedOrders = incomingOrders.slice().sort((a: any, b: any) => {
          const ta = new Date(a?.orderDate).getTime();
          const tb = new Date(b?.orderDate).getTime();
          const na = isNaN(ta) ? 0 : ta;
          const nb = isNaN(tb) ? 0 : tb;
          return nb - na; // newest first
        });
        this.allOrders = sortedOrders;
        this.orders = sortedOrders.slice(0, 10);
        this.stats = res.stats || {};

        this.isLoading = false;
        setTimeout(() => this.buildAdminCharts(), 200);

        if (errors.length) {
          this.toast.show(`Data fetch issues: ${errors.join(' | ')}`, 'error');
        }
      },
      error: (e) => {
        this.toast.show(e?.message || 'Error fetching data', 'error');
        this.isLoading = false;
      }
    });
  }

  private computeProductGroups(input: any[], stores: any[] = []): Array<{ storeName: string; products: any[] }> {
    const list = Array.isArray(input) ? input : [];
    const by = new Map<string, any[]>();

    for (const p of list) {
      const storeName = String(p?.store?.name || p?.storeName || 'Unknown store');
      if (!by.has(storeName)) by.set(storeName, []);
      by.get(storeName)!.push(p);
    }

    // Keep store order stable and "nice": known stores first if present.
    const preferred = ['TechHub Performance', 'GadgetPro Lifestyle'];
    const namesSet = new Set<string>(Array.from(by.keys()));
    // Ensure every known store appears even if it has 0 products.
    (Array.isArray(stores) ? stores : []).forEach((s: any) => {
      const n = String(s?.name || '').trim();
      if (n) namesSet.add(n);
    });

    const names = Array.from(namesSet).sort((a, b) => {
      const ai = preferred.indexOf(a);
      const bi = preferred.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
      return a.localeCompare(b);
    });

    return names.map((n) => ({
      storeName: n,
      products: (by.get(n) || []).slice().sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''))),
    }));
  }

  openStoreView(s: any) {
    this.selectedStore = s;
    this.storeViewOpen = true;
  }

  closeStoreView() {
    this.storeViewOpen = false;
    this.selectedStore = null;
  }

  toggleStoreStatus(s: any) {
    if (!s || !s.id) return;
    const next = (s.status === 'OPEN' ? 'CLOSED' : 'OPEN') as 'OPEN' | 'CLOSED';
    const label = next === 'OPEN' ? 'open' : 'close';
    if (!confirm(`Do you want to ${label} "${s.name}"?`)) return;
    this.storeService.updateStatus(Number(s.id), next).subscribe({
      next: () => {
        // Optimistic update
        s.status = next;
        if (this.selectedStore && this.selectedStore.id === s.id) {
          this.selectedStore.status = next;
        }
        this.toast.show(`Store ${next === 'OPEN' ? 'opened' : 'closed'}`);
        this.logAudit('Store Status Update', 'info', `Store ${s.name} -> ${next}`);
      },
      error: (e) => this.toast.show(e.error?.message || 'Failed to update store status', 'error')
    });
  }

  loadStoreComparison() {
    this.adminService.getStoreComparison().subscribe({
      next: (data) => {
        this.storeComparison = data;
        setTimeout(() => this.buildComparisonChart(), 300);
      },
      error: () => this.toast.show('Failed to load comparison data', 'error')
    });
  }

  private buildComparisonChart() {
    if (!this.storeComparisonCanvas?.nativeElement) return;
    if (this.compChart) this.compChart.destroy();
    const labels = this.storeComparison.map(s => s.name);
    this.compChart = new Chart(this.storeComparisonCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue ($)',
            data: this.storeComparison.map(s => s.revenue),
            backgroundColor: 'rgba(62,207,178,0.7)',
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Orders',
            data: this.storeComparison.map(s => s.orders),
            backgroundColor: 'rgba(107,168,200,0.7)',
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#7A918D', font: { size: 10 }, padding: 16 } }
        },
        scales: {
          x: { ticks: { color: '#7A918D' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { position: 'left', ticks: { color: '#3ECFB2' }, grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Revenue ($)', color: '#3ECFB2', font: { size: 10 } } },
          y1: { position: 'right', ticks: { color: '#6BA8C8' }, grid: { display: false }, title: { display: true, text: 'Orders', color: '#6BA8C8', font: { size: 10 } } }
        }
      }
    });
  }

  saveSettings(event: any) {
    const btn = event.currentTarget;
    const oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Saving...';
    setTimeout(() => {
      this.toast.show('Settings updated');
      btn.innerHTML = oldHtml;
      btn.disabled = false;
    }, 1000);
  }

  clearAiChat() {
    this.aiPrompt = '';
    this.aiBusy = false;
    // AiService has session support; reset it if available.
    this.ai.sessionId = null;
    this.aiChatMessages = [
      { sender: 'ai', text: 'New session started. Try: “Compare total revenue of all stores”.' }
    ];
    this.aiHistory = [];
  }

  seedAiExample(q: string) {
    this.aiPrompt = q;
    this.sendAiQuery();
  }

  sendAiQuery() {
    const q = (this.aiPrompt || '').trim();
    if (!q || this.aiBusy) return;
    this.aiPrompt = '';
    this.aiBusy = true;
    this.aiChatMessages.push({ sender: 'user', text: q });

    this.ai.query(q, this.aiHistory).subscribe({
      next: (res: any) => {
        const cleaned = this.cleanAiResponse(res?.response);
        const noDataHint = this.buildNoDataHintIfNeeded(q, res);
        this.aiChatMessages.push({
          sender: 'ai',
          text: cleaned || 'No response',
          blocked: !!res?.blocked,
          detection_type: res?.detection_type,
          guardrail: res?.guardrail,
          requested_store_id: res?.requested_store_id,
          noDataHint,
        });
        this.aiHistory.push('User: ' + q, 'AI: ' + (cleaned || ''));
        this.aiBusy = false;
      },
      error: (e) => {
        const msg = e?.error?.message || e?.message || 'Request failed';
        this.aiChatMessages.push({ sender: 'ai', text: `Sorry, something went wrong: ${msg}` });
        this.aiBusy = false;
      }
    });
  }

  private cleanAiResponse(v: any): string {
    if (v == null) return '';
    let s = String(v);
    const trimmed = s.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      try {
        s = JSON.parse(trimmed);
      } catch {
        s = trimmed.slice(1, -1);
      }
    }
    s = s.replace(/\\n/g, '\n').replace(/\\t/g, '  ').replace(/\\"/g, '"');
    s = s.replace(/\*\*"?Summary"?\*\*:?/gi, 'Summary:\n');
    s = s.replace(/\*\*"?Analysis"?\*\*:?/gi, '\nAnalysis:\n');
    s = s.replace(/\*\*"?Recommendation"?\*\*:?/gi, '\nRecommendation:\n');
    s = s.replace(/"\s*\*\*/g, '**').replace(/\*\*\s*"/g, '**');
    return s.trim();
  }

  private buildNoDataHintIfNeeded(userQuery: string, res: any): string | null {
    if (res?.blocked) return null;
    const dataLen = Array.isArray(res?.data) ? res.data.length : 0;
    if (dataLen > 0) return null;
    const q = (userQuery || '').toLowerCase();
    const isThisMonth = q.includes('this month') || q.includes('bu ay');
    if (isThisMonth) {
      return 'It looks like there are no matching rows for this month. Try “last month” or “last 90 days”, or create a test order so analytics has data.';
    }
    return 'No matching rows were returned. Try widening the date range (e.g., “last 90 days”) or verify that there is data in the database.';
  }

  banUser(u: any) {
    if (!confirm(`Ban ${u.fullName}?`)) return;
    this.adminService.banUser(u.userId).subscribe(() => {
      this.toast.show('User banned');
      this.logAudit('Ban User', 'warning', `Banned ${u.fullName}`);
      this.refreshData();
    });
  }

  unbanUser(u: any) {
    if (!confirm(`Unban ${u.fullName}?`)) return;
    this.adminService.unbanUser(u.userId).subscribe(() => {
      this.toast.show('User unbanned');
      this.logAudit('Unban User', 'info', `Unbanned ${u.fullName}`);
      u.enabled = true;
      this.refreshData();
    });
  }

  openUserAdd() {
    this.userAddModel = { fullName: '', email: '', passwordHash: '' };
    this.userAddOpen = true;
    this.userAddSaving = false;
  }

  closeUserAdd() {
    this.userAddOpen = false;
    this.userAddSaving = false;
  }

  saveUserAdd() {
    const m = this.userAddModel;
    if (!m.fullName || !m.email || !m.passwordHash) {
      this.toast.show('Please fill all fields', 'error');
      return;
    }
    this.userAddSaving = true;
    this.http.post<any>(apiRoot() + '/auth/register', m).subscribe({
      next: () => {
        this.toast.show('User created successfully');
        this.logAudit('Create User', 'success', `Created ${m.email}`);
        this.closeUserAdd();
        this.refreshData();
      },
      error: (e) => {
        this.userAddSaving = false;
        this.toast.show(e.error?.message || 'Failed to create user', 'error');
      }
    });
  }

  resetOrderStatus(o: any) {
    const id = Number(o?.orderId);
    if (!id) return;
    delete this.orderStatusDraft[id];
  }

  saveOrderStatus(o: any) {
    const id = Number(o?.orderId);
    if (!id) return;
    const next = String(this.orderStatusDraft[id] || o?.status || '').trim().toUpperCase();
    if (!next || next === String(o?.status || '').toUpperCase()) return;
    if (!this.orderStatusOptions.includes(next)) {
      this.toast.show('Invalid status', 'error');
      return;
    }
    this.orderSaving[id] = true;
    this.orderService.updateStatus(id, next).subscribe({
      next: (updated: any) => {
        o.status = updated?.status || next;
        delete this.orderStatusDraft[id];
        this.orderSaving[id] = false;
        this.toast.show('Order status updated');
        this.logAudit('Update Order Status', 'info', `Order #${id} -> ${o.status}`);
      },
      error: (e) => {
        this.orderSaving[id] = false;
        this.toast.show(e.error?.message || 'Failed to update order status', 'error');
      }
    });
  }

  openUserEdit(u: any) {
    if (!u) return;
    this.userEditModel = {
      userId: u.userId,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      enabled: u.enabled !== false,
    };
    this.userEditOpen = true;
  }

  closeUserEdit() {
    this.userEditOpen = false;
    this.userEditSaving = false;
  }

  saveUserEdit() {
    const m = this.userEditModel;
    if (!m?.userId) return;
    this.userEditSaving = true;

    // PUT endpoint expects a user-like payload.
    const payload = {
      userId: m.userId,
      fullName: (m.fullName || '').trim(),
      email: m.email,
      role: m.role,
      enabled: !!m.enabled,
      // passwordHash intentionally omitted
    };

    this.adminService.updateUser(Number(m.userId), payload).subscribe({
      next: () => {
        this.toast.show('User updated');
        this.logAudit('Update User', 'info', `Updated ${payload.email} role=${payload.role} enabled=${payload.enabled}`);
        this.userEditSaving = false;
        this.userEditOpen = false;
        this.refreshData();
      },
      error: (e) => {
        this.userEditSaving = false;
        this.toast.show(e.error?.message || 'Failed to update user', 'error');
      }
    });
  }

  addCategory() {
    const name = prompt('Category name:');
    if (!name) return;
    this.categoryService.create({ name, description: '', active: true }).subscribe({
      next: (c) => {
        this.categories.push(c);
        this.toast.show('Category created');
        this.logAudit('Create Category', 'success', name);
      },
      error: (e) => this.toast.show(e.error?.message || 'Failed to create category', 'error')
    });
  }

  deleteCategory(c: any) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.categoryService.delete(c.categoryId).subscribe({
      next: () => {
        this.categories = this.categories.filter(x => x.categoryId !== c.categoryId);
        this.toast.show('Category deleted');
        this.logAudit('Delete Category', 'warning', c.name);
      },
      error: () => this.toast.show('Failed to delete category', 'error')
    });
  }

  openProductAdd() {
    this.productAddModel = {
      storeId: null,
      name: '',
      brand: '',
      basePrice: 0,
      stockQuantity: 10,
      category: 'Accessories',
      description: '',
      imageUrl: ''
    };
    this.productAddSaving = false;
    this.productAddOpen = true;
  }

  closeProductAdd() {
    this.productAddOpen = false;
    this.productAddSaving = false;
  }

  saveProductAdd() {
    const m = this.productAddModel || {};
    const storeId = Number(m.storeId);
    if (!storeId) {
      this.toast.show('Please select a store', 'error');
      return;
    }
    const name = String(m.name || '').trim();
    if (!name) {
      this.toast.show('Product name is required', 'error');
      return;
    }
    const payload: any = {
      name,
      brand: String(m.brand || '').trim(),
      basePrice: Number(m.basePrice || 0),
      stockQuantity: Number.isFinite(Number(m.stockQuantity)) ? Number(m.stockQuantity) : 0,
      category: String(m.category || '').trim() || 'Accessories',
      description: String(m.description || '').trim(),
      imageUrl: String(m.imageUrl || '').trim(),
      store: { id: storeId }
    };
    this.productAddSaving = true;
    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.productAddSaving = false;
        this.productAddOpen = false;
        this.toast.show('Product created');
        this.logAudit('Create Product', 'success', `${payload.name} storeId=${storeId}`);
        this.refreshData();
      },
      error: (e) => {
        this.productAddSaving = false;
        this.toast.show(e.error?.message || 'Failed to create product', 'error');
      }
    });
  }

  openProductEdit(p: any) {
    if (!p) return;
    this.productEditModel = { ...p };
    this.productEditOpen = true;
    this.productEditSaving = false;
  }

  closeProductEdit() {
    this.productEditOpen = false;
    this.productEditSaving = false;
  }

  saveProductEdit() {
    const m = this.productEditModel;
    if (!m || !m.productId) return;
    
    const payload: any = {
      name: String(m.name || '').trim(),
      brand: String(m.brand || '').trim(),
      basePrice: Number(m.basePrice || 0),
      stockQuantity: Number.isFinite(Number(m.stockQuantity)) ? Number(m.stockQuantity) : 0,
      category: String(m.category || '').trim() || 'Accessories',
      description: String(m.description || '').trim(),
      imageUrl: String(m.imageUrl || '').trim()
    };
    
    this.productEditSaving = true;
    this.productService.updateProduct(m.productId, payload).subscribe({
      next: () => {
        this.productEditSaving = false;
        this.productEditOpen = false;
        this.toast.show('Product updated');
        this.logAudit('Update Product', 'info', `${payload.name} ID=${m.productId}`);
        this.refreshData();
      },
      error: (e) => {
        this.productEditSaving = false;
        this.toast.show(e.error?.message || 'Failed to update product', 'error');
      }
    });
  }

  deleteProduct(p: any) {
    if (!p || !p.productId) return;
    if (!confirm(`Delete product "${p.name}"?`)) return;
    
    this.productService.deleteProduct(p.productId).subscribe({
      next: () => {
        this.toast.show('Product deleted');
        this.logAudit('Delete Product', 'warning', `${p.name} ID=${p.productId}`);
        this.refreshData();
      },
      error: (e) => this.toast.show(e.error?.message || 'Failed to delete product', 'error')
    });
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
