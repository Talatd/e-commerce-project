import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService, OrderService, AdminService, AuthService, ToastService, AiService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';
import { Chart } from './chart-register';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NexusLogoComponent, NexusThemeToggleComponent],
  template: `
<style>
:host{
  --bg:#080808;--glass:rgba(255,255,255,0.04);--glass2:rgba(255,255,255,0.07);
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --teal:#3ECFB2;--teal2:#6EDEC8;--teal-dim:rgba(62,207,178,0.1);--teal-glow:rgba(62,207,178,0.18);
  --text:#E6F0EE;--text2:#6A8A84;--text3:#344844;
  --green:#3EC98A;--green-dim:rgba(62,201,138,0.08);--green-border:rgba(62,201,138,0.2);
  --red:#E07070;--red-dim:rgba(224,112,112,0.08);--red-border:rgba(224,112,112,0.2);
  --amber:#E8A94A;--amber-dim:rgba(232,169,74,0.08);
  --blue:#6BA8C8;--blue-dim:rgba(107,168,200,0.08);
}
:host-context(html.light-mode){
  --bg:#F5F2ED;--glass:rgba(0,0,0,0.04);--glass2:rgba(0,0,0,0.07);
  --border:rgba(0,0,0,0.08);--border2:rgba(0,0,0,0.15);
  --teal:#2BA898;--teal2:#1EA393;--teal-dim:rgba(43,168,152,0.15);--teal-glow:rgba(43,168,152,0.2);
  --text:#1A1916;--text2:#8A8070;--text3:#A09888;
  --green:#2BA871;--green-dim:rgba(43,168,113,0.15);--green-border:rgba(43,168,113,0.2);
  --red:#C74A4A;--red-dim:rgba(199,74,74,0.12);--red-border:rgba(199,74,74,0.2);
  --amber:#E8A94A;--amber-dim:rgba(232,169,74,0.12);
  --blue:#4A8AC7;--blue-dim:rgba(74,138,199,0.12);
}
:host-context(html.light-mode) .mn{background:rgba(245,242,237,0.96);}
:host-context(html.light-mode) .msb{background:rgba(245,242,237,0.55);}
:host-context(html.light-mode) .mss{background:rgba(255,255,255,0.92);border-color:var(--border2);}
:host-context(html.light-mode) .msr{background:transparent;}
:host-context(html.light-mode) .mtog.off{background:rgba(0,0,0,0.04);}
:host-context(html.light-mode) .mtog.off .mtog-t{background:rgba(26,25,22,0.35);}
.mp{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);overflow:hidden;display:flex;flex-direction:column;height:100vh;}
.mn{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;border-bottom:1px solid var(--border);background:rgba(8,8,8,0.95);backdrop-filter:blur(20px);flex-shrink:0;z-index:20;}
.mlogo{font-family:'Playfair Display',serif;font-style:italic;font-size:18px;color:var(--text);display:flex;align-items:center;gap:7px;}
.mlogo-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);box-shadow:0 0 6px var(--teal-glow);}
.mbadge{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);font-size:9px;padding:2px 9px;border-radius:8px;letter-spacing:0.06em;text-transform:uppercase;}
.mnr{display:flex;align-items:center;gap:8px;}
.mni{width:32px;height:32px;border-radius:50%;background:var(--glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;}
.mnb{position:absolute;top:-2px;right:-2px;width:13px;height:13px;border-radius:50%;background:var(--red);color:#fff;font-size:7px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--bg);}
.mup{display:flex;align-items:center;gap:7px;padding:4px 11px 4px 4px;border-radius:20px;background:var(--glass);border:1px solid var(--border2);cursor:pointer;}
.muav{width:26px;height:26px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--teal);}
.mbd{display:flex;flex:1;overflow:hidden;}
.msb{width:196px;min-width:196px;border-right:1px solid var(--border);display:flex;flex-direction:column;padding:14px 10px;background:rgba(8,8,8,0.5);}
.msl{font-size:8px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text3);padding:0 10px;margin-bottom:5px;margin-top:12px;}
.msl:first-child{margin-top:0;}
.msi{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:20px;font-size:12.5px;color:var(--text2);cursor:pointer;transition:all 0.15s;margin-bottom:1px;justify-content:space-between;}
.msi.act{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.18);}
.msi:not(.act):hover{background:var(--glass2);color:var(--text);}
.msil{display:flex;align-items:center;gap:8px;}
.msib{font-size:9px;padding:1px 6px;border-radius:8px;background:var(--amber-dim);color:var(--amber);border:1px solid rgba(232,169,74,0.2);}
.msib.red{background:var(--red-dim);color:var(--red);border-color:var(--red-border);}
.msi-info{margin-top:auto;padding:10px;border-top:1px solid var(--border);}
.msi-card{background:var(--glass);border:1px solid rgba(62,207,178,0.15);border-radius:10px;padding:10px 12px;}
.msi-name{font-size:12px;font-weight:500;color:var(--text);margin-bottom:2px;}
.msi-status{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--green);}
.msi-dot{width:5px;height:5px;border-radius:50%;background:var(--green);box-shadow:0 0 4px rgba(62,201,138,0.4);}
.mmain{flex:1;overflow-y:auto;padding:18px 20px;}
.mmain::-webkit-scrollbar{width:2px;}
.mmain::-webkit-scrollbar-thumb{background:var(--border2);}
.mtb{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px;}
.mpt{font-family:'Playfair Display',serif;font-size:20px;font-style:italic;color:var(--text);}
.mps{font-size:11px;color:var(--text3);margin-top:3px;}
.mta{display:flex;gap:7px;}
.mtbtn{padding:7px 14px;border-radius:20px;font-size:11.5px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s;}
.mtbg{background:var(--glass);border:1px solid var(--border2);color:var(--text2);}
.mtbg:hover{color:var(--text);}
.mtbt{background:var(--teal);color:#080808;border:none;font-weight:600;}
.mtbt:hover{background:var(--teal2);}
.mkr{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;}
.mkpi{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:13px 14px;position:relative;overflow:hidden;}
.mkpi::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(62,207,178,0.18),transparent);}
.mkl{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;}
.mkv{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);line-height:1;margin-bottom:4px;}
.mkv em{font-style:italic;color:var(--teal2);}
.mkd{font-size:10px;}
.mup-c{color:var(--green);}
.mdn{color:var(--red);}
.mcr{display:grid;grid-template-columns:1fr 200px;gap:10px;margin-bottom:12px;}
.mgc{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.mgh{padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.mgt{font-size:9.5px;letter-spacing:0.09em;text-transform:uppercase;color:var(--text2);}
.mgm{font-size:10px;color:var(--text3);}
.mgb{padding:12px 14px;}
.mbc{display:flex;align-items:stretch;gap:5px;height:72px;}
.mbcc{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;flex:1;height:72px;}
.mbcb{width:100%;border-radius:3px 3px 0 0;background:rgba(62,207,178,0.15);cursor:pointer;}
.mbcb.hi{background:rgba(62,207,178,0.6);}
.mbcb:hover{background:rgba(62,207,178,0.35);}
.mbcl{
  font-size:9.5px;
  color:rgba(122,145,141,0.95);
  font-family:'JetBrains Mono',monospace;
  letter-spacing:0.01em;
  white-space:nowrap;
}
.mleg{display:flex;flex-direction:column;gap:6px;}
.mli{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--text2);}
.mld{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.mlp{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);margin-left:auto;}
.mtc{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;}
.mt{width:100%;border-collapse:collapse;}
.mt th{padding:8px 13px;font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);text-align:left;font-weight:400;border-bottom:1px solid var(--border);}
.mt td{padding:8px 13px;font-size:12px;color:var(--text2);border-bottom:1px solid rgba(255,255,255,0.03);}
.mt tr:last-child td{border:none;}
.mt tr:hover td{background:rgba(255,255,255,0.015);}
.mtn{color:var(--text);font-weight:500;}
.mtm{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--teal);opacity:0.75;}
.mtp{font-family:'Playfair Display',serif;font-size:13px;color:var(--text);}
.msp{display:inline-flex;align-items:center;gap:3px;font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;}
.mspg{background:var(--green-dim);color:var(--green);}
.mspb{background:var(--blue-dim);color:var(--blue);}
.mspa{background:var(--amber-dim);color:var(--amber);}
.mspr{background:var(--red-dim);color:var(--red);}
.mpg{
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));
  gap:12px;
}
.mpc{
  background:var(--glass);
  border:1px solid var(--border);
  border-radius:14px;
  overflow:hidden;
  transition:border-color 0.15s, transform 0.15s;
  display:flex;
  flex-direction:column;
  min-width:0;
}
.mpc:hover{border-color:var(--border2); transform:translateY(-1px);}
.mpci{
  height:110px;
  position:relative;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  border-bottom:1px solid var(--border);
  background:rgba(255,255,255,0.02);
}
.mpci::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse 90% 90% at 50% 50%,rgba(0,0,0,0) 25%,rgba(0,0,0,0.25) 100%);}
:host-context(html.light-mode) .mpci::after{background:radial-gradient(ellipse 90% 90% at 50% 50%,rgba(0,0,0,0) 22%,rgba(0,0,0,0.2) 100%);}
.mpci-photo{position:absolute;inset:3px;width:calc(100% - 6px);height:calc(100% - 6px);object-fit:cover;object-position:center;border-radius:8px;z-index:1;display:block;}
.mpcb{padding:12px 12px 12px;}
.mpcn{font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px; line-height:1.25;}
.mpcpr{font-family:'Playfair Display',serif;font-size:15px;color:var(--text);}
.mpcrw{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px; gap:10px;}
.mpcs{font-size:10px;padding:2px 7px;border-radius:8px;}
.mpcsok{background:var(--green-dim);color:var(--green);}
.mpcsl{background:var(--amber-dim);color:var(--amber);}
.mpca{display:flex;gap:6px; margin-top:auto;}
.mpcbtn{
  flex:1;
  padding:7px 0;
  border-radius:9px;
  font-size:11px;
  cursor:pointer;
  text-align:center;
  border:1px solid var(--border);
  background:var(--glass2);
  color:var(--text2);
  transition:all 0.15s;
  font-family:'Plus Jakarta Sans',sans-serif;
  user-select:none;
}
.mpcbtn:hover{color:var(--text);}
.mpcbtn.del:hover{color:var(--red);border-color:var(--red-border);}

@media (max-width: 980px){
  .msb{width:170px;min-width:170px;}
  .mmain{padding:16px 14px;}
  .mpci{height:105px;}
}
@media (max-width: 760px){
  .msb{display:none;}
  .mmain{padding:14px 12px;}
  .mtb{flex-direction:column; align-items:flex-start; gap:10px;}
  .mta{width:100%; justify-content:flex-start; flex-wrap:wrap;}
  .mtbtn{flex:0 0 auto;}
}
.malert{display:flex;align-items:center;gap:10px;background:var(--amber-dim);border:1px solid rgba(232,169,74,0.18);border-radius:9px;padding:11px 14px;margin-bottom:12px;}
.malert-icon{width:28px;height:28px;border-radius:7px;background:rgba(232,169,74,0.1);border:1px solid rgba(232,169,74,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.malert-text{font-size:12.5px;color:var(--text2);flex:1;line-height:1.5;}
.malert-text strong{color:var(--amber);}
.malert-btn{font-size:11px;padding:5px 12px;border-radius:16px;background:rgba(232,169,74,0.1);border:1px solid rgba(232,169,74,0.2);color:var(--amber);cursor:pointer;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;}
.maf{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:10px;}
.mfg{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.mfl{font-size:10.5px;color:var(--text2);letter-spacing:0.02em;margin-bottom:5px;}
.mfi{background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:8px;padding:9px 12px;font-size:12.5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;outline:none;width:100%;transition:border-color 0.2s;}
.mfi::placeholder{color:var(--text3);}
.mfi:focus{border-color:rgba(62,207,178,0.28);box-shadow:0 0 0 3px rgba(62,207,178,0.05);}
.mss{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;}
.msr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.03);}
.msr:last-child{border-bottom:none;}
.msrl{font-size:13px;color:var(--text);}
.msrd{font-size:11px;color:var(--text3);margin-top:1px;}
.mtog{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;flex-shrink:0;}
.mtog.on{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);}
.mtog.off{background:var(--glass2);border:1px solid var(--border2);}
.mtog-t{position:absolute;top:3px;width:12px;height:12px;border-radius:50%;transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);}
.mtog.on .mtog-t{left:20px;background:var(--teal);}
.mtog.off .mtog-t{left:3px;background:var(--text3);}
@keyframes mfadein{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
.mkpi{animation:mfadein 0.35s ease both;opacity:0;}
.mkpi:nth-child(1){animation-delay:0.03s;}
.mkpi:nth-child(2){animation-delay:0.06s;}
.mkpi:nth-child(3){animation-delay:0.09s;}
.mkpi:nth-child(4){animation-delay:0.12s;}
.chat-shell{background:var(--glass);border:1px solid var(--border);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;min-height:520px;}
.chat-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);}
.chat-title{display:flex;align-items:center;gap:10px;}
.chat-name{font-size:13px;font-weight:600;color:var(--text);}
.chat-sub{font-size:11px;color:var(--text3);margin-top:2px;}
.chat-actions{display:flex;gap:8px;}
.chat-btn{padding:6px 12px;border-radius:20px;font-size:11px;background:var(--glass2);border:1px solid var(--border2);color:var(--text2);cursor:pointer;}
.chat-btn:hover{color:var(--text);}
.chat-body{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px;}
.chat-body::-webkit-scrollbar{width:2px;}
.chat-body::-webkit-scrollbar-thumb{background:var(--border2);}
.m-u{display:flex;justify-content:flex-end;}
.m-u-b{max-width:70%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);border-radius:16px 16px 4px 16px;padding:10px 12px;font-size:13px;color:var(--text);line-height:1.55;}
.m-a{display:flex;align-items:flex-start;gap:10px;}
.m-a-av{width:28px;height:28px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.m-a-b{flex:1;background:var(--glass2);border:1px solid var(--border2);border-radius:4px 16px 16px 16px;padding:10px 12px;font-size:13px;color:var(--text2);line-height:1.6;}
.ai-text{white-space:pre-wrap;color:var(--text2);font-size:13px;line-height:1.8;letter-spacing:0.01em;}
.ai-text b{color:var(--text);font-weight:650;}
.ai-hint{margin-top:10px;padding:10px 12px;background:rgba(232,169,74,0.08);border:1px solid rgba(232,169,74,0.18);border-radius:10px;color:var(--text2);font-size:12px;line-height:1.65;}
.ai-hint .t{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--amber);margin-bottom:6px;font-weight:700;}
.gr{background:var(--red-dim);border:1px solid rgba(224,112,112,0.25);border-radius:10px;padding:10px 12px;margin-bottom:8px;}
.gr-h{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--red);margin-bottom:8px;}
.gr-r{display:grid;grid-template-columns:140px 1fr;gap:6px 10px;font-size:11.5px;}
.gr-k{color:var(--text3);}
.gr-v{color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:11px;}
.chat-foot{border-top:1px solid var(--border);padding:12px 16px;}
.chat-in{display:flex;gap:10px;align-items:center;background:rgba(255,255,255,0.05);border:1px solid var(--border2);border-radius:14px;padding:10px 12px;}
.chat-in input{flex:1;background:transparent;border:none;outline:none;color:var(--text);font-size:13px;}
.chat-send{width:34px;height:34px;border-radius:50%;background:var(--teal);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.chat-send:disabled{opacity:0.5;cursor:not-allowed;}
.chat-send:hover:not(:disabled){background:var(--teal2);}
.typing-row{display:flex;align-items:flex-start;gap:10px;opacity:0.95;}
.typing-bubble{background:var(--glass2);border:1px solid var(--border2);border-radius:4px 16px 16px 16px;padding:10px 12px;display:flex;align-items:center;gap:10px;min-width:170px;}
.typing-label{font-size:12px;color:var(--text3);}
.dots{display:inline-flex;gap:4px;align-items:center;}
.dot{width:5px;height:5px;border-radius:50%;background:rgba(110,222,200,0.8);animation:dotb 1s infinite ease-in-out;}
.dot:nth-child(2){animation-delay:0.15s;opacity:0.8;}
.dot:nth-child(3){animation-delay:0.3s;opacity:0.6;}
@keyframes dotb{0%,80%,100%{transform:translateY(0);opacity:0.5;}40%{transform:translateY(-3px);opacity:1;}}
</style>

<div class="mp">
  <!-- NAVBAR -->
  <div class="mn">
    <div style="display:flex;align-items:center;gap:10px;">
      <div class="mlogo"><app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo></div>
      <div class="mbadge">Manager</div>
    </div>
    <div class="mnr">
      <app-nexus-theme-toggle></app-nexus-theme-toggle>
      <div class="mni">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.8 1.5 3 3.3 3 5.5V8l-1 1.5h10L11 8V5.5c0-2.2-1.8-4-4-4Z" stroke="#6A8A84" stroke-width="1.1"/><path d="M5.5 11c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="#6A8A84" stroke-width="1.1"/></svg>
        <div class="mnb">3</div>
      </div>
      <div class="mup" (click)="logout()">
        <div class="muav">{{auth.currentUserValue?.fullName?.substring(0,2)?.toUpperCase()}}</div>
        <span style="font-size:12px;color:var(--text);font-weight:500;">{{auth.currentUserValue?.fullName}}</span>
        <span style="font-size:9px;color:var(--text3);">▾</span>
      </div>
    </div>
  </div>

  <div class="mbd">
    <!-- SIDEBAR -->
    <div class="msb">
      <div class="msl">Overview</div>
      <div class="msi" [class.act]="activePanel==='dashboard'" (click)="setPanel('dashboard')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.6"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>Dashboard</div>
      </div>
      <div class="msl">My Store</div>
      <div class="msi" [class.act]="activePanel==='products'" (click)="setPanel('products')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L1 4v5l5.5 3L12 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>Products</div>
        <div class="msib">{{products.length}}</div>
      </div>
      <div class="msi" [class.act]="activePanel==='orders'" (click)="setPanel('orders')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h1.5l2 7h5.5l1.3-4.5H4.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="11" r="1" fill="currentColor"/><circle cx="9.5" cy="11" r="1" fill="currentColor"/></svg>Orders</div>
        <div class="msib red">5</div>
      </div>
      <div class="msi" [class.act]="activePanel==='inventory'" (click)="setPanel('inventory')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10V3h9v7H2Z" stroke="currentColor" stroke-width="1.1"/><path d="M5 6h3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Inventory<span *ngIf="lowStockProducts.length > 0" style="margin-left:auto;background:rgba(232,169,74,0.15);color:#E8A94A;font-size:9px;padding:1px 6px;border-radius:8px;">{{lowStockProducts.length}}</span></div>
      </div>
      <div class="msi" [class.act]="activePanel==='reviews'" (click)="setPanel('reviews')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L8 5h4.5l-3.5 2.5 1.3 4.5L6.5 9.5 2.7 12l1.3-4.5L.5 5H5L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>Reviews</div>
      </div>
      <div class="msi" [class.act]="activePanel==='addprod'" (click)="setPanel('addprod')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Add Product</div>
      </div>
      <div class="msl">Analytics</div>
      <div class="msi" [class.act]="activePanel==='analytics'" (click)="setPanel('analytics')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10L4 6l3 2.5 5-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>Performance</div>
      </div>
      <div class="msi" [class.act]="activePanel==='assistant'" (click)="setPanel('assistant')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L1 4v5l5.5 3L12 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M6.5 1v5.5M1 4l5.5 2.5L12 4" stroke="currentColor" stroke-width="1.1"/></svg>AI Assistant</div>
      </div>
      <div class="msi" [class.act]="activePanel==='customers'" (click)="setPanel('customers')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11.5c0-2.7 2-4 5-4s5 1.3 5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Customers</div>
      </div>
      <div class="msl">Store</div>
      <div class="msi" [class.act]="activePanel==='settings'" (click)="setPanel('settings')">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1M6.5 11v1M1 6.5h1M11 6.5h1M2.6 2.6l.7.7M9.7 9.7l.7.7M2.6 10.4l.7-.7M9.7 3.3l.7-.7" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>Store Settings</div>
      </div>
      <div class="msi-info">
        <div class="msi-card">
          <div class="msi-name">{{auth.currentUserValue?.fullName}}'s Store</div>
          <div class="msi-status"><div class="msi-dot"></div>Open · Live</div>
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="mmain">

      <!-- INVENTORY ALERTS -->
      <ng-container *ngIf="activePanel==='inventory'">
        <div class="mtb"><div><div class="mpt">Inventory Alerts</div><div class="mps">{{lowStockProducts.length}} products need attention</div></div></div>
        <div class="mtc">
          <table class="mt"><thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of lowStockProducts">
              <td class="mtn">{{p.name}}</td>
              <td>{{p.category}}</td>
              <td class="mtp">{{p.stockQuantity}}</td>
              <td><span class="msp" [class.mspa]="p.stockQuantity <= 5" [class.mspb]="p.stockQuantity > 5">{{p.stockQuantity <= 5 ? '⚠ Critical' : 'Low'}}</span></td>
            </tr>
            <tr *ngIf="lowStockProducts.length === 0"><td colspan="4" style="text-align:center;color:var(--text3);padding:32px;">All products are well stocked.</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- REVIEWS -->
      <ng-container *ngIf="activePanel==='reviews'">
        <div class="mtb"><div><div class="mpt">Customer Reviews</div><div class="mps">{{reviews.length}} reviews · Manage product feedback</div></div></div>
        <div class="mtc" *ngIf="reviews.length > 0">
          <table class="mt">
            <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Sentiment</th><th>Response</th><th>Action</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of reviews">
                <td class="mtn">{{r.product?.name || 'N/A'}}</td>
                <td>{{r.user?.fullName || 'Anonymous'}}</td>
                <td style="color:#E8A94A;">{{r.rating}}★</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--text3);">{{r.comment || '—'}}</td>
                <td><span style="padding:2px 6px;border-radius:4px;font-size:10px;" [style.background]="(r.sentimentScore || 0) >= 0.6 ? 'rgba(62,207,178,0.12)' : (r.sentimentScore || 0) <= 0.3 ? 'rgba(224,112,112,0.12)' : 'rgba(232,169,74,0.12)'" [style.color]="(r.sentimentScore || 0) >= 0.6 ? '#3ECFB2' : (r.sentimentScore || 0) <= 0.3 ? '#E07070' : '#E8A94A'">{{r.sentimentScore || 0 | number:'1.1-1'}}</span></td>
                <td style="max-width:150px;font-size:11px;color:var(--text3);">{{r.storeResponse || '—'}}</td>
                <td>
                  <div *ngIf="!r.storeResponse" class="mtbtn mtbt" style="font-size:9px;padding:4px 8px;" (click)="respondToReview(r)">Reply</div>
                  <span *ngIf="r.storeResponse" style="font-size:10px;color:#3ECFB2;">✓ Replied</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="reviews.length === 0" style="text-align:center;padding:48px;color:var(--text3);font-size:12px;">
          No reviews yet for your products.
        </div>
      </ng-container>

      <!-- DASHBOARD -->
      <ng-container *ngIf="activePanel==='dashboard'">
        <div class="mtb">
          <div><div class="mpt">My Store Dashboard</div><div class="mps">{{products.length}} products · {{storeOrders.length}} orders</div></div>
          <div class="mta"><div class="mtbtn mtbg">Download Report</div><div class="mtbtn mtbt" (click)="setPanel('addprod')">+ Add Product</div></div>
        </div>
        <div class="malert" *ngIf="lowStockProducts.length > 0">
          <div class="malert-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L1.5 12h11L7 1.5Z" stroke="#E8A94A" stroke-width="1.1" stroke-linejoin="round"/><path d="M7 6v3M7 11v.3" stroke="#E8A94A" stroke-width="1.1" stroke-linecap="round"/></svg></div>
          <div class="malert-text"><strong>{{lowStockProducts.length}} products low on stock</strong> — {{lowStockAlert}}</div>
          <div class="malert-btn" (click)="setPanel('products')">View Products</div>
        </div>
        <div class="mkr">
          <div class="mkpi"><div class="mkl">Store Revenue</div><div class="mkv">{{filteredRevenue | currency:'USD':'symbol':'1.0-0'}}</div><div class="mkd mup-c">{{filteredOrders.length}} orders</div></div>
          <div class="mkpi"><div class="mkl">Orders</div><div class="mkv">{{storeOrders.length}}</div><div class="mkd mup-c">{{pendingOrders.length}} pending</div></div>
          <div class="mkpi"><div class="mkl">Active Products</div><div class="mkv">{{products.length}}</div><div class="mkd mup-c">{{lowStockProducts.length}} low stock</div></div>
          <div class="mkpi"><div class="mkl">Reviews</div><div class="mkv">{{reviews.length}}</div><div class="mkd mup-c">Avg {{avgReviewRating}}★</div></div>
        </div>
        <div class="mcr">
          <div class="mgc">
            <div class="mgh">
              <div class="mgt">Monthly Revenue</div>
              <div class="mgm">{{monthlyRevenuePeakLabel}}</div>
            </div>
            <div class="mgb">
              <div class="mbc">
                <div class="mbcc" *ngFor="let b of monthlyRevenueBars">
                  <div class="mbcb"
                       [class.hi]="b.hi"
                       [style.height.%]="b.h"
                       [title]="b.v | currency:'USD':'symbol':'1.0-0'"></div>
                  <div class="mbcl" [style.color]="b.hi ? 'var(--teal2)' : ''">{{b.l}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mgc">
            <div class="mgh"><div class="mgt">Category Split</div></div>
            <div class="mgb">
              <div style="display:flex;justify-content:center;margin-bottom:10px;">
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="12"/><circle cx="40" cy="40" r="28" fill="none" stroke="#3ECFB2" stroke-width="12" stroke-dasharray="88 88" stroke-dashoffset="0" transform="rotate(-90 40 40)"/><circle cx="40" cy="40" r="28" fill="none" stroke="#6BA8C8" stroke-width="12" stroke-dasharray="35 141" stroke-dashoffset="-88" transform="rotate(-90 40 40)"/><circle cx="40" cy="40" r="28" fill="none" stroke="#E8A94A" stroke-width="12" stroke-dasharray="23 153" stroke-dashoffset="-123" transform="rotate(-90 40 40)"/><text x="40" y="43" text-anchor="middle" fill="#E6F0EE" font-size="10" font-family="Playfair Display" font-style="italic">$218K</text></svg>
              </div>
              <div class="mleg">
                <div class="mli"><div class="mld" style="background:var(--teal)"></div>Electronics<div class="mlp">50%</div></div>
                <div class="mli"><div class="mld" style="background:var(--blue)"></div>Accessories<div class="mlp">20%</div></div>
                <div class="mli"><div class="mld" style="background:var(--amber)"></div>Peripherals<div class="mlp">13%</div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mtc">
          <div class="mgh"><div class="mgt">Recent Orders</div><div class="mgm" style="cursor:pointer;" (click)="setPanel('orders')">View all →</div></div>
          <table class="mt"><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of sortedStoreOrders.slice(0,5)">
              <td class="mtm">#{{o.orderId}}</td>
              <td class="mtn">{{o.user?.fullName || 'Customer'}}</td>
              <td>{{o.items?.length || 0}} items</td>
              <td class="mtp">{{o.totalAmount | currency}}</td>
              <td><span class="msp" [class.mspg]="o.status==='DELIVERED'" [class.mspb]="o.status==='SHIPPED' || o.status==='PROCESSING'" [class.mspa]="o.status==='PENDING'">{{o.status}}</span></td>
            </tr>
            <tr *ngIf="storeOrders.length === 0"><td colspan="5" style="text-align:center;color:var(--text3);">No orders yet</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- PRODUCTS -->
      <ng-container *ngIf="activePanel==='products'">
        <div class="mtb">
          <div><div class="mpt">My Products</div><div class="mps">{{products.length}} active listings</div></div>
          <div class="mta"><div class="mtbtn mtbg">Import CSV</div><div class="mtbtn mtbt" (click)="activePanel='addprod'">+ Add Product</div></div>
        </div>
        <div class="mpg">
          <div class="mpc" *ngFor="let p of products">
            <div class="mpci" style="background:rgba(62,207,178,0.04);">
              <img *ngIf="p.imageUrl" [src]="p.imageUrl" class="mpci-photo" [alt]="p.name"/>
              <svg *ngIf="!p.imageUrl" width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="4" y="11" width="36" height="22" rx="3.5" stroke="#3ECFB2" stroke-width="1.1" opacity="0.5"/></svg>
            </div>
            <div class="mpcb">
              <div class="mpcn">{{p.name}}</div>
              <div class="mpcrw"><div class="mpcpr">{{p.basePrice | currency}}</div><div class="mpcs" [class.mpcsok]="p.stockQuantity > 10" [class.mpcsl]="p.stockQuantity <= 10">{{p.stockQuantity > 10 ? p.stockQuantity + ' in stock' : p.stockQuantity + ' left'}}</div></div>
              <div class="mpca"><div class="mpcbtn">Edit</div><div class="mpcbtn">Stats</div><div class="mpcbtn del" (click)="deleteProduct(p)">Delete</div></div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ORDERS -->
      <ng-container *ngIf="activePanel==='orders'">
        <div class="mtb">
          <div><div class="mpt">Store Orders</div><div class="mps">{{pendingOrders.length}} pending action</div></div>
          <div class="mta"><div class="mtbtn mtbg">Export</div></div>
        </div>
        <div class="mtc">
          <table class="mt"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of storeOrders">
              <td class="mtm">#ORD-{{o.orderId}}</td>
              <td class="mtn">{{o.user?.fullName || 'N/A'}}</td>
              <td>{{o.items?.length || 0}}</td>
              <td class="mtp">{{o.totalAmount | currency}}</td>
              <td>{{o.orderDate | date:'mediumDate'}}</td>
              <td><span class="msp" [class.mspg]="o.status === 'DELIVERED'" [class.mspb]="o.status === 'SHIPPED' || o.status === 'PROCESSING'" [class.mspa]="o.status === 'PENDING'">{{o.status}}</span></td>
            </tr>
            <tr *ngIf="storeOrders.length === 0"><td colspan="6" style="text-align:center;color:var(--text3);padding:32px;">No orders yet.</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- ADD PRODUCT -->
      <ng-container *ngIf="activePanel==='addprod'">
        <div class="mtb">
          <div><div class="mpt">Add New Product</div><div class="mps">Store listing</div></div>
          <div class="mta"><div class="mtbtn mtbg">Save Draft</div><div class="mtbtn mtbt" (click)="submitProduct()">Publish</div></div>
        </div>
        <div class="maf">
          <div class="mfg" style="margin-bottom:12px;">
            <div><div class="mfl">Product Name</div><input class="mfi" [(ngModel)]="newProd.name" placeholder="e.g. MacBook Pro 14&quot; M3"/></div>
            <div><div class="mfl">Brand</div><input class="mfi" [(ngModel)]="newProd.brand" placeholder="e.g. Apple"/></div>
            <div><div class="mfl">Price ($)</div><input class="mfi" [(ngModel)]="newProd.basePrice" placeholder="0.00" type="number"/></div>
            <div><div class="mfl">Stock Quantity</div><input class="mfi" [(ngModel)]="newProd.stockQuantity" placeholder="0" type="number"/></div>
            <div><div class="mfl">Category</div><input class="mfi" [(ngModel)]="newProd.category" placeholder="e.g. Electronics"/></div>
            <div><div class="mfl">SKU / Barcode</div><input class="mfi" placeholder="e.g. APP-MBP-14-M3" style="font-family:'JetBrains Mono',monospace;"/></div>
          </div>
          <div style="margin-bottom:12px;"><div class="mfl">Description</div><textarea class="mfi" rows="3" style="resize:none;" [(ngModel)]="newProd.description" placeholder="Product description, key features..."></textarea></div>
        </div>
      </ng-container>

      <!-- CUSTOMERS SEGMENTATION -->
      <ng-container *ngIf="activePanel==='customers'">
        <div class="mtb"><div><div class="mpt">Customer Insights</div><div class="mps">Segmentation & behavior analysis</div></div></div>
        <div *ngIf="!segments" style="text-align:center;padding:48px;color:var(--text3);font-size:12px;">Loading...</div>
        <ng-container *ngIf="segments">
          <div class="mkr">
            <div class="mkpi"><div class="mkl">Total Customers</div><div class="mkv">{{segments.totalCustomers}}</div></div>
            <div class="mkpi"><div class="mkl">Avg. Spend</div><div class="mkv">{{segments.avgSpend | currency:'USD':'symbol':'1.0-0'}}</div></div>
            <div class="mkpi"><div class="mkl">Segments</div><div class="mkv">{{segmentKeys(segments.byMembership).length}}</div></div>
            <div class="mkpi"><div class="mkl">Top City</div><div class="mkv" style="font-size:16px;">{{segmentKeys(segments.byCity)[0] || '—'}}</div></div>
          </div>
          <div class="mcr">
            <div class="mgc" style="flex:1;">
              <div class="mgh"><div class="mgt">By Membership Type</div></div>
              <div style="padding:16px;">
                <div *ngFor="let key of segmentKeys(segments.byMembership)" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                  <span style="font-size:12px;">{{key}}</span>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="height:6px;border-radius:3px;background:var(--teal);opacity:0.7;" [style.width.px]="segments.byMembership[key] * 4"></div>
                    <span style="font-size:11px;color:var(--text3);min-width:24px;text-align:right;">{{segments.byMembership[key]}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mgc" style="flex:1;">
              <div class="mgh"><div class="mgt">By Spending Tier</div></div>
              <div style="padding:16px;">
                <div *ngFor="let key of segmentKeys(segments.bySpendTier)" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                  <span style="font-size:12px;">{{key}}</span>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="height:6px;border-radius:3px;background:#6BA8C8;opacity:0.7;" [style.width.px]="segments.bySpendTier[key] * 4"></div>
                    <span style="font-size:11px;color:var(--text3);min-width:24px;text-align:right;">{{segments.bySpendTier[key]}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mtc">
            <div class="mgh"><div class="mgt">Top Cities</div></div>
            <table class="mt">
              <thead><tr><th>City</th><th>Customers</th></tr></thead>
              <tbody><tr *ngFor="let key of segmentKeys(segments.byCity)"><td class="mtn">{{key}}</td><td>{{segments.byCity[key]}}</td></tr></tbody>
            </table>
          </div>
        </ng-container>
      </ng-container>

      <!-- ANALYTICS -->
      <ng-container *ngIf="activePanel==='analytics'">
        <div class="mtb">
          <div><div class="mpt">Store Performance</div><div class="mps">Sales analytics & revenue</div></div>
          <div class="mta" style="display:flex;gap:8px;align-items:center;">
            <input type="date" [(ngModel)]="analyticsDateFrom" (change)="applyDateFilter()" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:6px;font-size:11px;"/>
            <span style="color:var(--text3);font-size:11px;">to</span>
            <input type="date" [(ngModel)]="analyticsDateTo" (change)="applyDateFilter()" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:6px;font-size:11px;"/>
            <div class="mtbtn mtbg" (click)="resetDateFilter()" style="font-size:10px;padding:6px 12px;">Reset</div>
          </div>
        </div>
        <div class="mkr">
          <div class="mkpi"><div class="mkl">Revenue (Filtered)</div><div class="mkv">{{filteredRevenue | currency:'USD':'symbol':'1.0-0'}}</div><div class="mkd mup-c">{{filteredOrders.length}} orders</div></div>
          <div class="mkpi"><div class="mkl">Total Orders</div><div class="mkv">{{filteredOrders.length}}</div><div class="mkd mup-c">In range</div></div>
          <div class="mkpi"><div class="mkl">Avg Order Value</div><div class="mkv">{{filteredOrders.length > 0 ? (filteredRevenue / filteredOrders.length | currency:'USD':'symbol':'1.0-0') : '$0'}}</div><div class="mkd mup-c">Per order</div></div>
          <div class="mkpi"><div class="mkl">Low Stock Items</div><div class="mkv">{{lowStockProducts.length}}</div><div class="mkd" [class.mdn]="lowStockProducts.length > 0" [class.mup-c]="lowStockProducts.length === 0">{{lowStockProducts.length > 0 ? '⚠ Alert' : '✓ OK'}}</div></div>
        </div>
        <div class="mcr">
          <div class="mgc" style="flex:2;">
            <div class="mgh"><div class="mgt">Revenue by Month</div></div>
            <div class="mgb" style="height:260px;"><canvas #mgrRevenueChart></canvas></div>
          </div>
          <div class="mgc" style="flex:1;">
            <div class="mgh"><div class="mgt">Category Split</div></div>
            <div class="mgb" style="height:260px;"><canvas #mgrCategoryChart></canvas></div>
          </div>
        </div>
        <div class="mtc">
          <div class="mgh"><div class="mgt">Products by Price</div></div>
          <table class="mt"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of products.slice(0,8)"><td class="mtn">{{p.name}}</td><td>{{p.category}}</td><td class="mtp">{{p.basePrice | currency}}</td><td [style.color]="p.stockQuantity <= 10 ? '#E8A94A' : 'var(--text2)'">{{p.stockQuantity}}</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- AI ASSISTANT (Corporate / Manager) -->
      <ng-container *ngIf="activePanel==='assistant'">
        <div class="mtb">
          <div><div class="mpt">AI Assistant</div><div class="mps">Store-scoped Text2SQL analytics</div></div>
          <div class="mta"><div class="mtbtn mtbg" (click)="clearAiChat()">New Chat</div></div>
        </div>
        <div class="chat-shell">
          <div class="chat-head">
            <div class="chat-title">
              <div class="m-a-av"><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.3" stroke-linejoin="round"/></svg></div>
              <div>
                <div class="chat-name">Nexus AI</div>
                <div class="chat-sub">Corporate user · Store scope enforced</div>
              </div>
            </div>
            <div class="chat-actions">
              <div class="chat-btn" (click)="seedAiExample('What are the top 5 selling products this month?')">Top 5 products</div>
              <div class="chat-btn" (click)="seedAiExample('Which products are low on stock?')">Low stock</div>
            </div>
          </div>
          <div class="chat-body">
            <ng-container *ngFor="let m of aiChatMessages">
              <div *ngIf="m.sender==='user'" class="m-u"><div class="m-u-b">{{m.text}}</div></div>
              <div *ngIf="m.sender==='ai'" class="m-a">
                <div class="m-a-av"><svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/></svg></div>
                <div class="m-a-b">
                  <div class="gr" *ngIf="m.blocked">
                    <div class="gr-h">Guardrail — BLOCKED</div>
                    <div class="gr-r">
                      <div class="gr-k">detection_type</div><div class="gr-v">{{m.detection_type || '-'}}</div>
                      <div class="gr-k">guardrail</div><div class="gr-v">{{m.guardrail || '-'}}</div>
                      <div class="gr-k">requested_store</div><div class="gr-v">{{m.requested_store_id ? ('#' + m.requested_store_id) : '-'}}</div>
                      <div class="gr-k">session_store</div><div class="gr-v">{{m.session_store_id ? ('#' + m.session_store_id) : '-'}}</div>
                    </div>
                  </div>
                  <div class="ai-text">{{m.text}}</div>
                  <div class="ai-hint" *ngIf="!m.blocked && m.noDataHint">
                    <div class="t">No data / Next steps</div>
                    <div>{{m.noDataHint}}</div>
                  </div>
                  <div *ngIf="m.sql" style="margin-top:10px;">
                    <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;">SQL</div>
                    <div class="sql-block">{{m.sql}}</div>
                  </div>
                </div>
              </div>
            </ng-container>
            <div *ngIf="aiBusy" class="typing-row">
              <div class="m-a-av"><svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/></svg></div>
              <div class="typing-bubble">
                <div class="typing-label">Nexus AI is thinking</div>
                <div class="dots" aria-label="Loading">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="chat-foot">
            <div class="chat-in">
              <input placeholder="Ask about sales, inventory, customers…" [(ngModel)]="aiPrompt" (keyup.enter)="sendAiQuery()" maxlength="500"/>
              <button class="chat-send" (click)="sendAiQuery()" [disabled]="!aiPrompt.trim() || aiBusy">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5L2 2l2 4.5-2 4.5 9-4.5Z" fill="#080808"/></svg>
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- SETTINGS -->
      <ng-container *ngIf="activePanel==='settings'">
        <div class="mtb">
          <div><div class="mpt">Store Settings</div><div class="mps">Configuration</div></div>
          <div class="mta"><div class="mtbtn mtbt">Save Changes</div></div>
        </div>
        <div class="mss">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border);"><div style="font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">Store Status</div></div>
          <div class="msr"><div><div class="msrl">Store Open</div><div class="msrd">Customers can browse and purchase</div></div><div class="mtog" [class.on]="storeSettings.open" [class.off]="!storeSettings.open" (click)="storeSettings.open=!storeSettings.open"><div class="mtog-t"></div></div></div>
          <div class="msr"><div><div class="msrl">Accept New Orders</div><div class="msrd">Toggle off to pause incoming orders</div></div><div class="mtog" [class.on]="storeSettings.acceptOrders" [class.off]="!storeSettings.acceptOrders" (click)="storeSettings.acceptOrders=!storeSettings.acceptOrders"><div class="mtog-t"></div></div></div>
          <div class="msr"><div><div class="msrl">Auto-confirm Orders</div><div class="msrd">Skip manual approval for verified customers</div></div><div class="mtog" [class.on]="storeSettings.autoConfirm" [class.off]="!storeSettings.autoConfirm" (click)="storeSettings.autoConfirm=!storeSettings.autoConfirm"><div class="mtog-t"></div></div></div>
        </div>
        <div class="mss">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border);"><div style="font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">Notifications</div></div>
          <div class="msr"><div><div class="msrl">New Order Alerts</div><div class="msrd">Email + push when order placed</div></div><div class="mtog" [class.on]="storeSettings.newOrderAlerts" [class.off]="!storeSettings.newOrderAlerts" (click)="storeSettings.newOrderAlerts=!storeSettings.newOrderAlerts"><div class="mtog-t"></div></div></div>
          <div class="msr"><div><div class="msrl">Low Stock Warnings</div><div class="msrd">Alert when stock drops below 5</div></div><div class="mtog" [class.on]="storeSettings.lowStockWarnings" [class.off]="!storeSettings.lowStockWarnings" (click)="storeSettings.lowStockWarnings=!storeSettings.lowStockWarnings"><div class="mtog-t"></div></div></div>
        </div>
      </ng-container>

    </div>
  </div>
</div>
  `
})
export class ManagerComponent implements OnInit, AfterViewInit {
  products: any[] = [];
  storeOrders: any[] = [];
  reviews: any[] = [];
  activePanel = 'dashboard';
  newProd: any = { name: '', brand: '', basePrice: 0, stockQuantity: 10, category: 'Electronics', description: '' };
  storeSettings = { open: true, acceptOrders: true, autoConfirm: false, newOrderAlerts: true, lowStockWarnings: true };
  analyticsDateFrom = '';
  analyticsDateTo = '';
  filteredOrders: any[] = [];
  segments: any = null;
  monthlyRevenueBars: { h: number; l: string; hi?: boolean; v: number }[] = [];
  monthlyRevenuePeakLabel = 'Peak: —';
  aiPrompt = '';
  aiBusy = false;
  aiChatMessages: any[] = [
    { sender: 'ai', text: 'Ask me anything about your store analytics. I will generate SQL and summarize results.' }
  ];
  aiHistory: string[] = [];
  productService = inject(ProductService);
  orderService = inject(OrderService);
  adminService = inject(AdminService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  ai = inject(AiService);
  router = inject(Router);

  @ViewChild('mgrRevenueChart') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mgrCategoryChart') categoryCanvas!: ElementRef<HTMLCanvasElement>;
  private revenueChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  ngOnInit() {
    this.productService.getMyStoreProducts().subscribe(res => {
      this.products = Array.isArray(res) ? res : [];
      if (this.activePanel === 'analytics') {
        this.scheduleAnalyticsCharts();
      }
    });
    this.orderService.getMyStoreOrders().subscribe(res => {
      const list = Array.isArray(res) ? res : [];
      // Keep orders stable + readable in UI: newest first.
      this.storeOrders = list.slice().sort((a: any, b: any) => {
        const ta = new Date(a?.orderDate).getTime();
        const tb = new Date(b?.orderDate).getTime();
        const na = isNaN(ta) ? 0 : ta;
        const nb = isNaN(tb) ? 0 : tb;
        return nb - na;
      });
      this.filteredOrders = [...this.storeOrders];
      this.recomputeMonthlyRevenueBars();
      if (this.activePanel === 'analytics') {
        this.scheduleAnalyticsCharts();
      }
    });
    this.productService.getAllReviews().subscribe(res => this.reviews = res);
  }

  ngAfterViewInit() {
    if (this.activePanel === 'analytics') {
      this.scheduleAnalyticsCharts();
    }
  }

  setPanel(panel: string) {
    const prev = this.activePanel;
    this.activePanel = panel;

    // Leaving analytics: destroy charts so we don't keep stale canvases around.
    if (prev === 'analytics' && panel !== 'analytics') {
      if (this.revenueChart) { this.revenueChart.destroy(); this.revenueChart = null; }
      if (this.categoryChart) { this.categoryChart.destroy(); this.categoryChart = null; }
    }

    if (panel === 'customers') {
      this.loadSegments();
    }

    if (panel === 'analytics') {
      this.scheduleAnalyticsCharts();
    }
  }

  private scheduleAnalyticsCharts() {
    // *ngIf mounts canvases after change detection; build charts on next frame.
    const raf = (cb: FrameRequestCallback) =>
      (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
        ? window.requestAnimationFrame(cb)
        : setTimeout(() => cb(0 as any), 0);

    raf(() => raf(() => {
      this.buildRevenueChart();
      this.buildCategoryChart();
    }));
  }

  get sortedStoreOrders(): any[] {
    return this.storeOrders || [];
  }

  private buildRevenueChart() {
    if (!this.revenueCanvas?.nativeElement) return;
    if (this.revenueChart) this.revenueChart.destroy();
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
    (this.storeOrders || []).forEach((o: any) => {
      const d = new Date(o.orderDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const idx = idxByKey.get(key);
      if (idx === undefined) return;
      revenueByMonth[idx] += Number(o.totalAmount || 0);
    });
    this.revenueChart = new Chart(this.revenueCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: months.map(x => x.label),
        datasets: [{
          label: 'Revenue ($)',
          data: revenueByMonth,
          backgroundColor: 'rgba(62,207,178,0.35)',
          borderColor: '#3ECFB2',
          borderWidth: 1,
          borderRadius: 4,
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

  private buildCategoryChart() {
    if (!this.categoryCanvas?.nativeElement) return;
    if (this.categoryChart) this.categoryChart.destroy();
    const catMap: Record<string, number> = {};
    this.products.forEach((p: any) => { catMap[p.category || 'Other'] = (catMap[p.category || 'Other'] || 0) + 1; });
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const palette = ['#3ECFB2', '#6BA8C8', '#E8A94A', '#E07070', '#A78BFA', '#34D399', '#F472B6'];
    this.categoryChart = new Chart(this.categoryCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: palette.slice(0, labels.length), borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#7A918D', padding: 12, font: { size: 10 } } } }
      }
    });
  }

  get lowStockProducts() {
    return this.products.filter(p => p.stockQuantity <= 10);
  }

  get totalRevenue(): number {
    return this.storeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get filteredRevenue(): number {
    return this.filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  applyDateFilter() {
    const from = this.analyticsDateFrom ? new Date(this.analyticsDateFrom) : null;
    const to = this.analyticsDateTo ? new Date(this.analyticsDateTo) : null;
    if (to) to.setHours(23, 59, 59);
    this.filteredOrders = this.storeOrders.filter(o => {
      const d = new Date(o.orderDate);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  resetDateFilter() {
    this.analyticsDateFrom = '';
    this.analyticsDateTo = '';
    this.filteredOrders = [...this.storeOrders];
  }

  private recomputeMonthlyRevenueBars() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const months: { label: string; key: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      months.push({
        label: `${monthNames[m]}`,
        key: `${y}-${String(m + 1).padStart(2, '0')}`,
      });
    }
    const idxByKey = new Map<string, number>(months.map((x, i) => [x.key, i]));
    const revenueByMonth = new Array(12).fill(0);

    // Dashboard should reflect full store performance (not date-filtered analytics).
    (this.storeOrders || []).forEach((o: any) => {
      const d = new Date(o.orderDate);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const idx = idxByKey.get(key);
        if (idx === undefined) return;
        revenueByMonth[idx] += Number(o.totalAmount || 0);
      }
    });

    const max = Math.max(...revenueByMonth, 0);
    const peakIdx = max > 0 ? revenueByMonth.findIndex(v => v === max) : -1;

    // Keep a minimum visible height so months with tiny revenue still show a bar.
    const minPct = 6;
    this.monthlyRevenueBars = months.map((m, i) => {
      const raw = revenueByMonth[i];
      const pct = max > 0 ? Math.round((raw / max) * 100) : 0;
      const h = max > 0 ? Math.max(minPct, pct) : 8;
      return { h, l: m.label, hi: i === peakIdx && max > 0, v: raw };
    });

    if (peakIdx >= 0) {
      const val = Math.round(max);
      this.monthlyRevenuePeakLabel = `Peak: ${months[peakIdx].label} · $${val.toLocaleString()}`;
    } else {
      this.monthlyRevenuePeakLabel = 'Peak: —';
    }
  }

  respondToReview(r: any) {
    const response = prompt('Write your reply to this review:');
    if (response && response.trim()) {
      this.productService.respondToReview(r.reviewId, response.trim()).subscribe({
        next: (updated) => {
          r.storeResponse = updated.storeResponse;
          r.respondedAt = updated.respondedAt;
          this.toast.show('Reply submitted');
        },
        error: () => this.toast.show('Failed to submit reply', 'error')
      });
    }
  }

  loadSegments() {
    if (this.segments) return;
    this.adminService.getCustomerSegments().subscribe({
      next: (data) => this.segments = data,
      error: () => this.toast.show('Failed to load segments', 'error')
    });
  }

  segmentKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  get lowStockAlert(): string {
    return this.lowStockProducts.slice(0, 3).map((p: any) => p.name + ' (' + p.stockQuantity + ' left)').join(', ');
  }

  get avgReviewRating(): string {
    if (!this.reviews?.length) return '—';
    const sum = this.reviews.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  get pendingOrders() {
    return this.storeOrders.filter(o => o.status === 'PENDING');
  }

  submitProduct() {
    if (!this.newProd.name) return;
    this.productService.createProduct(this.newProd).subscribe({
      next: (res) => {
        this.products.push(res);
        this.toast.show('Product added successfully!');
        this.newProd = { name: '', brand: '', basePrice: 0, stockQuantity: 10, category: 'Electronics', description: '' };
        this.activePanel = 'products';
      },
      error: () => this.toast.show('Failed to add product', 'error')
    });
  }

  addProduct() {
    this.setPanel('addprod');
  }

  deleteProduct(p: any) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(p.productId).subscribe({
      next: () => {
        this.products = this.products.filter(item => item.productId !== p.productId);
        this.toast.show('Product deleted');
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  clearAiChat() {
    this.aiPrompt = '';
    this.aiBusy = false;
    this.ai.clearSession();
    this.aiChatMessages = [
      { sender: 'ai', text: 'New session started. Try: “Top 5 selling products this month”.' }
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
          session_store_id: res?.session_store_id,
          requested_store_id: res?.requested_store_id,
          sql: res?.sql,
          noDataHint,
        });
        this.aiHistory.push('User: ' + q, 'AI: ' + (cleaned || ''));
        this.aiBusy = false;
      },
      error: () => {
        this.aiChatMessages.push({ sender: 'ai', text: 'Sorry, something went wrong. Please try again.' });
        this.aiBusy = false;
      }
    });
  }

  private cleanAiResponse(v: any): string {
    if (v == null) return '';
    let s = String(v);

    // If backend accidentally returns a JSON-encoded string, decode it.
    const trimmed = s.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      try {
        s = JSON.parse(trimmed);
      } catch {
        // best effort: strip outer quotes
        s = trimmed.slice(1, -1);
      }
    }

    // Unescape common sequences
    s = s.replace(/\\n/g, '\n').replace(/\\t/g, '  ').replace(/\\"/g, '"');

    // Normalize "Summary/Analysis/Recommendation" style blobs into nicer text.
    s = s.replace(/\*\*"?Summary"?\*\*:?/gi, 'Summary:\n');
    s = s.replace(/\*\*"?Analysis"?\*\*:?/gi, '\nAnalysis:\n');
    s = s.replace(/\*\*"?Recommendation"?\*\*:?/gi, '\nRecommendation:\n');

    // Remove repeated quotes artifacts
    s = s.replace(/"\s*\*\*/g, '**').replace(/\*\*\s*"/g, '**');

    return s.trim();
  }

  private buildNoDataHintIfNeeded(userQuery: string, res: any): string | null {
    if (res?.blocked) return null;
    const dataLen = Array.isArray(res?.data) ? res.data.length : 0;
    const looksEmpty = dataLen === 0;
    if (!looksEmpty) return null;

    const q = (userQuery || '').toLowerCase();
    const isThisMonth = q.includes('this month') || q.includes('bu ay');
    const storeLabel = res?.session_store_id ? `store #${res.session_store_id}` : 'your store';

    if (isThisMonth) {
      return `It looks like there are no matching orders for this month in ${storeLabel}. Try “last month” or “last 90 days”, or create a test order so the dashboard has data.`;
    }

    return `No matching rows were returned. Try widening the date range (e.g., “last 90 days”) or verify there are orders for ${storeLabel}.`;
  }
}
