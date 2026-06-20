import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/views/auth/auth.service';

@Component({
    selector: 'nav-profile',
    templateUrl: './nav-profile.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.header-nav-item]': 'true'
    }
})
export class NavProfileComponent implements OnInit {

    public currentUser: any=[];
    constructor(
        private authService: AuthService, 
        private cdr: ChangeDetectorRef,
        private router: Router) { }

    profileMenuList = [
        {
            path: '',
            icon: 'feather icon-user',
            item: 'Profile'
        },
     
        {
            path: '',
            icon: 'feather icon-power',
            item: 'Signout'
        }
    ]

    ngOnInit(): void {

        this.authService.getCurrentUser()
        .subscribe({
            next: (user: any) =>{
                this.currentUser = user?.authenticatedUser
                this.cdr.detectChanges()

            }
        })
     }

    public profileMenu(item: any) {

        if(item==='Signout'){
            this.authService.logout()
        }else if(item==='Profile'){
            this.router.navigate(['/pages/profile'])
        }else if(item==='Settings'){
            this.router.navigate(['/settings/list'])
        }
        
    }
}
