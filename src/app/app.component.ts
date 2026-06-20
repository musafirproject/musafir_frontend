import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Select } from '@ngxs/store';
import { AppConfig } from '@app/shared/types/app-config.interface';
import { Observable, Subscription } from 'rxjs';
import { en_US } from './i18n/en/index'
import { fr_FR } from './i18n/fr/index'
import { ps_AF } from './i18n/ps/index'
import { dr_AF } from './i18n/dr/index';
import { Directionality } from '@angular/cdk/bidi';

const storageKey = 'lang'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
    @Select((state: { app: AppConfig; }) => state.app) app$: Observable<AppConfig>;
    private langChangeSubscription!: Subscription;
    currentLang: string;
    currentDirection: 'ltr' | 'rtl' = 'ltr'; 
    public notificationList: any[] = [];

    constructor(private translateService: TranslateService,private directionality: Directionality) {
        translateService.setTranslation('en_US', en_US);
        translateService.setTranslation('fr_FR', fr_FR);
        translateService.setTranslation('ps_AF', ps_AF);
        translateService.setTranslation('dr_AF', dr_AF);
    }

    ngOnInit() {
        this.app$.subscribe(app => {
            this.currentLang = localStorage.getItem(storageKey) || app.lang || this.translateService.getBrowserCultureLang();
            this.translateService.use(this.currentLang);
            
              
                document.documentElement.setAttribute('dir', this.currentDirection);
                this.directionality.change.emit(this.currentDirection); // Emit direction change
              
            
        });
        this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => { 
            localStorage.setItem(storageKey, event.lang); 
        });


    
    }

    ngOnDestroy() {
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }

}
