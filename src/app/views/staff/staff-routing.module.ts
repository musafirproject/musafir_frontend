import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StaffComponent } from './staff.component';
import { CreateStaffComponent } from './components/create-staff/create-staff.component';
import { ViewStaffComponent } from './components/view-staff/view-staff.component';
import { EditStaffComponent } from './components/edit-staff/edit-staff.component';
import { ListStaffComponent } from './components/list-staff/list-staff.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: StaffComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'create',
        component: CreateStaffComponent,
        data: {
          title: 'Create',
          hidePageHeader: false,
          roles: ['guest_care']
        }
      },
      {
        path: 'list',
        component: ListStaffComponent,
        data: {
          title: 'List',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
        }
      },
      {
        path: ':id/view',
        component: ViewStaffComponent,
        data: {
          title: 'View',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
        }
      },
      {
        path: ':id/edit',
        component: EditStaffComponent,
        data: {
          title: 'Edit',
          hidePageHeader: false,
          roles: ['guest_care']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule {}
