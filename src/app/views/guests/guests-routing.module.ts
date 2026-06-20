import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GuestComponent } from './guests.component';
import { CreateGuestComponent } from './components/create-guest/create-guest.component';
import { ListGuestComponent } from './components/list-guest/list-guest.component';
import { ViewGuestComponent } from './components/view-guest/view-guest.component';
import { EditGuestComponent } from './components/edit-guest/edit-guest.component';
import { GuestHistoryComponent } from './components/guest-history/guest-history.component';
import { BlackListComponent } from './components/black-list/black-list.component';
import { CreateBlackListComponent } from './components/create-black-list/create-black-list.component';
import { AbnormalComponent } from './components/abnormal/abnormal.component';
import { VisaExpiryComponent } from './components/visa-expiry/visa-expiry.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: GuestComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'create',
        component: CreateGuestComponent,
        data: {
          title: 'Create',
          hidePageHeader: false,
          roles: ['guest_care']
        }
      },
      {
        path: 'list',
        component: ListGuestComponent,
        data: {
          title: 'List',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
        }
      },
      {
        path: ':hotel_id/guests',
        component: ListGuestComponent,
        data: {
          title: 'List',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
        }
      },
      {
        path: ':id/view',
        component: ViewGuestComponent,
        data: {
          title: 'View',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
        }
      },
      {
        path: ':id/edit',
        component: EditGuestComponent,
        data: {
          title: 'Edit',
          hidePageHeader: false,
          roles: ['guest_care']
        }
      },
      {
        path: 'history',
        component: GuestHistoryComponent,
        data: {
          title: 'History',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin']
        }
      },
      {
        path: 'blacklist',
        component: BlackListComponent,
        data: {
          title: 'Black List',
          hidePageHeader: false,
          roles: ['super_admin']
        }
      },
      {
        path: 'abnormal',
        component: AbnormalComponent,
        data: {
          title: 'Abnormal Guests',
          hidePageHeader: false,
          roles: ['super_admin']
        }
      },
      {
        path: ':scope/visa-expiry',
        component: VisaExpiryComponent,
        data: {
          title: 'Visa Expiry',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_care', 'guest_user']
        }
      },
      {
        path: 'create-blacklist',
        component: CreateBlackListComponent,
        data: {
          title: 'Create Black List',
          hidePageHeader: false,
          roles: ['super_admin']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuestsRoutingModule {}
