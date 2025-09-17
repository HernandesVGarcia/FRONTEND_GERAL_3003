import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

//import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './app/environments/enviroments.prod';


if (environment.production) {
  enableProdMode();
}

//platformBrowserDynamic().bootstrapModule(AppModule)
 // .catch(err => console.error(err));

bootstrapApplication(AppComponent,  {
    providers: [
      provideHttpClient(withFetch()),
      provideRouter(routes),
      provideAnimations() // Necessário para as animações do Angular Material
    ]
  }  )
  .catch((err) => console.error(err));
