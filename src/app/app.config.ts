import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

/**
 * Configuração principal da aplicação RV Digital.
 * Setup para standalone components com interceptors e providers.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      ReactiveFormsModule,
      FormsModule
    )
  ]
};