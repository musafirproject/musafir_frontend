import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotificationsComponent } from './notifications.component';
import { ListNotificationComponent } from './components/list-notification/list-notification.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'notification-list',
        component: ListNotificationComponent,
        data: {
          title: 'List',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
