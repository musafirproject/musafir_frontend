import { 
    Component, 
    ChangeDetectionStrategy,
    ViewEncapsulation, 
    OnInit,
    EventEmitter,
    Output,
    ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { NavMenu } from '@app/shared/types/nav-menu.interface';
import { navConfiguration } from '@app/configs/nav.config'
import { AuthService } from '@app/views/auth/auth.service';

@Component({
    selector: 'vertical-menu-content',
    templateUrl: 'vertical-menu-content.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class VerticalMenuContentComponent implements OnInit {
    public role; 
    menu : NavMenu[]=[]
    @Output() onNavLinkClick= new EventEmitter();

    constructor(
        private router: Router, 
        private service: AuthService, 
        private cdr: ChangeDetectorRef
    ) { 
    }

    ngOnInit(): void {
        this.service.getCurrentUser().subscribe({
            next: (user: any) => {
                this.role = user?.authenticatedUser?.role?.code;
                const filteredMenu = this.filterMenuByRole(navConfiguration, this.role);
                this.menu = filteredMenu;
                this.cdr.detectChanges();
            }
        });
    
    
    }

    filterMenuByRole(menu: NavMenu[], authUserRole: string): NavMenu[] {
        const filterSubmenu = (submenu: any[]): any[] => {
            return submenu
                .map(item => {
                    const newItem = { ...item };
    
                    if (newItem.submenu && newItem.submenu.length > 0) {
                        newItem.submenu = filterSubmenu(newItem.submenu);
                    }
    
                    const isAllowed = newItem.role.length === 0 || newItem.role.includes(authUserRole);
    
                    if (isAllowed || (newItem.submenu && newItem.submenu.length > 0)) {
                        return newItem;
                    }
    
                    return null;
                })
                .filter(Boolean); 
        };
    
        return menu
            .map(item => {
                const newItem = { ...item };
    
                if (newItem.submenu && newItem.submenu.length > 0) {
                    newItem.submenu = filterSubmenu(newItem.submenu);
                }
    
                const isAllowed = newItem.role.length === 0 || newItem.role.includes(authUserRole);
    
                if (isAllowed || (newItem.submenu && newItem.submenu.length > 0)) {
                    return newItem;
                }
    
                return null; 
            })
            .filter(Boolean); 
    }
    
    onLinkClick (path: string) {
        this.onNavLinkClick.emit(path)
    }

    isSubNavOpen(key: string) {
        const currentRouteTree = this.getRouteTreeInfo(this.menu)
        return this.isExisted(currentRouteTree, key)
    }

    isExisted(navTree, key: string) {

        if(!navTree) {
            return navTree
        }

        if( navTree.key === key ){
            return true;
        }
        let treeNode; 
        for (let p in navTree) {
            if( navTree.hasOwnProperty(p) && typeof navTree[p] === 'object' ) {
                treeNode = this.isExisted(navTree[p], key);
                if(treeNode){
                    return treeNode;
                }
            }
        }
        return treeNode;
    }
    
    getRouteTreeInfo(nodes: NavMenu[]) {
        let result: NavMenu;
        let found: boolean
        nodes.some((o: NavMenu) => {
            let submenu: NavMenu;
            if (o.path === this.router.url) {
                found = true
                return result = o;
            }
            if (o.submenu && (submenu = this.getRouteTreeInfo(o.submenu))) {
                return result = Object.assign({}, o, { submenu });
            }
        });

        return result;
    }
}