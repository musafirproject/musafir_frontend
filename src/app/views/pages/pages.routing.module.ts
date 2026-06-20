import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListLogsComponent } from '../auth/components/list-logs/list-logs.component';
import { ViewLogsComponent } from '../auth/components/view-logs/view-logs.component';
import { GuestUserComponent } from '../auth/components/guest-user/guest-user.component';
import { CreateGuestUserComponent } from '../auth/components/create-guest-user/create-guest-user.component';
import { AssignHotlesComponent } from '../auth/components/assign-hotles/assign-hotles.component';
import { MediaGalleryComponent } from '@app/shared/components/media-gallery/media-gallery.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  {
    path: 'profile',
    loadChildren: () => import('../auth/profile/profile.module').then(m => m.ProfileModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
    }
  },
  {
    path: 'activity',
    component: ListLogsComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin']
    }
  },
  {
    path: ':id/view',
    component: ViewLogsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'View',
      hidePageHeader: false,
      roles: ['super_admin']
    }
  },
  {
    path: 'guestusers',
    component: GuestUserComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin']
    }
  },
  {
    path: 'create-guestuser',
    component: CreateGuestUserComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin']
    }
  },
  {
    path: ':userId/assign-hotels',
    component: AssignHotlesComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin']
    }
  },
  {
    path: 'users',
    loadChildren: () => import('../auth/user-list/user-list.module').then(m => m.UserListModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin', 'sub_admin']
    }
  },
  {
    path: 'media',
    component: MediaGalleryComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin']
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
