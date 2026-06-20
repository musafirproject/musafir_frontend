import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from './layout/layout.module';
import { SharedModule } from './shared/shared.module';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { AppConfigState } from './store/app-config/app-config.state';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app.component';

import { AuthInterceptor } from './views/auth/auth.interceptor';
import { NgxEditorModule } from 'ngx-editor';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BidiModule } from '@angular/cdk/bidi';
import { PusherService } from './shared/services/pusher.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpProgressInterceptor } from './views/auth/http-progress.interceptor';
import { JobProgressOverlayComponent } from './shared/components/job-progress-overlay/job-progress-overlay.component';

// mockServer();

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        SharedModule,
        TranslateModule.forRoot(),
        NgxEditorModule,
        LayoutModule,
        BidiModule,
        JobProgressOverlayComponent,
        NgxsModule.forRoot([
            AppConfigState
        ]),
        NgxsReduxDevtoolsPluginModule.forRoot(),
        NgxsLoggerPluginModule.forRoot(),
        NgSelectModule,
        ToastrModule.forRoot(),
        BsDatepickerModule.forRoot(),



    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true

        },
        { provide: HTTP_INTERCEPTORS, useClass: HttpProgressInterceptor, multi: true },
        {
            provide: LocationStrategy, useClass: HashLocationStrategy,
        },
        PusherService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
