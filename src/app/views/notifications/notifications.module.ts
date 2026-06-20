import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { ListNotificationComponent } from './components/list-notification/list-notification.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DropdownModule } from '@app/shared/components/dropdown/dropdown.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckboxModule } from '@app/shared/components/checkbox/checkbox.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { CreateNotificationModalComponent } from './modals/create-notification-modal/create-notification-modal.component';
import { NgxEditorModule } from 'ngx-editor';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EditNotificationComponent } from './modals/edit-notification/edit-notification.component';
import { DeleteNotificationModalComponent } from './modals/delete-notification-modal/delete-notification-modal.component';
import { ViewNotificationComponent } from './modals/view-notification/view-notification.component';
import { PusherService } from '@app/shared/services/pusher.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthInterceptor } from '../auth/auth.interceptor';


@NgModule({
  declarations: [
    NotificationsComponent,
    ListNotificationComponent,
    CreateNotificationModalComponent,
    EditNotificationComponent,
    DeleteNotificationModalComponent,
    ViewNotificationComponent
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    NgxDatatableModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forChild(),
    PaginationModule.forRoot(),
    TranslateModule.forChild(),
    NgSelectModule,
    CheckboxModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    NgxEditorModule.forRoot({
      locals: {
        // menu
        bold: 'Bold',
        italic: 'Italic',
        code: 'Code',
        underline: 'Underline',
        strike: 'Strike',
        blockquote: 'Blockquote',
        bullet_list: 'Bullet List',
        ordered_list: 'Ordered List',
        heading: 'Heading',
        h1: 'Header 1',
        h2: 'Header 2',
        h3: 'Header 3',
        h4: 'Header 4',
        h5: 'Header 5',
        h6: 'Header 6',
        align_left: 'Left Align',
        align_center: 'Center Align',
        align_right: 'Right Align',
        align_justify: 'Justify',
        text_color: 'Text Color',
        background_color: 'Background Color',
        insertLink: 'Insert Link',
        removeLink: 'Remove Link',
        insertImage: 'Insert Image',

        // pupups, forms, others...
        url: 'URL',
        text: 'Text',
        openInNewTab: 'Open in new tab',
        insert: 'Insert',
        altText: 'Alt Text',
        title: 'Title',
        remove: 'Remove',
      },
    }),
    NgBootstrapFormValidationModule.forRoot()
  ],
  providers: [ToastrService, PusherService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true

},]
})
export class NotificationsModule { }
