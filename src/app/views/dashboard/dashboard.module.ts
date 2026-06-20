import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { DashboardRoutingModule } from './dashboard-routing.module'
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { NgApexchartsModule } from "ng-apexcharts";
import { AvatarModule } from '@app/shared/components/avatar/avatar.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DashboardComponent } from './dashboard.component';
import { RegionDataComponent } from './components/region-data/region-data.component';
import { DashboardService } from './dashboard.service';
import {  TranslateModule } from '@ngx-translate/core';
import { HasAnyRoleDirective } from '@app/shared/directives/has-any-role.directive';


@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule,
        NgApexchartsModule,
        ProgressbarModule,
        AvatarModule,
        PerfectScrollbarModule,
        HasAnyRoleDirective,
        TranslateModule.forChild()

    ],
    exports: [],
    declarations: [
        DashboardComponent,
        RegionDataComponent,
    ],
    providers: [
        DashboardService
    ],
})
export class DashboardModule { }
