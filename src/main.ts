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
import { registerLicense } from '@syncfusion/ej2-base';

//registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCekx3Rnxbf1x1ZFRHal5STnRfUiweQnxTdEBjXX9YcXVXRWJcU0ZwXUlfag==');
registerLicense('ORg4AjUWIQA/Gnt2XFhhQlJHfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5XdkxiW3pYdXxXQ2dcWkZ/');

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
