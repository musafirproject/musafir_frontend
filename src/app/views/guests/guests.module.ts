import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AlertModule } from 'ngx-bootstrap/alert';
import { GuestsRoutingModule } from './guests-routing.module';
import { CreateGuestComponent } from './components/create-guest/create-guest.component';
import { ListGuestComponent } from './components/list-guest/list-guest.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DropdownModule } from '@app/shared/components/dropdown/dropdown.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UploadModule } from '@app/shared/components/upload/upload.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from '@app/shared/components/checkbox/checkbox.module';
import { ViewGuestComponent } from './components/view-guest/view-guest.component';
import { EditGuestComponent } from './components/edit-guest/edit-guest.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from './modals/delete-modal/delete-modal.component';
import { NgxEditorModule } from 'ngx-editor';
import { GuestComponent } from './guests.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { GuestHistoryComponent } from './components/guest-history/guest-history.component';
import { BlackListComponent } from './components/black-list/black-list.component';
import { CreateBlackListComponent } from './components/create-black-list/create-black-list.component';
import { ReportModalComponent } from './modals/report-modal/report-modal.component';
import { SignedUrlPipe } from '@app/shared/pipes/signed-url.pipe';
import { GuestJourneyComponent } from './components/guest-journey/guest-journey.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { HasAnyRoleDirective } from '@app/shared/directives/has-any-role.directive';
import { AbnormalComponent } from './components/abnormal/abnormal.component';
import { VisaExpiryComponent } from './components/visa-expiry/visa-expiry.component';
import { NgxPersianModule } from 'ngx-persian';


@NgModule({
  declarations: [
    GuestComponent,
    CreateGuestComponent,
    ListGuestComponent,
    ViewGuestComponent,
    EditGuestComponent,
    DeleteModalComponent,
    GuestHistoryComponent,
    BlackListComponent,
    CreateBlackListComponent,
    ReportModalComponent,
    GuestJourneyComponent,
    AbnormalComponent,
    VisaExpiryComponent
  ],
  imports: [
    CommonModule,
    NgxPersianModule,
    NgxDatatableModule,
    DropdownModule,
    FormsModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    GuestsRoutingModule,
    HasAnyRoleDirective,
    ModalModule.forChild(),
    UploadModule.forRoot(),
    NgSelectModule,
    CheckboxModule,
    SignedUrlPipe,
    PaginationModule.forRoot(),
    TranslateModule.forChild(),
    AlertModule.forRoot(),
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
    ToastrModule.forRoot(),

    NgBootstrapFormValidationModule.forRoot(),
    BsDatepickerModule.forRoot(),
  ],
  providers: [ToastrService, DatePipe]
})
export class GuestsModule { }
