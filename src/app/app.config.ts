import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import 'hammerjs'

import { routes } from './app.routes';
import { HammerModule, provideClientHydration } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';



export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(HammerModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(()=> getStorage()),
    provideAuth(()=> getAuth()), provideAnimationsAsync()
  ],
};
