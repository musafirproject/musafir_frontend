import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private checkAccess(allowedRoles: string[] = []): boolean | UrlTree {
    const isLoggedIn = this.authService.isLoggedInStatus();

    if (!isLoggedIn) {
      return this.router.createUrlTree(['/login']);
    }

    const userRole = this.authService.getUserRole();

    if (!allowedRoles.length) {
      return true;
    }

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    return this.router.createUrlTree(['/unauthorized']);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = route.data?.['roles'] || [];
    return this.checkAccess(allowedRoles);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = childRoute.data?.['roles'] || [];
    return this.checkAccess(allowedRoles);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = (route.data?.['roles'] as string[]) || [];
    return this.checkAccess(allowedRoles);
  }
}
