import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent,  {
    providers: [
      provideHttpClient(withFetch()),
      provideRouter(routes),
      provideAnimations() // Necessário para as animações do Angular Material
    ]
  }  )
  .catch((err) => console.error(err));
