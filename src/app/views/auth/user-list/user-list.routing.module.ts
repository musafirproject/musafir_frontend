import { Routes } from '@angular/router';

import { CreateUserComponent } from '../components/create-user/create-user.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { ViewUserComponent } from './components/view-user/view-user.component';
import { UserListComponent } from './user-list.component';
import { AuthGuard } from '../auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin', 'sub_admin']
    }
  },
  {
    path: 'create',
    component: CreateUserComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['super_admin', 'sub_admin']
    }
  },
  {
    path: ':id/edit',
    component: EditUserComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Edit',
      hidePageHeader: false,
      roles: ['super_admin', 'sub_admin']
    }
  },
  {
    path: ':id/view',
    component: ViewUserComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'View',
      hidePageHeader: false,
      roles: ['super_admin', 'sub_admin']
    }
  }
];
