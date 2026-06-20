import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout-component';

import { AUTH_LAYOUT_ROUTES } from './routes/auth-layout.routes';
import { APP_LAYOUT_ROUTES } from './routes/app-layout.routes';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: APP_LAYOUT_ROUTES
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: AUTH_LAYOUT_ROUTES
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      preloadingStrategy: PreloadAllModules,
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
