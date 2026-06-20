import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportsComponent } from './reports.component';
import { ListReportComponent } from './components/list-report/list-report.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'report-list',
        component: ListReportComponent,
        data: {
          title: 'List',
          hidePageHeader: false,
          roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}
