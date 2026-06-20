import { Routes } from '@angular/router';

export const AUTH_LAYOUT_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('../views/auth/auth.module').then(m => m.AuthModule),
  }
];
