import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffRoutingModule } from './staff-routing.module';
import { ListStaffComponent } from './components/list-staff/list-staff.component';
import { CreateStaffComponent } from './components/create-staff/create-staff.component';
import { EditStaffComponent } from './components/edit-staff/edit-staff.component';
import { ViewStaffComponent } from './components/view-staff/view-staff.component';
import { SharedModule } from '@app/shared/shared.module';
import { StaffComponent } from './staff.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DropdownModule } from '@app/shared/components/dropdown/dropdown.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UploadModule } from '@app/shared/components/upload/upload.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TranslateModule } from '@ngx-translate/core';
import { AlertModule } from 'ngx-bootstrap/alert';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { SignedUrlPipe } from '@app/shared/pipes/signed-url.pipe';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HasAnyRoleDirective } from "@app/shared/directives/has-any-role.directive";



@NgModule({
  declarations: [
    StaffComponent,
    ListStaffComponent,
    CreateStaffComponent,
    EditStaffComponent,
    ViewStaffComponent,
  ],
  imports: [
    CommonModule,
    StaffRoutingModule,
    SharedModule,
    SignedUrlPipe,
    NgxDatatableModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forChild(),
    UploadModule.forRoot(),
    NgSelectModule,
    PaginationModule.forRoot(),
    NgBootstrapFormValidationModule.forRoot(),
    TranslateModule.forChild(),
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    HasAnyRoleDirective
]
})
export class StaffModule { }
