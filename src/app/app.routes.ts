import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LibraryComponent } from './library/library.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
    { path: '',   redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent,  canActivate:[authGuard] },
    { path: 'library', component: LibraryComponent, canActivate:[authGuard] },
    { path: '**', redirectTo: 'library' },
  ];
