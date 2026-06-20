import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { routes } from './user-list.routing.module';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { UserListComponent } from './user-list.component';
import { AvatarModule } from '@app/shared/components/avatar/avatar.module';
import { DropdownModule } from '@app/shared/components/dropdown/dropdown.module';
import { CreateUserComponent } from '../components/create-user/create-user.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UploadModule } from '@app/shared/components/upload/upload.module';
import { CUSTOM_ERROR_MESSAGES, NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { ViewUserComponent } from './components/view-user/view-user.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { SwitchModule } from '@app/shared/components/switch/switch.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonModule, DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../auth.interceptor';
import { SignedUrlPipe } from '@app/shared/pipes/signed-url.pipe';
import { HasAnyRoleDirective } from '@app/shared/directives/has-any-role.directive';



@NgModule({
    declarations:
    [   UserListComponent,
        CreateUserComponent,
        EditUserComponent,
        ViewUserComponent,

    ],
    imports: [
        SharedModule,
        CommonModule,
        NgxDatatableModule,
        AvatarModule,
        DropdownModule,
        FormsModule,
        SignedUrlPipe,
        ReactiveFormsModule,
        NgSelectModule,
        UploadModule.forRoot(),
        ToastrModule.forRoot(),
        PaginationModule.forRoot(),
        SwitchModule,
        NgBootstrapFormValidationModule.forRoot(),
        RouterModule.forChild(routes),
        BsDatepickerModule.forRoot(),
        TranslateModule.forChild(),
        HasAnyRoleDirective
    ],
    exports: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true

        },
        {
            provide: LocationStrategy , useClass: HashLocationStrategy,
        },
        DatePipe,
        ToastrService
        // PusherService
    ],
    
})
export class UserListModule {}
