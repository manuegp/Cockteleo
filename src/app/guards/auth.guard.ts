import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../services/auth/auth.service'
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  
  return authService.user$.pipe(
    take(1), // Toma solo el primer valor emitido
    map(user => {
        const isLoginRoute = state.url.includes('login');

        if (!user && !isLoginRoute) {
            // Si el usuario no está autenticado y no está intentando acceder a login
            router.navigate(['/login']); // Redirige a login
            return false;
        } else if (user && isLoginRoute) {
            // Si el usuario está autenticado y está intentando acceder a login
            router.navigate(['/library']); // Redirige a library
            return false;
        } else {
            return true;
        }
    })
);
};
