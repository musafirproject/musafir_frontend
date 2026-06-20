import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { ListhotelComponent, } from './hotel/components/list-hotel/list-hotel.component';
import { CreateHotelComponent } from './hotel/components/create-hotel/create-hotel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from '@app/shared/components/dropdown/dropdown.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UploadModule } from '@app/shared/components/upload/upload.module';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { NgSelectModule } from '@ng-select/ng-select';
import { ListSettingsComponent } from './list-settings/list-settings.component';
import { EditHotelComponent } from './hotel/components/edit-hotel/edit-hotel.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ListZonesComponent } from './zones/components/list-zones/list-zones.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxEditorModule } from 'ngx-editor';
import { ViewHotelComponent } from './hotel/components/view-hotle/view-hotel.component';
import { TranslateModule } from '@ngx-translate/core';
import { CreateZoneComponent } from './zones/components/create-zone/create-zone.component';
import { ViewZoneComponent } from './zones/components/view-zone/view-zone.component';
import { EditZoneComponent } from './zones/components/edit-zone/edit-zone.component';
import { ListDistrictComponent } from './districts/components/list-district/list-district.component';
import { AssignZoneModalComponent } from './zones/modals/assign-zone-modal/assign-zone-modal.component';
import { SharedModule } from '@app/shared/shared.module';
import { SignedUrlPipe } from '@app/shared/pipes/signed-url.pipe';
import { ResidencePerformanceComponent } from './hotel/components/residence-performance/residence-performance.component';
import { HasAnyRoleDirective } from '@app/shared/directives/has-any-role.directive';


@NgModule({
  declarations: [
    SettingsComponent,
    CreateHotelComponent,
    ListhotelComponent,
    ViewHotelComponent,
    ListSettingsComponent,
    EditHotelComponent,
    ListZonesComponent,
    CreateZoneComponent,
    ViewZoneComponent,
    EditZoneComponent,
    ListDistrictComponent,
    AssignZoneModalComponent,
    ResidencePerformanceComponent,
    ],
  imports: [
    CommonModule,
    FormsModule,
    NgxDatatableModule,
    DropdownModule,
    PaginationModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    NgSelectModule,
    SharedModule,
    SignedUrlPipe,
    ModalModule.forChild(),
    TranslateModule.forChild(),
    UploadModule.forRoot(),
    ToastrModule.forRoot(),
    TranslateModule.forChild(),
            HasAnyRoleDirective,

    PaginationModule.forRoot(),
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
    NgSelectModule,
    NgBootstrapFormValidationModule.forRoot()
  ],
  exports:[],
  providers:[ToastrService],


})
export class SettingsModule { }
