import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';




@NgModule({

    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        TranslateModule
    ],
    imports: [
    ],
    declarations: [


  
    UnauthorizedComponent
  ],

})

export class SharedModule { }
