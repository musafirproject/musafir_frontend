import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { LogoModule } from '@app/shared/components/logo/logo.module';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DeletemodelComponent } from './modals/deletemodel/deletemodel.component';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DropdownModule } from '@app/shared/components/dropdown/dropdown.module';
import { AvatarModule } from '@app/shared/components/avatar/avatar.module';
import { TranslateModule } from '@ngx-translate/core';
import { PusherService } from '@app/shared/services/pusher.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { PasswordResetModalComponent } from './modals/password-reset-modal/password-reset-modal.component';
import { DeactivateComponent } from './modals/deactivate/deactivate.component';
import { ActivateComponent } from './modals/activate/activate.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterFormComponent,
    LoginFormComponent,
    RegisterComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    DeletemodelComponent,
    PasswordResetModalComponent,
    DeactivateComponent,
    ActivateComponent,
  ],
  imports: [
    AuthRoutingModule,
    SharedModule,
    LogoModule,
    LogoModule,
    NgBootstrapFormValidationModule.forRoot(),
    ToastrModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgSelectModule,
    ToastrModule.forRoot(),
    BsDatepickerModule.forRoot(),
    DropdownModule,
    AvatarModule,
    TranslateModule.forChild(),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true

    },
    {
      provide: LocationStrategy, useClass: HashLocationStrategy,
    },
    DatePipe,
    PusherService
  ],
})
export class AuthModule { }
