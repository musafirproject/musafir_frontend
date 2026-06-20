import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SettingsComponent } from './settings.component';
import { CreateHotelComponent } from './hotel/components/create-hotel/create-hotel.component';
import { ListhotelComponent } from './hotel/components/list-hotel/list-hotel.component';
import { ViewHotelComponent } from './hotel/components/view-hotle/view-hotel.component';
import { EditHotelComponent } from './hotel/components/edit-hotel/edit-hotel.component';
import { ListSettingsComponent } from './list-settings/list-settings.component';
import { ListZonesComponent } from './zones/components/list-zones/list-zones.component';
import { CreateZoneComponent } from './zones/components/create-zone/create-zone.component';
import { ViewZoneComponent } from './zones/components/view-zone/view-zone.component';
import { EditZoneComponent } from './zones/components/edit-zone/edit-zone.component';
import { ListDistrictComponent } from './districts/components/list-district/list-district.component';
import { ResidencePerformanceComponent } from './hotel/components/residence-performance/residence-performance.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'list',
        component: ListSettingsComponent,
        data: {
          title: 'List',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin', 'guest_user']
        },
      },
      {
        path: 'create-hotel',
        component: CreateHotelComponent,
        data: {
          title: 'create',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin']
        }
      },
      {
        path: 'hotel',
        component: ListhotelComponent,
        data: {
          title: 'list',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin', 'guest_user']
        }
      },
      {
        path: 'residence-performance',
        component: ResidencePerformanceComponent,
        data: {
          title: 'Residence Performance',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin', 'guest_user']
        }
      },
      {
        path: 'hotel/:id/view',
        component: ViewHotelComponent,
        data: {
          title: 'Hotel View',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin', 'guest_user']
        }
      },
      {
        path: 'hotel/:id/edit',
        component: EditHotelComponent,
        data: {
          title: 'Edit Hotel',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin']
        }
      },
      {
        path: 'zone',
        component: ListZonesComponent,
        data: {
          title: 'list',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin', 'guest_user']
        }
      },
      {
        path: 'create-zone',
        component: CreateZoneComponent,
        data: {
          title: 'create',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin']
        }
      },
      {
        path: 'zone/:id/view',
        component: ViewZoneComponent,
        data: {
          title: 'Zone View',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin', 'guest_user']
        }
      },
      {
        path: 'zone/:id/edit',
        component: EditZoneComponent,
        data: {
          title: 'Edit zone',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin']
        }
      },
      {
        path: 'district',
        component: ListDistrictComponent,
        data: {
          title: 'list',
          hidePageHeader: true,
          roles: ['super_admin', 'sub_admin', 'guest_user']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
