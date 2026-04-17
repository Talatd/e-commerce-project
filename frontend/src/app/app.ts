import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  isLightMode = false;

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      this.isLightMode = true;
      document.documentElement.classList.add('light-mode');
    }

    // Cursor Logic
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.mag-pill') || target.closest('.npill') || target.closest('.nitem') || target.closest('.gcard') || target.closest('.c-item') || target.closest('.cursor-pointer') || target.closest('.fancy-link') || target.style.cursor === 'pointer' || getComputedStyle(target).cursor === 'pointer') {
         cursor?.classList.add('hover');
         ring?.classList.add('hover');
      } else {
         cursor?.classList.remove('hover');
         ring?.classList.remove('hover');
      }

      // Magnetic pills spotlight
      const pill = target.closest('.mag-pill') as HTMLElement | null;
      if (pill) {
        const r = pill.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        pill.style.setProperty('--mx', x + '%');
        pill.style.setProperty('--my', y + '%');
      }
    });
    
    document.addEventListener('mousedown', e => {
       cursor?.classList.add('click');
       ring?.classList.add('click');
       setTimeout(() => {
         cursor?.classList.remove('click');
         ring?.classList.remove('click');
       }, 200);

       const target = e.target as HTMLElement;
       const btn = target.closest('.ripple-btn') as HTMLElement;
       if (btn) {
         const r = document.createElement('span');
         r.className = 'ripple';
         const rect = btn.getBoundingClientRect();
         const size = Math.max(rect.width, rect.height);
         r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
         btn.appendChild(r);
         setTimeout(() => r.remove(), 600);
       }
    });

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if(cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
      if(ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
      requestAnimationFrame(loop);
    };
    loop();
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    if (this.isLightMode) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }
}
