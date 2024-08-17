import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service'; // Ajusta la ruta según tu estructura de proyecto
import { map, take } from 'rxjs/operators';

export const libraryGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1), // Toma solo el primer valor emitido
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/login']); // Redirige a la página de inicio de sesión si el usuario no está autenticado
        return false;
      }
    })
  );
};
