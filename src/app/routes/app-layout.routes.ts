import { Routes } from '@angular/router';
import { AuthGuard } from '@app/views/auth/auth.guard';

export const APP_LAYOUT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../views/dashboard/dashboard.module').then(m => m.DashboardModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { roles: ['super_admin', 'sub_admin', 'guest_user'] }
  },
  {
    path: 'pages',
    loadChildren: () =>
      import('../views/pages/pages.module').then(m => m.PagesModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'] }
  },
  {
    path: 'guests',
    loadChildren: () =>
      import('../views/guests/guests.module').then(m => m.GuestsModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'] }
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('../views/settings/settings.module').then(m => m.SettingsModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { roles: ['super_admin', 'sub_admin', 'guest_user'] }
  },
  {
    path: 'Reports',
    loadChildren: () =>
      import('../views/reports/reports.module').then(m => m.ReportsModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'] }
  },
  {
    path: 'Notifications',
    loadChildren: () =>
      import('../views/notifications/notifications.module').then(m => m.NotificationsModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'] }
  },
  {
    path: 'staff',
    loadChildren: () =>
      import('../views/staff/staff.module').then(m => m.StaffModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'] }
  }
];
