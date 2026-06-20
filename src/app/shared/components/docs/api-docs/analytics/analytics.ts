/**
 * @author ng-team
 * @copyright ng-bootstrap
 */
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';


declare const ga: any;


@Injectable()
export class Analytics {
  private enabled: boolean;
  private location: Location;
  private router: Router;

  constructor(location: Location, router: Router) {
    this.location = location;
    this.router = router;
    this.enabled = typeof window != 'undefined' && window.location.href.indexOf('bootstrap') >= 0;
  }


  trackPageViews(): void {
    if (!this.enabled) {
      return;
    }
    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
      if (typeof ga !== 'undefined') {
        ga('send', { hitType: 'pageview', page: this.location.path() });
      }
    });
  }

 
  trackEvent(action: string, category: string): void {
    if (!this.enabled) {
      return;
    }
    if (typeof ga !== 'undefined') {
      ga('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action
      });
    }
  }
}
