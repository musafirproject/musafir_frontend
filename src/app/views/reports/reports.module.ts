import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ListReportComponent } from './components/list-report/list-report.component';
import { GuestReportModalComponent, } from './modals/guest-report-modal/guest-report-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { HasAnyRoleDirective } from '@app/shared/directives/has-any-role.directive';


@NgModule({
  declarations: [
    ReportsComponent,
    ListReportComponent,
    GuestReportModalComponent,


  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HasAnyRoleDirective,
    ModalModule.forChild(),
    NgSelectModule,
    HttpClientModule,
    NgBootstrapFormValidationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TranslateModule.forChild(),


  ]
})
export class ReportsModule { }
