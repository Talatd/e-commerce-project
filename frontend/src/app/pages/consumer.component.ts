import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AiService, ProductService, OrderService, ToastService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';
import { CONSUMER_NAV } from '../consumer-nav.paths';

@Component({
  selector: 'app-consumer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NexusLogoComponent, NexusThemeToggleComponent],
  template: `
<style>
:host {
  --bg:#080808;--glass:rgba(255,255,255,0.04);--glass2:rgba(255,255,255,0.07);
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --teal:#3ECFB2;--teal2:#6EDEC8;--teal-dim:rgba(62,207,178,0.1);--teal-glow:rgba(62,207,178,0.18);
  --text:#E6F0EE;--text2:#6A8A84;--text3:#344844;
  --green:#3EC98A;--green-dim:rgba(62,201,138,0.08);--green-border:rgba(62,201,138,0.2);
  --red:#E07070;--red-dim:rgba(224,112,112,0.08);--red-border:rgba(224,112,112,0.2);
  --amber:#E8A94A;--amber-dim:rgba(232,169,74,0.08);
  --blue:#6BA8C8;--blue-dim:rgba(107,168,200,0.08);
  --purple:#A78BCC;
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
  --purple:#A78BCC;
}
:host-context(html.light-mode) .navbar{background:rgba(245,242,237,0.96);}
:host-context(html.light-mode) .hero-stat{background:rgba(255,255,255,0.92);border-color:var(--border2);}

.page{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);overflow:hidden;display:flex;flex-direction:column;height:100vh;}

/* NAVBAR */
.navbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid var(--border);background:rgba(8,8,8,0.93);backdrop-filter:blur(20px);flex-shrink:0;z-index:50;}
.logo{font-family:'Playfair Display',serif;font-style:italic;font-size:19px;color:var(--text);display:flex;align-items:center;gap:7px;cursor:pointer;}
.logo-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal-glow);}
.nav-pills{display:flex;gap:2px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:28px;padding:3px;}
.npill{padding:6px 14px;border-radius:20px;font-size:12px;color:var(--text2);cursor:pointer;transition:all 0.15s;}
.npill.active{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.18);}
.nav-r{display:flex;align-items:center;gap:8px;}
.nav-icon{width:34px;height:34px;border-radius:50%;background:var(--glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:border-color 0.15s;text-decoration:none;color:inherit;box-sizing:border-box;}
.nav-icon:hover{border-color:var(--border2);}
.nb{position:absolute;top:-2px;right:-2px;width:15px;height:15px;border-radius:50%;background:var(--teal);color:#080808;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);}
.user-pill{display:flex;align-items:center;gap:7px;padding:4px 12px 4px 4px;border-radius:20px;background:var(--glass);border:1px solid var(--border2);cursor:pointer;}
.uav{width:26px;height:26px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--teal);}

/* MAIN SCROLL */
.main-scroll{flex:1;overflow-y:auto;}
.main-scroll::-webkit-scrollbar{width:2px;}
.main-scroll::-webkit-scrollbar-thumb{background:var(--border2);}

/* === HOME TAB === */
.hero{padding:40px 24px 32px;position:relative;overflow:hidden;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:32px;}
.hero-bg1{position:absolute;top:-60px;left:-40px;width:400px;height:300px;background:radial-gradient(ellipse,rgba(62,207,178,0.07),transparent 65%);pointer-events:none;}
.hero-bg2{position:absolute;bottom:-40px;right:10%;width:280px;height:280px;background:radial-gradient(circle,rgba(107,168,200,0.04),transparent 65%);pointer-events:none;}
.bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(62,207,178,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(62,207,178,0.025) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;mask-image:radial-gradient(ellipse 80% 100% at 30% 50%,black 0%,transparent 100%);}
.hero-left{flex:1;position:relative;z-index:1;}
.hero-greeting{display:inline-flex;align-items:center;gap:6px;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);font-size:11px;padding:5px 14px;border-radius:20px;margin-bottom:16px;letter-spacing:0.04em;}
.greet-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
.hero-title{font-family:'Playfair Display',serif;font-size:38px;font-weight:400;color:var(--text);line-height:1.1;letter-spacing:-0.02em;margin-bottom:12px;}
.hero-title em{font-style:italic;color:var(--teal2);}
.hero-sub{font-size:13.5px;color:var(--text2);line-height:1.7;max-width:400px;font-weight:300;margin-bottom:24px;}
.hero-cta{display:flex;gap:10px;}
.btn-primary{padding:11px 26px;border-radius:24px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;}
.btn-primary:hover{background:var(--teal2);transform:translateY(-1px);box-shadow:0 8px 22px rgba(62,207,178,0.2);}
.btn-ghost{padding:11px 26px;border-radius:24px;background:transparent;color:var(--text2);font-size:13px;cursor:pointer;border:1px solid var(--border2);font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;}
.btn-ghost:hover{color:var(--text);border-color:rgba(255,255,255,0.2);}
.hero-right{display:flex;flex-direction:column;gap:8px;position:relative;z-index:1;flex-shrink:0;}
.hero-stat{background:rgba(12,12,12,0.9);border:1px solid var(--border2);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:10px;backdrop-filter:blur(8px);animation:float 4s ease-in-out infinite;}
.hero-stat:nth-child(2){animation-delay:1.2s;}
.hero-stat:nth-child(3){animation-delay:2.4s;}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
.hs-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hs-val{font-family:'Playfair Display',serif;font-size:16px;color:var(--text);line-height:1;}
.hs-val em{font-style:italic;color:var(--teal2);}
.hs-label{font-size:10px;color:var(--text3);margin-top:1px;}

.quick-section{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;overflow-x:auto;}
.quick-section::-webkit-scrollbar{display:none;}
.qlink{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 20px;border-radius:12px;background:var(--glass);border:1px solid var(--border);cursor:pointer;transition:all 0.2s;flex-shrink:0;min-width:80px;}
.qlink:hover{background:var(--glass2);border-color:rgba(62,207,178,0.15);transform:translateY(-2px);}
.ql-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
.ql-label{font-size:11.5px;color:var(--text2);font-weight:500;white-space:nowrap;}

.flash-section{padding:20px 24px;border-bottom:1px solid var(--border);}
.flash-banner{background:linear-gradient(135deg,rgba(62,207,178,0.08) 0%,rgba(107,168,200,0.05) 100%);border:1px solid rgba(62,207,178,0.15);border-radius:14px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden;}
.flash-banner::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(62,207,178,0.35),transparent);}
.fb-left{display:flex;align-items:center;gap:16px;}
.fb-icon{width:44px;height:44px;border-radius:12px;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.fb-title{font-family:'Playfair Display',serif;font-size:18px;font-style:italic;color:var(--text);margin-bottom:3px;}
.fb-sub{font-size:12px;color:var(--text2);font-weight:300;}
.fb-timer{display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--teal2);}
.fb-unit{background:rgba(62,207,178,0.08);border:1px solid rgba(62,207,178,0.15);border-radius:6px;padding:4px 8px;}
.fb-sep{color:var(--text3);}
.fb-btn{padding:10px 22px;border-radius:20px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;flex-shrink:0;}
.fb-btn:hover{background:var(--teal2);}

.sec-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}
.sec-title{font-family:'Playfair Display',serif;font-size:20px;font-style:italic;color:var(--text);}
.sec-sub{font-size:11px;color:var(--text3);margin-top:3px;}
.sec-link{font-size:12px;color:var(--text3);cursor:pointer;transition:color 0.15s;}
.sec-link:hover{color:var(--teal2);}

.continue-section{padding:20px 24px;border-bottom:1px solid var(--border);}
.continue-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.cs-card{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color 0.15s,transform 0.2s;display:flex;align-items:center;gap:10px;padding:10px 12px;}
.cs-card:hover{border-color:rgba(62,207,178,0.15);transform:translateY(-1px);}
.cs-img{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border);}
.cs-name{font-size:12px;font-weight:500;color:var(--text);margin-bottom:2px;line-height:1.3;}
.cs-progress-wrap{display:flex;align-items:center;gap:6px;margin-top:4px;}
.cs-progress{flex:1;height:2px;background:rgba(255,255,255,0.06);border-radius:1px;overflow:hidden;}
.cs-fill{height:100%;background:var(--teal);border-radius:1px;}
.cs-pct{font-size:9.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;}

.trending-section{padding:20px 24px;border-bottom:1px solid var(--border);}
.categories-section{padding:20px 24px;}
.cat-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;}
.cat-card{background:var(--glass);border:1px solid var(--border);border-radius:11px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all 0.2s;text-align:center;}
.cat-card:hover{background:var(--glass2);border-color:rgba(62,207,178,0.15);transform:translateY(-2px);}
.cat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
.cat-name{font-size:11.5px;color:var(--text2);font-weight:500;}
.cat-count{font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;}

/* === SHOP TAB === */
.search-hero{padding:28px 24px 0;background:linear-gradient(180deg,rgba(62,207,178,0.04) 0%,transparent 100%);border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.sh-glow{position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:500px;height:200px;background:radial-gradient(ellipse,rgba(62,207,178,0.06),transparent 70%);pointer-events:none;}
.sh-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;position:relative;z-index:1;}
.sh-title{font-family:'Playfair Display',serif;font-size:22px;font-style:italic;color:var(--text);}
.sh-sub{font-size:12px;color:var(--text3);margin-top:3px;}
.search-bar{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border2);border-radius:12px;padding:11px 16px;margin-bottom:16px;position:relative;z-index:1;transition:border-color 0.2s,box-shadow 0.2s;}
.search-bar:focus-within{border-color:rgba(62,207,178,0.3);box-shadow:0 0 0 3px rgba(62,207,178,0.05);}
.search-bar input{flex:1;background:transparent;border:none;outline:none;font-size:14px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;caret-color:var(--teal);}
.search-bar input::placeholder{color:var(--text3);}
.search-count{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);white-space:nowrap;}
.cat-row{display:flex;gap:7px;padding-bottom:16px;overflow-x:auto;position:relative;z-index:1;}
.cat-row::-webkit-scrollbar{display:none;}
.cat-pill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text2);transition:all 0.15s;white-space:nowrap;flex-shrink:0;}
.cat-pill.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.cat-pill:not(.active):hover{background:var(--glass2);color:var(--text);}

.shop-body{display:flex;flex:1;min-height:500px;}
.filter-sidebar{width:210px;min-width:210px;border-right:1px solid var(--border);padding:16px 12px;transition:width 0.35s cubic-bezier(0.4,0,0.2,1),min-width 0.35s,opacity 0.25s;overflow-y:auto;}
.filter-sidebar.collapsed{width:0;min-width:0;opacity:0;overflow:hidden;padding:0;}
.fs-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.fs-title{font-size:10px;letter-spacing:0.13em;text-transform:uppercase;color:var(--text2);font-weight:500;}
.fs-clear{font-size:10px;color:var(--text3);cursor:pointer;transition:color 0.15s;}
.fs-clear:hover{color:var(--red);}
.fsec{margin-bottom:18px;}
.fsec-label{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
.fsec-body{display:flex;flex-direction:column;gap:4px;}
.fcheck{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:7px;cursor:pointer;transition:background 0.12s;}
.fcheck:hover{background:var(--glass);}
.fbox{width:15px;height:15px;border-radius:4px;border:1px solid var(--border2);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
.fcheck.on .fbox{background:var(--teal-dim);border-color:rgba(62,207,178,0.3);}
.flabel{font-size:12px;color:var(--text2);transition:color 0.15s;}
.fcheck.on .flabel{color:var(--text);}
.fcount{margin-left:auto;font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.price-inputs{display:flex;align-items:center;gap:6px;margin-top:6px;}
.pinput{flex:1;background:var(--glass);border:1px solid var(--border);border-radius:7px;padding:7px 9px;font-size:11.5px;color:var(--text);font-family:'JetBrains Mono',monospace;outline:none;width:100%;transition:border-color 0.2s;}
.pinput:focus{border-color:rgba(62,207,178,0.28);}
.psep{font-size:11px;color:var(--text3);}
.rating-opts{display:flex;flex-direction:column;gap:4px;}
.ropt{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:7px;cursor:pointer;transition:background 0.12s;}
.ropt:hover{background:var(--glass);}
.ropt.sel{background:var(--teal-dim);}
.rstar{font-size:11px;color:var(--amber);}
.rstare{font-size:11px;color:var(--text3);}
.rlabel{font-size:11.5px;color:var(--text2);}

.products-area{flex:1;padding:16px 18px;overflow-y:auto;}
.products-area::-webkit-scrollbar{width:2px;}
.products-area::-webkit-scrollbar-thumb{background:var(--border2);}
.active-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;min-height:0;}
.achip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.2);}
.achip-x{cursor:pointer;opacity:0.7;font-size:13px;line-height:1;}
.results-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.rb-count{font-size:12px;color:var(--text2);}
.rb-count span{color:var(--text);font-weight:500;}
.rb-sort{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text2);background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:5px 13px;cursor:pointer;}

.prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.pcard{background:var(--glass);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:border-color 0.2s,transform 0.2s;position:relative;}
.pcard:hover{border-color:rgba(62,207,178,0.2);transform:translateY(-3px);}
.pcard:hover .pc-quick{opacity:1;}
.pcard:hover .pc-wish{opacity:1;}
.pc-img{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.pc-img::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:3;border-radius:inherit;background:radial-gradient(ellipse 85% 85% at 50% 48%,rgba(0,0,0,0) 32%,rgba(0,0,0,0.15) 62%,rgba(0,0,0,0.45) 100%);}
:host-context(html.light-mode) .pc-img::after{background:radial-gradient(ellipse 85% 85% at 50% 48%,rgba(0,0,0,0) 28%,rgba(0,0,0,0.12) 58%,rgba(0,0,0,0.35) 100%);}
.pc-img-glow{position:absolute;inset:0;opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:2;}
.pc-img-photo{position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);object-fit:cover;object-position:center;border-radius:14px;z-index:1;display:block;}
.pcard:hover .pc-img-glow{opacity:1;}
/* Etiketler ürün adının altında, yatay sarma (görsel üstüne binmez) */
.pc-badges{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:0 0 8px 0;position:static;}
.pc-badge{font-size:9px;padding:2px 8px;border-radius:8px;font-weight:600;}
.b-new{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.2);}
.b-sale{background:rgba(224,112,112,0.1);color:var(--red);border:1px solid rgba(224,112,112,0.18);}
.b-hot{background:rgba(232,169,74,0.1);color:var(--amber);border:1px solid rgba(232,169,74,0.18);}
.pc-wish{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:rgba(8,8,8,0.7);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text3);opacity:0;transition:opacity 0.2s;cursor:pointer;z-index:6;}
.pc-wish:hover{color:var(--red);border-color:rgba(224,112,112,0.3);}
.pc-quick{position:absolute;bottom:0;left:0;right:0;padding:10px;background:linear-gradient(0deg,rgba(8,8,8,0.9) 0%,transparent 100%);opacity:0;transition:opacity 0.2s;display:flex;gap:6px;z-index:5;}
.pc-quick-btn{flex:1;padding:7px 0;border-radius:20px;background:var(--teal);color:#080808;font-size:11px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:background 0.15s;text-align:center;}
.pc-quick-btn:hover{background:var(--teal2);}
.pc-body{padding:11px 13px;}
.pc-brand{font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:3px;}
.pc-name{font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px;line-height:1.3;}
.pc-stars{display:flex;align-items:center;gap:5px;margin-bottom:7px;}
.pc-star{color:var(--amber);font-size:10px;}
.pc-rcount{font-size:10px;color:var(--text3);}
.pc-bottom{display:flex;align-items:center;justify-content:space-between;}
.pc-price{font-family:'Playfair Display',serif;font-size:16px;color:var(--text);}
.pc-price-old{font-size:11px;color:var(--text3);text-decoration:line-through;margin-left:5px;}
.pc-stock{font-size:10px;padding:2px 7px;border-radius:8px;}
.pc-instock{background:var(--green-dim);color:var(--green);border:1px solid rgba(62,201,138,0.18);}
.pc-lowstock{background:rgba(232,169,74,0.08);color:var(--amber);border:1px solid rgba(232,169,74,0.18);}
.filter-toggle{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;font-size:12px;cursor:pointer;background:var(--glass);border:1px solid var(--border2);color:var(--text2);transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
.filter-toggle:hover{color:var(--text);}
.filter-toggle.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.ft-badge{background:var(--teal);color:#080808;width:16px;height:16px;border-radius:50%;font-size:9px;font-weight:700;display:none;align-items:center;justify-content:center;}
.ft-badge.show{display:flex;}

/* === WISHLIST TAB === */
.page-header{padding:28px 24px 0;}
.ph-top{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px;}
.ph-title{font-family:'Playfair Display',serif;font-size:28px;font-style:italic;color:var(--text);}
.ph-sub{font-size:12px;color:var(--text3);margin-top:4px;}
.ph-actions{display:flex;gap:8px;align-items:center;}
.ph-btn{padding:8px 18px;border-radius:20px;font-size:12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s;}
.ph-ghost{background:var(--glass);border:1px solid var(--border2);color:var(--text2);}
.ph-ghost:hover{color:var(--text);}
.ph-teal{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);}
.filter-row{display:flex;align-items:center;gap:7px;padding:0 24px 18px;flex-wrap:wrap;}
.fchip{padding:5px 14px;border-radius:20px;font-size:11.5px;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text2);transition:all 0.15s;}
.fchip.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.fchip:not(.active):hover{color:var(--text);}
.wish-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 24px 24px;}
.wcard{background:var(--glass);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:border-color 0.2s,transform 0.2s;position:relative;}
.wcard:hover{border-color:rgba(62,207,178,0.15);transform:translateY(-2px);}
.wc-img{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.wc-img::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:3;border-radius:inherit;background:radial-gradient(ellipse 85% 85% at 50% 48%,rgba(0,0,0,0) 32%,rgba(0,0,0,0.15) 62%,rgba(0,0,0,0.45) 100%);}
:host-context(html.light-mode) .wc-img::after{background:radial-gradient(ellipse 85% 85% at 50% 48%,rgba(0,0,0,0) 28%,rgba(0,0,0,0.12) 58%,rgba(0,0,0,0.35) 100%);}
.wc-glow{position:absolute;inset:0;opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:2;}
.wcard:hover .wc-glow{opacity:1;}
.wc-img-photo{position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);object-fit:cover;object-position:center;border-radius:14px;z-index:1;display:block;}
.wc-top-badges{position:absolute;top:8px;left:8px;right:8px;display:flex;align-items:flex-start;justify-content:space-between;z-index:6;}
.wc-badge{font-size:9px;padding:2px 8px;border-radius:8px;font-weight:600;}
.b-low{background:rgba(232,169,74,0.1);color:var(--amber);border:1px solid rgba(232,169,74,0.18);}
.wc-remove{width:26px;height:26px;border-radius:50%;background:rgba(8,8,8,0.75);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--text3);opacity:0;transition:all 0.2s;cursor:pointer;line-height:1;}
.wcard:hover .wc-remove{opacity:1;}
.wc-remove:hover{color:var(--red);border-color:rgba(224,112,112,0.3);}
.wc-body{padding:12px 14px;}
.wc-cat{font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:3px;}
.wc-name{font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px;line-height:1.3;}
.wc-price-row{display:flex;align-items:baseline;gap:7px;margin-bottom:8px;}
.wc-price{font-family:'Playfair Display',serif;font-size:17px;color:var(--text);}
.wc-price-old{font-size:12px;color:var(--text3);text-decoration:line-through;}
.wc-drop{font-size:10px;background:var(--green-dim);color:var(--green);padding:2px 7px;border-radius:8px;border:1px solid rgba(62,201,138,0.18);}
.wc-meta{display:flex;align-items:center;gap:6px;margin-bottom:10px;}
.wc-stars{font-size:10px;color:var(--amber);}
.wc-rating{font-size:10.5px;color:var(--text3);}
.wc-saved{font-size:10px;color:var(--text3);margin-left:auto;}
.wc-actions{display:flex;gap:6px;}
.wc-cart{flex:1;padding:8px 0;border-radius:20px;background:var(--teal);color:#080808;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;text-align:center;}
.wc-cart:hover{background:var(--teal2);}
.wc-more{width:34px;height:34px;border-radius:50%;background:var(--glass2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:13px;color:var(--text2);}
.wc-more:hover{color:var(--text);}
.alert-banner{display:flex;align-items:center;gap:12px;background:var(--green-dim);border:1px solid rgba(62,201,138,0.18);border-radius:10px;padding:12px 16px;margin:0 24px 16px;}
.ab-icon{width:32px;height:32px;border-radius:8px;background:rgba(62,201,138,0.1);border:1px solid rgba(62,201,138,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ab-text{flex:1;font-size:12.5px;color:var(--text2);line-height:1.5;}
.ab-text strong{color:var(--green);}
.ab-btn{padding:6px 14px;border-radius:20px;font-size:11.5px;background:rgba(62,201,138,0.12);border:1px solid rgba(62,201,138,0.2);color:var(--green);cursor:pointer;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;}

/* CURATED BADGES */
.pc-badge.tag-aesthetic { background:rgba(167,139,204,0.1); color:var(--purple); border:1px solid rgba(167,139,204,0.2); }
.pc-badge.tag-productivity { background:rgba(107,168,200,0.1); color:var(--blue); border:1px solid rgba(107,168,200,0.2); }
.pc-badge.tag-gaming { background:rgba(224,112,112,0.1); color:var(--red); border:1px solid rgba(224,112,112,0.18); }
.pc-badge.tag-minimal { background:rgba(62,207,178,0.1); color:var(--teal2); border:1px solid rgba(62,207,178,0.2); }
.pc-badge.tag-audio { background:rgba(232,169,74,0.1); color:var(--amber); border:1px solid rgba(232,169,74,0.18); }

/* SETUP GRID */
.setup-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:12px; padding:20px 24px; }
.setup-card { position:relative; height:180px; border-radius:16px; overflow:hidden; cursor:pointer; transition:transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); border:1px solid var(--border); }
.setup-card:hover { transform:translateY(-4px); }
.setup-img-overlay { position:absolute; inset:0; background:linear-gradient(0deg, rgba(8,8,8,0.9) 0%, transparent 65%); z-index:1; }
.setup-content { position:absolute; bottom:16px; left:16px; z-index:2; }
.setup-tag { font-size:9px; text-transform:uppercase; letter-spacing:0.1em; color:var(--teal); font-weight:700; margin-bottom:4px; }
.setup-name { font-family:'Playfair Display',serif; font-size:18px; color:var(--text); font-style:italic; }

/* === PRODUCT DETAIL === */
.product-section{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border);}
.img-col{padding:24px;border-right:1px solid var(--border);}
.main-img{width:100%;aspect-ratio:1;border-radius:12px;background:rgba(62,207,178,0.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:12px;position:relative;overflow:hidden;}
.main-img::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:3;border-radius:inherit;background:radial-gradient(ellipse 88% 88% at 50% 48%,rgba(0,0,0,0) 30%,rgba(0,0,0,0.15) 58%,rgba(0,0,0,0.4) 100%);}
:host-context(html.light-mode) .main-img::after{background:radial-gradient(ellipse 88% 88% at 50% 48%,rgba(0,0,0,0) 26%,rgba(0,0,0,0.12) 56%,rgba(0,0,0,0.35) 100%);}
.main-img-photo{position:absolute;inset:8px;width:calc(100% - 16px);height:calc(100% - 16px);object-fit:cover;object-position:center;border-radius:14px;z-index:1;display:block;}
.img-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(62,207,178,0.07),transparent 70%);pointer-events:none;z-index:2;}
.img-badge{position:absolute;top:12px;left:12px;font-size:9px;padding:3px 9px;border-radius:10px;font-weight:600;z-index:4;}
.thumb-row{display:flex;gap:8px;}
.thumb{width:52px;height:52px;border-radius:8px;background:var(--glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color 0.15s;}
.thumb.active{border-color:rgba(62,207,178,0.35);}
.thumb:hover{border-color:var(--border2);}
.info-col{padding:24px;}
.prod-brand{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--teal);margin-bottom:7px;}
.prod-name{font-family:'Playfair Display',serif;font-size:26px;font-weight:400;color:var(--text);line-height:1.15;margin-bottom:10px;letter-spacing:-0.01em;}
.rating-row{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.stars{display:flex;gap:2px;}
.star{width:13px;height:13px;}
.rating-val{font-size:13px;color:var(--text);font-weight:500;}
.rating-count{font-size:12px;color:var(--text3);}
.price-row{display:flex;align-items:baseline;gap:10px;margin-bottom:6px;}
.price{font-family:'Playfair Display',serif;font-size:30px;color:var(--text);line-height:1;}
.price-old{font-size:16px;color:var(--text3);text-decoration:line-through;}
.price-save{font-size:11px;background:var(--green-dim);color:var(--green);padding:3px 9px;border-radius:10px;border:1px solid var(--green-border);}
.stock-row-detail{display:flex;align-items:center;gap:6px;margin-bottom:18px;}
.stock-dot-detail{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 5px rgba(62,201,138,0.4);}
.stock-txt{font-size:12px;color:var(--green);}
.divider{height:1px;background:var(--border);margin:14px 0;}
.var-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:7px;}
.var-row{display:flex;gap:6px;margin-bottom:13px;}
.var{padding:6px 13px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid var(--border);color:var(--text2);transition:all 0.15s;}
.var.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.var:hover{border-color:var(--border2);color:var(--text);}
.action-row{display:flex;align-items:center;gap:8px;}
.qty-box{display:flex;align-items:center;background:var(--glass);border:1px solid var(--border2);border-radius:20px;overflow:hidden;}
.qty-btn{width:32px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:var(--text2);transition:all 0.15s;}
.qty-btn:hover{color:var(--text);background:var(--glass2);}
.qty-val{width:28px;text-align:center;font-size:13px;color:var(--text);}
.add-btn{flex:1;padding:10px 0;border-radius:20px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;border:none;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:7px;}
.add-btn:hover{background:var(--teal2);transform:translateY(-1px);box-shadow:0 6px 20px rgba(62,207,178,0.2);}
.wish-btn{width:38px;height:38px;border-radius:50%;background:var(--glass);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;}
.wish-btn:hover{border-color:rgba(224,112,112,0.3);color:var(--red);}
.specs-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px;}
.spec{background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:8px 11px;}
.spec-key{font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:2px;}
.spec-val{font-size:12px;color:var(--text);font-weight:500;}

/* SENTIMENT */
.sentiment-section{padding:24px;}
.ai-powered{display:inline-flex;align-items:center;gap:6px;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);border-radius:20px;padding:5px 13px;font-size:11px;color:var(--teal2);margin-bottom:20px;}
.ai-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite;}
.sentiment-overview{display:grid;grid-template-columns:200px 1fr;gap:16px;margin-bottom:20px;}
.gauge-wrap{background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:8px;}
.gauge-label{font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);}
.gauge-score{font-family:'Playfair Display',serif;font-size:36px;color:var(--green);line-height:1;}
.gauge-sub{font-size:11px;color:var(--green);font-weight:500;}
.gauge-bar{width:100%;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;}
.gauge-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--red),var(--amber),var(--green));}
.sentiment-bars{background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:12px;}
.sb-row{display:flex;align-items:center;gap:10px;}
.sb-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sb-label-s{font-size:12px;font-weight:500;min-width:80px;}
.sb-track{flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;}
.sb-fill{height:100%;border-radius:3px;}
.sb-pct{font-family:'JetBrains Mono',monospace;font-size:11px;min-width:32px;text-align:right;}
.sb-count{font-size:10px;color:var(--text3);}
.topics-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.topic-card{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:14px;}
.topic-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.topic-badge{font-size:9px;padding:2px 8px;border-radius:8px;font-weight:600;}
.topic-positive{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.topic-negative{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.topic-name{font-size:12.5px;font-weight:500;color:var(--text);}
.topic-score{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:12px;}
.topic-score.pos{color:var(--green);}
.topic-score.neg{color:var(--red);}
.topic-quotes{display:flex;flex-direction:column;gap:6px;}
.tq{font-size:11.5px;color:var(--text2);line-height:1.5;padding:7px 10px;background:rgba(255,255,255,0.02);border-radius:6px;border-left:2px solid transparent;}
.tq.pos{border-left-color:rgba(62,201,138,0.4);}
.tq.neg{border-left-color:rgba(224,112,112,0.4);}
.kw-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;}
.kw-chip{padding:5px 12px;border-radius:20px;font-size:11.5px;cursor:pointer;transition:all 0.15s;}
.kw-pos{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.kw-neg{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.kw-neutral{background:var(--glass2);color:var(--text2);border:1px solid var(--border);}
.review-card{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:8px;}
.rev-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;}
.rev-user{display:flex;align-items:center;gap:8px;}
.rev-av{width:28px;height:28px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--teal);flex-shrink:0;}
.rev-name{font-size:12.5px;font-weight:500;color:var(--text);}
.rev-date{font-size:10px;color:var(--text3);}
.rev-text{font-size:12.5px;color:var(--text2);line-height:1.65;margin-bottom:8px;}
.rev-sentiment{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.rev-sent-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:3px 9px;border-radius:10px;}
.rs-pos{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.rs-neg{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.rs-neutral{background:var(--glass2);color:var(--text2);border:1px solid var(--border);}
.rev-kw{font-size:10px;padding:2px 8px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border);color:var(--text3);}

/* AI ASSISTANT / CHATBOT */
.chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.01);flex-shrink:0;}
.ch-left{display:flex;align-items:center;gap:12px;}
.ai-avatar{width:38px;height:38px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;}
.ai-online{position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:var(--green);border:2px solid var(--bg);box-shadow:0 0 5px rgba(62,201,138,0.4);}
.ch-name{font-size:14px;font-weight:500;color:var(--text);}
.ch-status{font-size:11px;color:var(--green);display:flex;align-items:center;gap:5px;}
.ch-status-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:chatpulse 2s infinite;}
@keyframes chatpulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
.ch-right{display:flex;gap:7px;}
.ch-btn{padding:6px 14px;border-radius:20px;font-size:11.5px;cursor:pointer;background:var(--glass);border:1px solid var(--border);color:var(--text2);transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
.ch-btn:hover{color:var(--text);}
.ai-badge{display:flex;align-items:center;gap:5px;background:rgba(62,207,178,0.06);border:1px solid rgba(62,207,178,0.15);border-radius:20px;padding:4px 12px;font-size:11px;color:var(--teal2);}
.messages-area{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px;}
.messages-area::-webkit-scrollbar{width:2px;}
.messages-area::-webkit-scrollbar-thumb{background:var(--border2);}
.msg-user{display:flex;justify-content:flex-end;}
.msg-user-bubble{max-width:65%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);border-radius:16px 16px 4px 16px;padding:11px 15px;font-size:13.5px;color:var(--text);line-height:1.55;}
.msg-ai{display:flex;align-items:flex-start;gap:10px;}
.msg-ai-av{width:30px;height:30px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
.msg-ai-body{flex:1;max-width:85%;}
.msg-ai-name{font-size:10px;color:var(--text3);margin-bottom:5px;letter-spacing:0.04em;}
.msg-ai-bubble{background:var(--glass);border:1px solid var(--border2);border-radius:4px 16px 16px 16px;padding:13px 16px;font-size:13.5px;color:var(--text2);line-height:1.65;}
.msg-ai-bubble strong{color:var(--text);}
.msg-time{font-size:10px;color:var(--text3);margin-top:4px;text-align:right;}
.agent-steps{background:rgba(62,207,178,0.04);border:1px solid rgba(62,207,178,0.12);border-radius:10px;padding:12px 14px;margin-bottom:8px;}
.as-title{font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.as-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:chatpulse 1.5s infinite;}
.step-list{display:flex;flex-direction:column;gap:7px;}
.step-item{display:flex;align-items:center;gap:9px;font-size:11.5px;}
.step-icon{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;}
.si-done{background:var(--green-dim);border:1px solid rgba(62,201,138,0.2);color:var(--green);}
.si-active{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);}
.si-active-inner{width:8px;height:8px;border-radius:50%;background:var(--teal);animation:chatpulse 1s infinite;}
.step-label{color:var(--text2);}
.step-label.done{color:var(--text);}
.step-label.active{color:var(--teal2);}
.sql-block{background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin:10px 0;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--text3);line-height:1.7;overflow-x:auto;white-space:pre-wrap;}
.result-table-wrap{margin:10px 0;border-radius:8px;overflow:hidden;border:1px solid var(--border);}
.result-table{width:100%;border-collapse:collapse;font-size:12px;}
.result-table th{padding:8px 12px;font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);text-align:left;font-weight:400;background:rgba(255,255,255,0.02);border-bottom:1px solid var(--border);}
.result-table td{padding:8px 12px;color:var(--text2);border-bottom:1px solid rgba(255,255,255,0.03);}
.result-table tr:last-child td{border:none;}
.result-table tr:hover td{background:rgba(255,255,255,0.02);}
.td-name{color:var(--text);font-weight:500;}
.td-price-c{font-family:'Playfair Display',serif;font-size:13px;color:var(--text);}
.td-score{color:var(--green);font-family:'JetBrains Mono',monospace;}
.prod-chips{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0;}
.prod-chip{display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid var(--border2);cursor:pointer;transition:border-color 0.15s;}
.prod-chip:hover{border-color:rgba(62,207,178,0.2);}
.pc-chip-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.pc-chip-name{font-size:12px;font-weight:500;color:var(--text);}
.pc-chip-price{font-family:'Playfair Display',serif;font-size:12px;color:var(--teal2);}
.typing-ind{display:flex;align-items:center;gap:10px;}
.typing-av{width:30px;height:30px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.typing-dots{display:flex;gap:4px;background:var(--glass);border:1px solid var(--border2);border-radius:20px;padding:10px 14px;}
.td-dot{width:6px;height:6px;border-radius:50%;background:var(--text3);animation:tdot 1.2s infinite;}
.td-dot:nth-child(2){animation-delay:0.2s;}
.td-dot:nth-child(3){animation-delay:0.4s;}
@keyframes tdot{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-5px);opacity:1;}}
.suggestions{display:flex;gap:7px;padding:12px 24px;border-top:1px solid var(--border);overflow-x:auto;flex-shrink:0;}
.suggestions::-webkit-scrollbar{display:none;}
.sug{padding:6px 14px;border-radius:20px;font-size:12px;color:var(--text2);background:var(--glass);border:1px solid var(--border);cursor:pointer;white-space:nowrap;transition:all 0.15s;flex-shrink:0;}
.sug:hover{background:var(--glass2);color:var(--text);border-color:var(--border2);}
.chat-input-wrap{padding:14px 24px;border-top:1px solid var(--border);background:rgba(8,8,8,0.6);flex-shrink:0;}
.chat-input-box{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border2);border-radius:14px;padding:10px 14px;transition:border-color 0.2s,box-shadow 0.2s;}
.chat-input-box:focus-within{border-color:rgba(62,207,178,0.3);box-shadow:0 0 0 3px rgba(62,207,178,0.05);}
.chat-input-box input{flex:1;background:transparent;border:none;outline:none;font-size:13.5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;caret-color:var(--teal);}
.chat-input-box input::placeholder{color:var(--text3);}
.send-btn{width:34px;height:34px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;flex-shrink:0;transition:all 0.15s;}
.send-btn:hover{background:var(--teal2);transform:scale(1.05);}
.input-meta{display:flex;align-items:center;justify-content:space-between;padding:6px 2px 0;}
.im-hint{font-size:10.5px;color:var(--text3);}
.im-counter{font-size:10.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.success-banner{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--green-dim);border:1px solid rgba(62,201,138,0.18);border-radius:8px;margin-bottom:10px;}
.success-banner span{font-size:13px;color:var(--green);font-weight:500;}
@keyframes msg-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.msg-user,.msg-ai,.typing-ind{animation:msg-in 0.3s ease forwards;}

/* SETTINGS */
.settings-frame{display:flex;gap:0;background:var(--glass);border:1px solid var(--border);border-radius:16px;overflow:hidden;min-height:400px;}
.settings-nav{width:200px;border-right:1px solid var(--border);padding:16px 0;}
.settings-main{flex:1;padding:24px;}
.s-group-title{font-size:9px;letter-spacing:0.13em;text-transform:uppercase;color:var(--text3);padding:12px 16px 6px;font-weight:500;}
.s-item{display:flex;align-items:center;gap:8px;padding:8px 16px;font-size:12.5px;color:var(--text2);cursor:pointer;transition:all 0.15s;}
.s-item:hover{background:var(--glass);color:var(--text);}
.s-item.active{background:var(--teal-dim);color:var(--teal2);border-right:2px solid var(--teal);}
.s-item-icon{width:15px;height:15px;opacity:0.6;}
.active .s-item-icon{opacity:1;}
.f-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;}
.fi{width:100%;padding:10px 14px;background:var(--glass);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;outline:none;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color 0.2s;}
.fi:focus{border-color:rgba(62,207,178,0.3);}
.save-btn{padding:10px 24px;border-radius:20px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;}
.save-btn:hover{background:var(--teal2);}
.av-section{display:flex;align-items:center;gap:16px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:16px;margin-bottom:24px;}
.av-circle{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--teal-dim),transparent);border:2px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:24px;color:var(--teal);}
.addr-card,.card-saved{display:flex;align-items:flex-start;gap:12px;padding:16px;border-radius:12px;border:1px solid var(--border);background:var(--glass);transition:0.2s;margin-bottom:12px;}
.addr-card:hover,.card-saved:hover{border-color:var(--border2);}
.addr-card.default{border-color:rgba(62,207,178,0.2);background:var(--teal-dim);}
.notif-row{display:flex;align-items:center;gap:15px;padding:14px 16px;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.02);}
.notif-row:last-child{border-bottom:none;}
.tog{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:0.3s;background:var(--glass2);border:1px solid var(--border);}
.tog.on{background:var(--teal-dim);border-color:rgba(62,207,178,0.3);}
.tog-thumb{position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:50%;background:var(--text3);transition:0.3s cubic-bezier(0.18,0.89,0.32,1.28);}
.tog.on .tog-thumb{left:19px;background:var(--teal);}
.danger-box{background:var(--glass);border:1px solid rgba(224,112,112,0.15);border-radius:16px;padding:24px;margin-top:16px;}
.dz-title{font-size:16px;font-weight:500;color:var(--red);margin-bottom:8px;}
.dz-desc{font-size:12.5px;color:var(--text3);line-height:1.6;margin-bottom:16px;}

.breadcrumb{display:flex;align-items:center;gap:6px;padding:12px 24px;border-bottom:1px solid var(--border);}
.bc{font-size:11px;color:var(--text3);cursor:pointer;}
.bc:hover{color:var(--text2);}
.bc-sep{font-size:11px;color:var(--text3);}
.bc-cur{font-size:11px;color:var(--text2);}

@keyframes fadein{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.pcard:nth-child(1){animation:fadein 0.3s ease 0.04s both;}
.pcard:nth-child(2){animation:fadein 0.3s ease 0.08s both;}
.pcard:nth-child(3){animation:fadein 0.3s ease 0.12s both;}
.pcard:nth-child(4){animation:fadein 0.3s ease 0.16s both;}
.pcard:nth-child(5){animation:fadein 0.3s ease 0.20s both;}
.pcard:nth-child(6){animation:fadein 0.3s ease 0.24s both;}
.wcard:nth-child(1){animation:fadein 0.35s ease 0.04s both;}
.wcard:nth-child(2){animation:fadein 0.35s ease 0.08s both;}
.wcard:nth-child(3){animation:fadein 0.35s ease 0.12s both;}
.wcard:nth-child(4){animation:fadein 0.35s ease 0.16s both;}
.wcard:nth-child(5){animation:fadein 0.35s ease 0.20s both;}
.wcard:nth-child(6){animation:fadein 0.35s ease 0.24s both;}
.hero-left{animation:fadein 0.5s ease 0.05s both;}
.hero-right{animation:fadein 0.5s ease 0.15s both;}
</style>

<div class="page">
  <!-- NAVBAR -->
  <div class="navbar">
    <div class="logo" (click)="activeTab='home'; selectedProduct=null;"><app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo></div>
    <div class="nav-pills">
      <div class="npill" [class.active]="activeTab === 'home'" (click)="activeTab='home'; selectedProduct=null;">Home</div>
      <div class="npill" [class.active]="activeTab === 'shop' && !selectedProduct" (click)="activeTab='shop'; selectedProduct=null;">Shop</div>
      <div class="npill" [class.active]="activeTab === 'assistant'" (click)="activeTab='assistant'">AI Assistant</div>
      <div class="npill" [routerLink]="consumerNav.orders" routerLinkActive="active">Orders</div>
      <div class="npill" [class.active]="activeTab === 'wishlist'" (click)="activeTab='wishlist'">Wishlist</div>
    </div>
    <div class="nav-r">
      <div class="nav-icon" (click)="activeTab='wishlist'">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12S1.5 8 1.5 4.5a3 3 0 0 1 5.5-1.6A3 3 0 0 1 12.5 4.5C12.5 8 7 12 7 12Z" stroke="#6A8A84" stroke-width="1.2"/></svg>
        <div class="nb">{{wishlist.length}}</div>
      </div>
      <a class="nav-icon" [routerLink]="consumerNav.cart" aria-label="Cart">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h1.5l1.8 6.5h5.4l1.3-4H4.8" stroke="#6A8A84" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="11" r="1.2" fill="#6A8A84"/><circle cx="10" cy="11" r="1.2" fill="#6A8A84"/></svg>
        <div class="nb" *ngIf="cartCount > 0">{{cartCount}}</div>
      </a>
      <app-nexus-theme-toggle></app-nexus-theme-toggle>
      <div class="user-pill" (click)="activeTab='settings'">
        <div class="uav">{{auth.currentUserValue?.fullName?.substring(0,2)?.toUpperCase()}}</div>
        <span style="font-size:12px;color:var(--text);font-weight:500;">{{auth.currentUserValue?.fullName}}</span>
        <span style="font-size:9px;color:var(--text3);">▾</span>
      </div>
    </div>
  </div>

  <div class="main-scroll">

    <!-- ==================== HOME TAB ==================== -->
    <ng-container *ngIf="activeTab === 'home'">
      <div class="hero">
        <div class="hero-bg1"></div><div class="hero-bg2"></div><div class="bg-grid"></div>
        <div class="hero-left">
          <div class="hero-greeting"><div class="greet-dot"></div>Welcome back, {{auth.currentUserValue?.fullName?.split(' ')[0]}} 👋</div>
          <div class="hero-title">What will you<br><em>discover</em> today?</div>
          <div class="hero-sub">Browse our curated collection of premium tech. New arrivals are waiting for you.</div>
          <div class="hero-cta">
            <button class="btn-primary" (click)="activeTab='shop'">Continue Shopping →</button>
            <button class="btn-ghost" (click)="activeTab='assistant'">Ask AI Assistant</button>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-stat">
            <div class="hs-icon" style="background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h10l-1.2 8H4.2L3 3Z" stroke="#3ECFB2" stroke-width="1.1" stroke-linejoin="round"/><circle cx="6" cy="13" r="1.2" fill="#3ECFB2"/><circle cx="10" cy="13" r="1.2" fill="#3ECFB2"/></svg></div>
            <div><div class="hs-val">3</div><div class="hs-label">Items in cart</div></div>
          </div>
          <div class="hero-stat">
            <div class="hs-icon" style="background:rgba(232,169,74,0.08);border:1px solid rgba(232,169,74,0.18);"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L10 6H15L11 9l1.5 4.5L8 10.5 4.5 13 6 8.5 2 6H7L8 1.5Z" fill="#E8A94A" opacity="0.7"/></svg></div>
            <div><div class="hs-val">2 <em>↓</em></div><div class="hs-label">Price drops</div></div>
          </div>
          <div class="hero-stat">
            <div class="hs-icon" style="background:var(--green-dim);border:1px solid var(--green-border);"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l3.5 3.5L14 4" stroke="#3EC98A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div><div class="hs-val">{{products.length}}</div><div class="hs-label">Products available</div></div>
          </div>
        </div>
      </div>

      <!-- QUICK LINKS -->
      <div class="quick-section">
        <a class="qlink" [routerLink]="consumerNav.cart" style="text-decoration:none;color:inherit;"><div class="ql-icon" style="background:var(--teal-dim);border:1px solid rgba(62,207,178,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3h12l-1.5 9H4.5L3 3Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/><circle cx="7" cy="15" r="1.3" fill="#3ECFB2"/><circle cx="11" cy="15" r="1.3" fill="#3ECFB2"/></svg></div><div class="ql-label">Cart</div></a>
        <div class="qlink" (click)="activeTab='wishlist'"><div class="ql-icon" style="background:rgba(224,112,112,0.08);border:1px solid rgba(224,112,112,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15S2 10.5 2 6a4 4 0 0 1 7-2.6A4 4 0 0 1 16 6c0 4.5-7 9-7 9Z" stroke="#E07070" stroke-width="1.2"/></svg></div><div class="ql-label">Wishlist</div></div>
        <div class="qlink" [routerLink]="consumerNav.orders"><div class="ql-icon" style="background:rgba(107,168,200,0.08);border:1px solid rgba(107,168,200,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5.5h14M5 9h8M7.5 12.5h3" stroke="#6BA8C8" stroke-width="1.2" stroke-linecap="round"/></svg></div><div class="ql-label">Orders</div></div>
        <div class="qlink" (click)="activeTab='assistant'"><div class="ql-icon" style="background:rgba(62,201,138,0.08);border:1px solid rgba(62,201,138,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 6v6l7 4 7-4V6L9 2Z" stroke="#3EC98A" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 2v7M2 6l7 3.5 7-3.5" stroke="#3EC98A" stroke-width="1.2"/></svg></div><div class="ql-label">AI Assistant</div></div>
        <div class="qlink"><div class="ql-icon" style="background:rgba(232,169,74,0.08);border:1px solid rgba(232,169,74,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L11 7H17L12.5 10.5l1.8 5.5L9 13.5l-5.3 2.5 1.8-5.5L1 7H7L9 1.5Z" stroke="#E8A94A" stroke-width="1.1" stroke-linejoin="round"/></svg></div><div class="ql-label">Deals</div></div>
        <div class="qlink" (click)="activeTab='settings'"><div class="ql-icon" style="background:rgba(167,139,204,0.08);border:1px solid rgba(167,139,204,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="4" stroke="#A78BCC" stroke-width="1.2"/><path d="M2 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#A78BCC" stroke-width="1.2" stroke-linecap="round"/></svg></div><div class="ql-label">Profile</div></div>
      </div>

      <!-- FLASH SALE -->
      <div class="flash-section">
        <div class="flash-banner">
          <div class="fb-left">
            <div class="fb-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.5L13 8H20L14.5 12l2 6.5L10 15l-6.5 3.5 2-6.5L0 8H7L10 1.5Z" fill="#3ECFB2" opacity="0.7"/></svg></div>
            <div>
              <div class="fb-title">Flash Sale — Today Only!</div>
              <div class="fb-sub">20–30% off on selected products · Limited stock</div>
            </div>
          </div>
          <div class="fb-timer">
            <div class="fb-unit">04</div><div class="fb-sep">:</div>
            <div class="fb-unit">23</div><div class="fb-sep">:</div>
            <div class="fb-unit">17</div>
          </div>
          <button class="fb-btn" (click)="activeTab='shop'">View Deals →</button>
        </div>
      </div>

      <!-- CONTINUE SHOPPING -->
      <div class="continue-section" *ngIf="products.length > 0">
        <div class="sec-header">
          <div><div class="sec-title">Continue Where You Left Off</div><div class="sec-sub">Recently viewed products</div></div>
          <div class="sec-link" (click)="activeTab='shop'">See all →</div>
        </div>
        <div class="continue-grid">
          <div class="cs-card" *ngFor="let p of products.slice(0,4)" (click)="selectProduct(p)">
            <div class="cs-img" style="background:rgba(62,207,178,0.04);">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="12" rx="2.5" stroke="#3ECFB2" stroke-width="1.1" opacity="0.5"/></svg>
            </div>
            <div style="flex:1;min-width:0;">
              <div class="cs-name">{{p.name}}</div>
              <div style="font-size:9.5px;color:var(--text3);margin-top:2px;">{{p.basePrice | currency}} · {{p.category}}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TRENDING -->
      <div class="trending-section" *ngIf="products.length > 0">
        <div class="sec-header">
          <div><div class="sec-title">Trending This Week</div><div class="sec-sub">Best-selling products right now</div></div>
          <div class="sec-link" (click)="activeTab='shop'">See all →</div>
        </div>
        <div class="prod-grid" style="grid-template-columns:repeat(4,1fr);">
          <div class="pcard" *ngFor="let p of products.slice(0,4)" (click)="selectProduct(p)">
            <div class="pc-img" style="background:rgba(62,207,178,0.04);">
              <div class="pc-img-glow" style="background:radial-gradient(circle,rgba(62,207,178,0.09),transparent 70%)"></div>
              <img *ngIf="p.imageUrl" [src]="p.imageUrl" class="pc-img-photo" [alt]="p.name"/>
              <svg *ngIf="!p.imageUrl" width="70" height="70" viewBox="0 0 70 70" fill="none"><rect x="7" y="16" width="56" height="36" rx="5" stroke="#3ECFB2" stroke-width="1.2" opacity="0.42"/><rect x="28" y="52" width="14" height="3.5" rx="1.75" fill="rgba(62,207,178,0.2)"/></svg>
              <div class="pc-wish" (click)="$event.stopPropagation(); toggleWishlist(p)">♡</div>
              <div class="pc-quick"><button class="pc-quick-btn" (click)="$event.stopPropagation(); addToCart(p)">Add to Cart</button></div>
            </div>
            <div class="pc-body">
              <div class="pc-brand">{{p.brand}}</div>
              <div class="pc-name" style="margin-bottom:4px;">{{p.name}}</div>
              <div class="pc-badges" (click)="$event.stopPropagation()">
                <div *ngIf="p.tags?.includes('Performance')" class="pc-badge b-new" style="background:var(--red-dim);color:var(--red);">Performance</div>
                <div *ngIf="p.tags?.includes('Aesthetic')" class="pc-badge b-new" style="background:var(--purple-dim);color:var(--purple-lit);">Aesthetic</div>
                <div *ngIf="p.tags?.includes('Stealth')" class="pc-badge b-new" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.1);">Stealth</div>
                <div *ngIf="p.tags?.includes('Shadow Coder')" class="pc-badge b-new" style="background:rgba(62,207,178,0.1);color:var(--teal);">Shadow Coder</div>
                <div *ngIf="p.tags?.includes('Organic Creator')" class="pc-badge b-new" style="background:rgba(232,169,74,0.1);color:var(--amber);">Organic Creator</div>
              </div>
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;"><span class="pc-star">★★★★★</span><span class="pc-rcount">4.9</span></div>
              <div class="pc-bottom"><div><span class="pc-price">{{p.basePrice | currency}}</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- CURATED SETUPS -->
      <div class="categories-section">
        <div class="sec-header">
          <div><div class="sec-title">Shop by Personality</div><div class="sec-sub">Curated tech setups for your lifestyle</div></div>
        </div>
        <div class="setup-grid">
          <div class="setup-card" (click)="activeTab='shop'; searchQuery='Shadow Coder';">
            <div class="setup-img-overlay"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(62,207,178,0.1), transparent);z-index:0;"></div>
            <div class="setup-content">
              <div class="setup-tag">Performance</div>
              <div class="setup-name">Shadow Coder</div>
            </div>
          </div>
          <div class="setup-card" (click)="activeTab='shop'; searchQuery='Organic Creator';">
            <div class="setup-img-overlay"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(167,139,204,0.1), transparent);z-index:0;"></div>
            <div class="setup-content">
              <div class="setup-tag">Aesthetic</div>
              <div class="setup-name">Organic Creator</div>
            </div>
          </div>
          <div class="setup-card" (click)="activeTab='shop'; searchQuery='Discovery';">
            <div class="setup-img-overlay"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(224,112,112,0.1), transparent);z-index:0;"></div>
            <div class="setup-content">
              <div class="setup-tag">Exclusive</div>
              <div class="setup-name">The Discovery</div>
            </div>
          </div>
          <div class="setup-card" (click)="activeTab='shop'; searchQuery='Global Nomad';">
            <div class="setup-img-overlay"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(62,201,207,0.1), transparent);z-index:0;"></div>
            <div class="setup-content">
              <div class="setup-tag">Mobility</div>
              <div class="setup-name">Global Nomad</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CATEGORIES -->
      <div class="categories-section">
        <div class="sec-header">
          <div><div class="sec-title">Shop by Category</div></div>
          <div class="sec-link" (click)="activeTab='shop'">See all →</div>
        </div>
        <div class="cat-grid">
          <div class="cat-card" *ngFor="let c of categories" (click)="activeTab='shop'; selectedCat=c.name;">
            <div class="cat-icon" style="background:var(--teal-dim);border:1px solid rgba(62,207,178,0.18);"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="10" rx="2.5" stroke="#3ECFB2" stroke-width="1.1" opacity="0.7"/></svg></div>
            <div class="cat-name">{{c.name}}</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== SHOP TAB ==================== -->
    <ng-container *ngIf="activeTab === 'shop' && !selectedProduct">
      <div class="search-hero">
        <div class="sh-glow"></div>
        <div class="sh-top">
          <div><div class="sh-title">Browse Products</div><div class="sh-sub">{{products.length}} curated tech items</div></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <div class="filter-toggle" [class.active]="filtersOpen" (click)="filtersOpen = !filtersOpen">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3.5h10M3.5 6.5h6M5.5 9.5h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              Filters
              <div class="ft-badge" [class.show]="activeFilters.length > 0">{{activeFilters.length}}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2);background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:6px 14px;cursor:pointer;">
              Sort: Featured <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#6A8A84" stroke-width="1.1" stroke-linecap="round"/></svg>
            </div>
          </div>
        </div>
        <div class="search-bar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#3ECFB2" stroke-width="1.2"/><path d="M10 10l2.5 2.5" stroke="#3ECFB2" stroke-width="1.2" stroke-linecap="round"/></svg>
          <input [(ngModel)]="searchQuery" placeholder="Search products, brands, categories…"/>
          <div class="search-count">{{filteredProducts.length}} results</div>
        </div>
        <div class="cat-row">
          <div class="cat-pill" [class.active]="selectedCat==='All'" (click)="selectedCat='All'">All</div>
          <div class="cat-pill" *ngFor="let c of categories" [class.active]="selectedCat===c.name" (click)="selectedCat=c.name">{{c.name}}</div>
        </div>
      </div>

      <div class="shop-body">
        <div class="filter-sidebar" [class.collapsed]="!filtersOpen">
          <div class="fs-head">
            <div class="fs-title">Filters</div>
            <div class="fs-clear" (click)="resetFilters()">Clear all</div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Brand <span>▾</span></div>
            <div class="fsec-body">
              <div class="fcheck" *ngFor="let b of brands" [class.on]="b.checked" (click)="toggleBrand(b.name)">
                <div class="fbox"><svg *ngIf="b.checked" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <span class="flabel">{{b.name}}</span>
              </div>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Price Range <span>▾</span></div>
            <div class="fsec-body">
              <div class="fcheck" [class.on]="maxPrice <= 500" (click)="maxPrice = 500"><div class="fbox"><svg *ngIf="maxPrice <= 500" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flabel">Under $500</span></div>
              <div class="fcheck" [class.on]="maxPrice > 500 && maxPrice <= 1000" (click)="maxPrice = 1000"><div class="fbox"></div><span class="flabel">$500 – $1,000</span></div>
              <div class="fcheck" (click)="maxPrice = 3000"><div class="fbox"></div><span class="flabel">$1,000+</span></div>
              <div class="price-inputs"><input class="pinput" [(ngModel)]="minPrice" placeholder="Min"/><div class="psep">—</div><input class="pinput" [(ngModel)]="maxPrice" placeholder="Max"/></div>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Rating <span>▾</span></div>
            <div class="rating-opts">
              <div class="ropt" (click)="selectedRating = 5" [class.sel]="selectedRating === 5"><span class="rstar">★★★★★</span><span class="rlabel">5 stars</span></div>
              <div class="ropt" (click)="selectedRating = 4" [class.sel]="selectedRating === 4"><span class="rstar">★★★★</span><span class="rstare">★</span><span class="rlabel">4+ stars</span></div>
              <div class="ropt" (click)="selectedRating = 3" [class.sel]="selectedRating === 3"><span class="rstar">★★★</span><span class="rstare">★★</span><span class="rlabel">3+ stars</span></div>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Availability <span>▾</span></div>
            <div class="fsec-body">
              <div class="fcheck" [class.on]="availability.inStock" (click)="availability.inStock = !availability.inStock">
                <div class="fbox"><svg *ngIf="availability.inStock" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <span class="flabel">In Stock</span>
              </div>
              <div class="fcheck" [class.on]="availability.onSale" (click)="availability.onSale = !availability.onSale">
                <div class="fbox"><svg *ngIf="availability.onSale" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <span class="flabel">On Sale</span>
              </div>
              <div class="fcheck" [class.on]="availability.newArrivals" (click)="availability.newArrivals = !availability.newArrivals">
                <div class="fbox"><svg *ngIf="availability.newArrivals" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <span class="flabel">New Arrivals</span>
              </div>
            </div>
          </div>
        </div>

        <div class="products-area">
          <div class="active-chips" *ngIf="activeFilters.length > 0">
            <div class="achip" *ngFor="let f of activeFilters">{{f}} <span class="achip-x" (click)="removeChip(f)">×</span></div>
          </div>
          <div class="results-bar">
            <div class="rb-count"><span>{{filteredProducts.length}}</span> products found</div>
            <div class="rb-sort">Relevance <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#6A8A84" stroke-width="1.1" stroke-linecap="round"/></svg></div>
          </div>
          <div class="prod-grid">
            <div class="pcard" *ngFor="let p of filteredProducts" (click)="selectProduct(p)">
              <div class="pc-img" style="background:rgba(62,207,178,0.04);">
                <div class="pc-img-glow" style="background:radial-gradient(circle,rgba(62,207,178,0.09),transparent 70%)"></div>
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" class="pc-img-photo" [alt]="p.name"/>
                <svg *ngIf="!p.imageUrl" width="80" height="80" viewBox="0 0 80 80" fill="none"><rect x="8" y="18" width="64" height="40" rx="5" stroke="#3ECFB2" stroke-width="1.3" opacity="0.4"/><rect x="32" y="58" width="16" height="4" rx="2" fill="rgba(62,207,178,0.2)"/></svg>
                <div class="pc-wish" (click)="$event.stopPropagation(); toggleWishlist(p)">♡</div>
                <div class="pc-quick"><button class="pc-quick-btn" (click)="$event.stopPropagation(); addToCart(p)">Add to Cart</button></div>
              </div>
              <div class="pc-body">
                <div class="pc-brand">{{p.brand}}</div>
                <div class="pc-name">{{p.name}}</div>
                <div class="pc-badges" (click)="$event.stopPropagation()">
                  <div *ngFor="let tag of getTags(p.tags)" class="pc-badge" [ngClass]="getTagClass(tag)">{{tag}}</div>
                  <div *ngIf="p.stockQuantity > 50" class="pc-badge b-new">New</div>
                </div>
                <div class="pc-stars"><span class="pc-star">★★★★★</span><span class="pc-rcount">4.8</span></div>
                <div class="pc-bottom">
                  <div><span class="pc-price">{{p.basePrice | currency}}</span></div>
                  <div class="pc-stock" [class.pc-instock]="p.stockQuantity > 5" [class.pc-lowstock]="p.stockQuantity <= 5 && p.stockQuantity > 0">{{p.stockQuantity > 5 ? 'In Stock' : p.stockQuantity + ' left'}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== PRODUCT DETAIL ==================== -->
    <ng-container *ngIf="selectedProduct">
      <div class="breadcrumb">
        <span class="bc" (click)="activeTab='home'; selectedProduct=null;">Home</span><span class="bc-sep">/</span>
        <span class="bc" (click)="activeTab='shop'; selectedProduct=null;">{{selectedProduct.category}}</span><span class="bc-sep">/</span>
        <span class="bc-cur">{{selectedProduct.name}}</span>
      </div>
      <div class="product-section">
        <div class="img-col">
          <div class="main-img">
            <div class="img-glow"></div>
            <div *ngIf="selectedProduct.stockQuantity > 50" class="img-badge b-new">New</div>
            <img *ngIf="selectedProduct.imageUrl" [src]="selectedProduct.imageUrl" class="main-img-photo" [alt]="selectedProduct.name"/>
            <svg *ngIf="!selectedProduct.imageUrl" width="160" height="160" viewBox="0 0 160 160" fill="none"><rect x="16" y="38" width="128" height="80" rx="8" stroke="#3ECFB2" stroke-width="1.5" opacity="0.45"/><rect x="60" y="118" width="40" height="8" rx="4" fill="rgba(62,207,178,0.15)"/></svg>
          </div>
          <div class="thumb-row">
            <div class="thumb active"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2.5" stroke="#3ECFB2" stroke-width="1" opacity="0.5"/></svg></div>
            <div class="thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#6A8A84" stroke-width="1" opacity="0.4"/></svg></div>
            <div class="thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="#6A8A84" stroke-width="1" opacity="0.4"/></svg></div>
          </div>
        </div>
        <div class="info-col">
          <div class="prod-brand">{{selectedProduct.brand}}</div>
          <div class="prod-name">{{selectedProduct.name}}</div>
          <div class="rating-row">
            <div class="stars"><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg></div>
            <span class="rating-val">4.9</span>
            <span class="rating-count">(284 reviews)</span>
          </div>
          <div class="price-row">
            <div class="price">{{selectedProduct.basePrice | currency}}</div>
          </div>
          <div class="stock-row-detail">
            <div class="stock-dot-detail"></div>
            <div class="stock-txt">In stock · Ships in 24h</div>
          </div>
          <div class="divider"></div>
          <div class="action-row">
            <div class="qty-box">
              <div class="qty-btn" (click)="qty > 1 ? qty = qty - 1 : null">−</div>
              <div class="qty-val">{{qty}}</div>
              <div class="qty-btn" (click)="qty = qty + 1">+</div>
            </div>
            <button class="add-btn" (click)="addToCart(selectedProduct)">Add to Cart →</button>
            <div class="wish-btn" (click)="toggleWishlist(selectedProduct)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12S1.5 8 1.5 4.5a3 3 0 0 1 5.5-1.6A3 3 0 0 1 12.5 4.5C12.5 8 7 12 7 12Z" stroke="#6A8A84" stroke-width="1.2"/></svg></div>
          </div>
          <div class="specs-grid">
            <div class="spec"><div class="spec-key">Category</div><div class="spec-val">{{selectedProduct.category}}</div></div>
            <div class="spec"><div class="spec-key">Brand</div><div class="spec-val">{{selectedProduct.brand}}</div></div>
            <div class="spec"><div class="spec-key">Stock</div><div class="spec-val">{{selectedProduct.stockQuantity}} units</div></div>
            <div class="spec"><div class="spec-key">Rating</div><div class="spec-val">4.9 / 5.0</div></div>
          </div>
        </div>
      </div>

      <!-- SENTIMENT ANALYSIS -->
      <div class="sentiment-section" *ngIf="sentiments[selectedProduct.productId]">
        <div class="sec-title" style="font-size:20px;margin-bottom:4px;">AI Sentiment Analysis</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:20px;">Based on verified reviews · Powered by Nexus AI</div>
        <div class="ai-powered"><div class="ai-dot"></div>Analyzed by Nexus AI</div>
        <div class="sentiment-overview">
          <div class="gauge-wrap">
            <div class="gauge-label">Overall Sentiment</div>
            <div class="gauge-score">{{sentiments[selectedProduct.productId].averageScore * 100 | number:'1.0-0'}}%</div>
            <div class="gauge-sub">{{sentiments[selectedProduct.productId].averageScore > 0.7 ? 'Very Positive' : 'Mixed'}}</div>
            <div class="gauge-bar"><div class="gauge-fill" [style.width.%]="sentiments[selectedProduct.productId].averageScore * 100"></div></div>
            <div style="font-size:10px;color:var(--text3);margin-top:4px;">{{sentiments[selectedProduct.productId].totalReviews || 0}} reviews analyzed</div>
          </div>
          <div class="sentiment-bars">
            <div class="sb-row">
              <div class="sb-icon" style="background:var(--green-dim);border:1px solid var(--green-border);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#3EC98A" stroke-width="1.1"/></svg></div>
              <div class="sb-label-s" style="color:var(--green);">Positive</div>
              <div class="sb-track"><div class="sb-fill" [style.width.%]="(sentiments[selectedProduct.productId].positivePercent || 78)" style="background:var(--green);"></div></div>
              <div class="sb-pct" style="color:var(--green);">{{sentiments[selectedProduct.productId].positivePercent || 78}}%</div>
            </div>
            <div class="sb-row">
              <div class="sb-icon" style="background:var(--glass2);border:1px solid var(--border2);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#6A8A84" stroke-width="1.1"/></svg></div>
              <div class="sb-label-s" style="color:var(--text2);">Neutral</div>
              <div class="sb-track"><div class="sb-fill" [style.width.%]="(sentiments[selectedProduct.productId].neutralPercent || 14)" style="background:var(--text2);"></div></div>
              <div class="sb-pct" style="color:var(--text2);">{{sentiments[selectedProduct.productId].neutralPercent || 14}}%</div>
            </div>
            <div class="sb-row">
              <div class="sb-icon" style="background:var(--red-dim);border:1px solid var(--red-border);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#E07070" stroke-width="1.1"/></svg></div>
              <div class="sb-label-s" style="color:var(--red);">Negative</div>
              <div class="sb-track"><div class="sb-fill" [style.width.%]="(sentiments[selectedProduct.productId].negativePercent || 8)" style="background:var(--red);"></div></div>
              <div class="sb-pct" style="color:var(--red);">{{sentiments[selectedProduct.productId].negativePercent || 8}}%</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);margin-bottom:12px;">Most Mentioned Keywords</div>
          <div class="kw-row">
            <div class="kw-chip kw-pos" *ngFor="let kw of sentiments[selectedProduct.productId].topKeywords?.slice(0,6) || ['great quality','fast shipping','premium build','worth it']">{{kw}}</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== WISHLIST TAB ==================== -->
    <ng-container *ngIf="activeTab === 'wishlist'">
      <div style="height:12px;"></div>
      <div class="alert-banner" *ngIf="wishlist.length > 0">
        <div class="ab-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L10 6H15L11 9l1.5 5L8 11.5 4.5 14 6 9 2 6H7L8 1.5Z" fill="#3EC98A" opacity="0.8"/></svg></div>
        <div class="ab-text"><strong>Price drop!</strong> {{wishlist.length}} items on your wishlist. Check for deals today.</div>
        <div class="ab-btn" (click)="activeTab='shop'">View deals →</div>
      </div>
      <div class="page-header">
        <div class="ph-top">
          <div>
            <div class="ph-title">My Wishlist</div>
            <div class="ph-sub">{{wishlist.length}} saved items</div>
          </div>
          <div class="ph-actions">
            <div class="ph-btn ph-ghost">Share list</div>
            <div class="ph-btn ph-teal">Add all to cart</div>
          </div>
        </div>
      </div>
      <div class="filter-row">
        <div class="fchip active">All ({{wishlist.length}})</div>
        <div class="fchip">In Stock</div>
      </div>
      <div class="wish-grid">
        <div class="wcard" *ngFor="let p of wishlist">
          <div class="wc-img" style="background:rgba(62,207,178,0.04);">
            <div class="wc-glow" style="background:radial-gradient(circle,rgba(62,207,178,0.08),transparent 70%)"></div>
            <img *ngIf="p.imageUrl" [src]="p.imageUrl" class="wc-img-photo" [alt]="p.name"/>
            <svg *ngIf="!p.imageUrl" width="72" height="72" viewBox="0 0 72 72" fill="none"><rect x="8" y="18" width="56" height="36" rx="5" stroke="#3ECFB2" stroke-width="1.3" opacity="0.45"/></svg>
            <div class="wc-top-badges">
              <div *ngIf="p.stockQuantity > 50" class="wc-badge b-new">New</div>
              <div *ngIf="p.stockQuantity <= 50 && p.stockQuantity > 0"></div>
              <div class="wc-remove" (click)="toggleWishlist(p)">×</div>
            </div>
          </div>
          <div class="wc-body">
            <div class="wc-cat">{{p.category}} · {{p.brand}}</div>
            <div class="wc-name">{{p.name}}</div>
            <div class="wc-price-row"><div class="wc-price">{{p.basePrice | currency}}</div></div>
            <div class="wc-meta"><div class="wc-stars">★★★★★</div><div class="wc-rating">4.8</div><div class="wc-saved">Saved recently</div></div>
            <div class="wc-actions"><button class="wc-cart" (click)="addToCart(p)">Add to Cart</button><div class="wc-more" (click)="selectProduct(p)">⋯</div></div>
          </div>
        </div>
      </div>
      <div *ngIf="wishlist.length === 0" style="text-align:center;padding:60px 24px;color:var(--text3);">
        <div style="font-size:40px;margin-bottom:16px;opacity:0.3;">♡</div>
        <div style="font-size:14px;margin-bottom:8px;color:var(--text2);">Your wishlist is empty</div>
        <div style="font-size:12px;margin-bottom:20px;">Browse products and save your favorites here.</div>
        <button class="btn-primary" style="display:inline-flex;" (click)="activeTab='shop'">Browse Products →</button>
      </div>
    </ng-container>

    <!-- ==================== AI ASSISTANT ==================== -->
    <ng-container *ngIf="activeTab === 'assistant'">
      <div style="display:flex;flex-direction:column;height:100%;">

        <!-- CHAT HEADER -->
        <div class="chat-header">
          <div class="ch-left">
            <div class="ai-avatar">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 2v7M2 5.5l7 3.5 7-3.5" stroke="#3ECFB2" stroke-width="1.2"/><circle cx="9" cy="9" r="2" fill="#3ECFB2" opacity="0.6"/></svg>
              <div class="ai-online"></div>
            </div>
            <div>
              <div class="ch-name">Nexus AI</div>
              <div class="ch-status"><div class="ch-status-dot"></div>Online · Text2SQL powered</div>
            </div>
          </div>
          <div class="ch-right">
            <div class="ai-badge">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L2 2.5v3c0 2 1.3 3.5 3 4.2C7.7 9 9 7.5 9 5.5v-3L5 1Z" stroke="#3ECFB2" stroke-width="0.9"/></svg>
              LangGraph · Chainlit
            </div>
            <div class="ch-btn" (click)="clearChat()">New Chat</div>
          </div>
        </div>

        <!-- MESSAGES -->
        <div class="messages-area" #messagesContainer>
          <ng-container *ngFor="let m of chatMessages; let i = index">
            <!-- USER MESSAGE -->
            <div *ngIf="m.sender==='user'" class="msg-user">
              <div class="msg-user-bubble">{{m.text}}</div>
            </div>
            <!-- AI MESSAGE -->
            <div *ngIf="m.sender==='ai'" class="msg-ai">
              <div class="msg-ai-av"><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.3" stroke-linejoin="round"/></svg></div>
              <div class="msg-ai-body">
                <div class="msg-ai-name">NEXUS AI</div>
                <div class="msg-ai-bubble">
                  <!-- AGENT STEPS (only for responses with steps) -->
                  <div class="agent-steps" *ngIf="m.steps && m.steps.length > 0">
                    <div class="as-title"><div class="as-dot"></div>Agent ran · {{m.duration || '0.8s'}}</div>
                    <div class="step-list">
                      <div class="step-item" *ngFor="let s of m.steps">
                        <div class="step-icon si-done">✓</div>
                        <span class="step-label done">{{s}}</span>
                      </div>
                    </div>
                  </div>
                  <!-- SQL BLOCK -->
                  <div *ngIf="m.sql">
                    <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;">Generated SQL</div>
                    <div class="sql-block">{{m.sql}}</div>
                  </div>
                  <!-- RESULT TABLE -->
                  <div *ngIf="m.results && m.results.length > 0">
                    <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;">Results</div>
                    <div class="result-table-wrap">
                      <table class="result-table">
                        <thead><tr><th>Product</th><th>Price</th><th>Rating</th><th>Stock</th></tr></thead>
                        <tbody>
                          <tr *ngFor="let r of m.results"><td class="td-name">{{r.name}}</td><td class="td-price-c">{{r.basePrice | currency}}</td><td class="td-score">{{r.rating || '4.8'}}★</td><td style="font-size:11px;color:var(--green);">{{r.stockQuantity > 0 ? '✓ In stock' : 'Out of stock'}}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <!-- SUCCESS BANNER -->
                  <div class="success-banner" *ngIf="m.success">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#3EC98A" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#3EC98A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span>{{m.success}}</span>
                  </div>
                  <!-- TEXT -->
                  <div [innerHTML]="m.text"></div>
                  <!-- PLOTLY VISUALIZATION -->
                  <div *ngIf="m.visualization" class="plotly-wrap">
                    <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;">AI-Generated Chart</div>
                    <div [id]="'plotly-chart-' + i" style="width:100%;min-height:300px;background:rgba(255,255,255,0.02);border-radius:10px;overflow:hidden;"></div>
                  </div>
                  <!-- PRODUCT CHIPS -->
                  <div class="prod-chips" *ngIf="m.results && m.results.length > 0">
                    <div class="prod-chip" *ngFor="let r of m.results.slice(0,3)" (click)="selectProduct(r)">
                      <div class="pc-chip-icon" style="background:rgba(62,207,178,0.08);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 4v4l6 3 6-3V4L7 1Z" stroke="#3ECFB2" stroke-width="1.1" stroke-linejoin="round"/></svg></div>
                      <div><div class="pc-chip-name">{{r.name}}</div><div class="pc-chip-price">{{r.basePrice | currency}}</div></div>
                    </div>
                  </div>
                </div>
                <div class="msg-time">{{m.time}}</div>
              </div>
            </div>
          </ng-container>
          <!-- TYPING / STREAMING INDICATOR -->
          <div class="typing-ind" *ngIf="isTyping">
            <div class="typing-av"><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.3" stroke-linejoin="round"/></svg></div>
            <div *ngIf="streamSteps.length === 0" class="typing-dots"><div class="td-dot"></div><div class="td-dot"></div><div class="td-dot"></div></div>
            <div *ngIf="streamSteps.length > 0" style="display:flex;flex-direction:column;gap:3px;">
              <div *ngFor="let step of streamSteps" style="font-size:10px;color:var(--teal);display:flex;align-items:center;gap:5px;">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" stroke="#3ECFB2" stroke-width="1"/></svg>
                {{step}}
              </div>
              <div class="typing-dots" style="margin-top:2px;"><div class="td-dot"></div><div class="td-dot"></div><div class="td-dot"></div></div>
            </div>
          </div>
        </div>

        <!-- SUGGESTIONS -->
        <div class="suggestions">
          <div class="sug" *ngFor="let s of chatSuggestions" (click)="sendSuggestion(s)">{{s}}</div>
        </div>

        <!-- INPUT -->
        <div class="chat-input-wrap">
          <div class="chat-input-box">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="#344844" stroke-width="1.2"/><path d="M7.5 5v3M7.5 10v.3" stroke="#344844" stroke-width="1.2" stroke-linecap="round"/></svg>
            <input placeholder="Ask anything… product search, price comparison, stock check" [(ngModel)]="prompt" (keyup.enter)="sendQuery()" maxlength="500"/>
            <button class="send-btn" (click)="sendQuery()" [disabled]="!prompt.trim()">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5L2 2l2 4.5-2 4.5 9-4.5Z" fill="#080808"/></svg>
            </button>
          </div>
          <div class="input-meta">
            <div class="im-hint">Text2SQL · LangGraph · Chainlit · GPT-4o</div>
            <div class="im-counter">{{prompt.length}} / 500</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== SETTINGS ==================== -->
    <ng-container *ngIf="activeTab === 'settings'">
      <div style="padding:24px;">
        <div class="ph-title" style="margin-bottom:20px;">Settings</div>
        <div class="settings-frame">
          <div class="settings-nav">
            <div class="s-group-title">Account</div>
            <div class="s-item" [class.active]="settingsTab==='personal'" (click)="settingsTab='personal'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.1"/><path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
              Personal Info
            </div>
            <div class="s-item" [class.active]="settingsTab==='security'" (click)="settingsTab='security'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><rect x="2.5" y="6" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
              Security
            </div>
            <div class="s-group-title">Shopping</div>
            <div class="s-item" [class.active]="settingsTab==='addresses'" (click)="settingsTab='addresses'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/></svg>
              Addresses
            </div>
            <div class="s-item" [class.active]="settingsTab==='notifications'" (click)="settingsTab='notifications'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5C5.3 1.5 3.5 3.3 3.5 5.5V8l-1 1.5h10L11.5 8V5.5c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/><path d="M6 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="currentColor" stroke-width="1.1"/></svg>
              Notifications
            </div>
            <div class="s-item" style="margin-top:20px;color:var(--red);" (click)="settingsTab='danger'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><path d="M3 13h9l-4.5-9L3 13Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
              Danger Zone
            </div>
          </div>
          <div class="settings-main">
            <ng-container *ngIf="settingsTab === 'personal'">
              <div class="av-section">
                <div class="av-circle">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
                <div style="flex:1;"><div style="font-size:18px;font-weight:600;">{{auth.currentUserValue?.fullName}}</div><div style="font-size:12px;color:var(--text3);">{{auth.currentUserValue?.email}}</div></div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div><div class="f-label">Full Name</div><input class="fi" [value]="auth.currentUserValue?.fullName"/></div>
                <div><div class="f-label">Email</div><input class="fi" [value]="auth.currentUserValue?.email" readonly/></div>
                <div><div class="f-label">Phone</div><input class="fi" value="+90 555 123 4567"/></div>
                <div><div class="f-label">Location</div><input class="fi" value="Istanbul, TR"/></div>
              </div>
              <div style="margin-top:32px;display:flex;justify-content:space-between;align-items:center;">
                <button class="save-btn">Save Changes</button>
                <button (click)="logout()" style="background:transparent;color:var(--red);border:none;cursor:pointer;font-size:13px;font-weight:500;">Sign Out</button>
              </div>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'security'">
              <div style="margin-bottom:24px;"><div class="sec-title">Security</div><div style="font-size:12px;color:var(--text3);">Manage your password.</div></div>
              <div style="max-width:400px;display:flex;flex-direction:column;gap:16px;">
                <div><div class="f-label">Current Password</div><input type="password" class="fi" placeholder="••••••••"/></div>
                <div><div class="f-label">New Password</div><input type="password" class="fi" placeholder="Min. 8 characters"/></div>
                <button class="save-btn">Update Password</button>
              </div>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'addresses'">
              <div style="margin-bottom:24px;"><div class="sec-title">Addresses</div><div style="font-size:12px;color:var(--text3);">Manage your shipping locations.</div></div>
              <div class="addr-card default">
                <div style="width:34px;height:34px;border-radius:8px;background:var(--glass2);display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/></svg></div>
                <div style="flex:1;"><div style="font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px;">Home <span style="font-size:9px;padding:2px 6px;background:var(--teal-dim);color:var(--teal);border-radius:6px;border:1px solid rgba(62,207,178,0.2);">Default</span></div><div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.5;">Istanbul, TR</div></div>
              </div>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'notifications'">
              <div style="margin-bottom:24px;"><div class="sec-title">Notifications</div><div style="font-size:12px;color:var(--text3);">Choose how you want to be alerted.</div></div>
              <div style="background:var(--glass);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
                <div class="notif-row"><div style="flex:1;"><div style="font-size:14px;font-weight:500;">Order Updates</div><div style="font-size:11px;color:var(--text3);">Real-time tracking of packages</div></div><div class="tog" [class.on]="notifPrefs.orders" (click)="notifPrefs.orders = !notifPrefs.orders"><div class="tog-thumb"></div></div></div>
                <div class="notif-row"><div style="flex:1;"><div style="font-size:14px;font-weight:500;">Marketing & Deals</div><div style="font-size:11px;color:var(--text3);">Price drops and offers</div></div><div class="tog" [class.on]="notifPrefs.marketing" (click)="notifPrefs.marketing = !notifPrefs.marketing"><div class="tog-thumb"></div></div></div>
              </div>
              <button class="save-btn" style="margin-top:24px;">Save Preferences</button>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'danger'">
              <div style="color:var(--red);font-family:'Playfair Display';font-size:24px;font-style:italic;margin-bottom:16px;">Danger Zone</div>
              <div class="danger-box">
                <div class="dz-title">Delete My Account</div>
                <div class="dz-desc">Permanently remove your account and all associated data. This action is irreversible.</div>
                <button style="padding:10px 20px;border-radius:20px;border:1px solid var(--red-border);color:var(--red);background:transparent;cursor:pointer;">Deactivate Account</button>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </ng-container>

  </div>
</div>
  `,
})
export class ConsumerComponent implements OnInit {
  readonly consumerNav = CONSUMER_NAV;
  activeTab = 'home';
  settingsTab = 'personal';
  filtersOpen = true;
  selectedProduct: any = null;
  products: any[] = [];
  sentiments: any = {};
  prompt = '';
  chatMessages: any[] = [];
  history: string[] = [];
  searchQuery = '';
  maxPrice = 3000;
  minPrice = 0;
  selectedRating = 0;
  selectedCat = 'All';
  availability = { inStock: true, onSale: false, newArrivals: false };
  notifPrefs = { orders: true, marketing: false };
  categories: { name: string, checked: boolean }[] = [];
  selectedBrands: string[] = [];
  get brands() {
    const bNames = Array.from(new Set(this.products.map(p => p.brand))).filter(b => b);
    return bNames.map(name => ({
      name,
      checked: this.selectedBrands.includes(name)
    }));
  }
  wishlist: any[] = [];
  qty = 1;
  isTyping = false;
  chatSuggestions = ['Top selling products', 'Recommend a laptop for my budget', 'Order status', 'Discounted items', 'Apple vs Samsung compare'];
  auth = inject(AuthService);
  ai = inject(AiService);
  productService = inject(ProductService);
  toast = inject(ToastService);
  router = inject(Router);

  get cartCount(): number {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((sum: number, i: any) => sum + (i.qty || i.quantity || 1), 0);
    } catch { return 0; }
  }

  private getTimeNow(): string {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  ngOnInit() {
    const userName = this.auth.currentUserValue?.fullName || 'there';
    this.chatMessages.push({
      sender: 'ai',
      text: `Hello <strong>${userName}</strong>! 👋 I'm Nexus AI — your shopping assistant.<br><br>Ask me anything in natural language, and I'll analyze the database to find the best products for you.`,
      time: this.getTimeNow()
    });

    this.productService.getProducts().subscribe(res => {
      this.products = res;
      const cats = Array.from(new Set(this.products.map(p => p.category)));
      this.categories = cats.map((c: any) => ({ name: c, checked: false }));
    });
  }

  getTags(tagsStr: string): string[] {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getTagClass(tag: string): string {
    const t = tag.toLowerCase();
    if (t.includes('minimal') || t.includes('aesthetic') || t.includes('design')) return 'tag-aesthetic';
    if (t.includes('prod') || t.includes('silent') || t.includes('work')) return 'tag-productivity';
    if (t.includes('gaming') || t.includes('perf')) return 'tag-gaming';
    if (t.includes('audio') || t.includes('listen')) return 'tag-audio';
    if (t.includes('nomad') || t.includes('travel')) return 'tag-productivity'; // Reusing blue for nomadic
    return 'tag-minimal';
  }

  toggleBrand(name: string) {
    if (this.selectedBrands.includes(name)) {
      this.selectedBrands = this.selectedBrands.filter(b => b !== name);
    } else {
      this.selectedBrands.push(name);
    }
  }

  get activeFilters() {
    const catFilters = this.categories.filter(c => c.checked).map(c => c.name);
    return [...this.selectedBrands, ...catFilters];
  }

  get filteredProducts() {
    let list = this.products || [];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.tags && p.tags.toLowerCase().includes(q))
      );
    }
    if (this.selectedCat !== 'All') {
      list = list.filter(p => p.category === this.selectedCat);
    }
    if (this.maxPrice < 3000 || this.minPrice > 0) {
      list = list.filter(p => p.basePrice <= this.maxPrice && p.basePrice >= this.minPrice);
    }
    const selBrands = this.brands.filter(b => b.checked).map(b => b.name);
    if (selBrands.length > 0) {
      list = list.filter(p => selBrands.includes(p.brand));
    }
    const selCats = this.categories.filter(c => c.checked).map(c => c.name);
    if (selCats.length > 0) {
      list = list.filter(p => selCats.includes(p.category));
    }
    if (this.availability.inStock) {
      list = list.filter(p => p.stockQuantity > 0);
    }
    return list;
  }

  removeChip(f: string) {
    if (this.selectedBrands.includes(f)) {
      this.selectedBrands = this.selectedBrands.filter(b => b !== f);
    }
    const cat = this.categories.find(c => c.name === f);
    if (cat) cat.checked = false;
  }

  resetFilters() {
    this.maxPrice = 3000;
    this.minPrice = 0;
    this.selectedRating = 0;
    this.selectedCat = 'All';
    this.brands.forEach(b => b.checked = false);
    this.categories.forEach(c => c.checked = false);
    this.availability = { inStock: false, onSale: false, newArrivals: false };
    this.searchQuery = '';
  }

  selectProduct(p: any) {
    this.selectedProduct = p;
    this.activeTab = 'shop';
    this.qty = 1;
    this.checkSentiment(p);
  }

  checkSentiment(p: any) {
    this.productService.getSentiment(p.productId).subscribe(res => {
      this.sentiments[p.productId] = res;
    });
  }

  toggleWishlist(p: any) {
    const idx = this.wishlist.findIndex(w => w.productId === p.productId);
    if (idx >= 0) {
      this.wishlist.splice(idx, 1);
    } else {
      this.wishlist.push(p);
    }
  }

  addToCart(p: any) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let existing = cart.find((item: any) => item.productId === p.productId);
    if (existing) existing.qty++;
    else cart.push({ ...p, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    this.toast.show(p.name + ' added to cart');
  }

  sendSuggestion(s: string) {
    this.prompt = s;
    this.sendQuery();
  }

  clearChat() {
    this.chatMessages = [];
    this.history = [];
    this.ai.clearSession();
    const userName = this.auth.currentUserValue?.fullName || 'there';
    this.chatMessages.push({
      sender: 'ai',
      text: `Hello <strong>${userName}</strong>! 👋 I'm Nexus AI — your shopping assistant.<br><br>Ask me anything in natural language.`,
      time: this.getTimeNow()
    });
  }

  streamSteps: string[] = [];

  sendQuery() {
    if (!this.prompt.trim()) return;
    const userMsg = this.prompt.trim();
    this.chatMessages.push({ sender: 'user', text: userMsg, time: this.getTimeNow() });
    this.prompt = '';
    this.isTyping = true;
    this.streamSteps = [];
    if (!this.auth.currentUserValue) {
      this.isTyping = false;
      this.chatMessages.push({
        sender: 'ai',
        text: 'Please sign in to use Nexus AI.',
        time: this.getTimeNow(),
      });
      return;
    }

    this.ai.queryStream(
      userMsg, this.history,
      (step) => {
        this.streamSteps.push(step.message);
      },
      (res) => {
        this.isTyping = false;
        this.streamSteps = [];
        const aiMsg: any = {
          sender: 'ai',
          text: res.response,
          time: this.getTimeNow(),
          steps: ['Guardrails check', 'SQL generated', 'Query executed', 'Response formatted'],
          duration: '0.8s'
        };
        if (res.sql) aiMsg.sql = res.sql;
        if (res.data && res.data.length > 0) aiMsg.results = res.data;
        if (res.visualization) aiMsg.visualization = res.visualization;
        this.chatMessages.push(aiMsg);
        this.history.push('User: ' + userMsg, 'AI: ' + res.response);
        if (res.visualization) {
          setTimeout(() => this.renderPlotly(this.chatMessages.length - 1, res.visualization, res.data || []), 100);
        }
      },
      (err) => {
        this.isTyping = false;
        this.streamSteps = [];
        this.chatMessages.push({ sender: 'ai', text: 'Sorry, something went wrong. Please try again.', time: this.getTimeNow() });
      }
    );
  }

  private renderPlotly(msgIndex: number, vizCode: string, data: any[]) {
    const Plotly = (window as any)['Plotly'];
    if (!Plotly) return;
    const containerId = 'plotly-chart-' + msgIndex;
    try {
      const plotlyJson = JSON.parse(vizCode);
      if (plotlyJson.data) {
        const layout = { ...(plotlyJson.layout || {}), paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#7A918D' } };
        Plotly.newPlot(containerId, plotlyJson.data, layout, { responsive: true, displayModeBar: false });
        return;
      }
    } catch { /* not JSON, try executing as code */ }
    try {
      const fn = new Function('data', 'Plotly', 'containerId', vizCode.replace('fig.to_json()', `Plotly.newPlot(containerId, fig.data, {...fig.layout, paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)', font:{color:'#7A918D'}}, {responsive:true, displayModeBar:false})`));
      fn(data, Plotly, containerId);
    } catch { /* visualization rendering failed silently */ }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
