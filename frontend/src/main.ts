import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

// Some browser bundles (SockJS deps) expect Node-like globals.
// Provide minimal shims to prevent runtime crash ("global is not defined").
const g: any = globalThis as any;
g.global ??= g;
g.process ??= { env: {} };

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
