import { NgModule } from '@angular/core';
import { PagesRoutingModule } from './pages.routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { DropdownModule } from '@app/shared/components/dropdown/dropdown.module';
import { ListLogsComponent } from '../auth/components/list-logs/list-logs.component';
import { ViewLogsComponent } from '../auth/components/view-logs/view-logs.component';
import { GuestUserComponent } from '../auth/components/guest-user/guest-user.component';
import { CreateGuestUserComponent } from '../auth/components/create-guest-user/create-guest-user.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CUSTOM_ERROR_MESSAGES, NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EditGuestUserComponent } from '../auth/components/edit-guest-user/edit-guest-user.component';
import { ErrorMessageService } from 'ng-bootstrap-form-validation/lib/Services/error-message.service';
import { AssignHotlesComponent } from '../auth/components/assign-hotles/assign-hotles.component';
import { HasAnyRoleDirective } from '@app/shared/directives/has-any-role.directive';
import { SignedUrlPipe } from '@app/shared/pipes/signed-url.pipe';

@NgModule({
  declarations:
    [
      ListLogsComponent,
      ViewLogsComponent,
      GuestUserComponent,
      EditGuestUserComponent,
      CreateGuestUserComponent,
      AssignHotlesComponent,



    ],
  imports: [
    SharedModule,
    CommonModule,
    PagesRoutingModule,
    NgxDatatableModule,
    NgSelectModule,
    SignedUrlPipe,
    NgBootstrapFormValidationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    DropdownModule,
    TranslateModule.forChild(),
    HasAnyRoleDirective
  ],
    providers: [
      {
        provide: CUSTOM_ERROR_MESSAGES,
        useValue: [
          {
            error: 'required',
            format: (label: string) => `${label} is required!`,
          },
          {
            error: 'minlength',
            format: (label: string, error: any) => `${label} must be at least ${error.requiredLength} characters.`,
          },
        ],
        multi: true, // Allow merging with other CUSTOM_ERROR_MESSAGES
      },
    ],


})
export class PagesModule {}
