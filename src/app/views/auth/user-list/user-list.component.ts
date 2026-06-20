import { Component, OnInit, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UserListService } from './user-list.services'
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { delay } from 'rxjs/operators';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeletemodelComponent } from '../modals/deletemodel/deletemodel.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';
import { TranslateService } from '@ngx-translate/core';
import { AssignZoneModalComponent } from '@app/views/settings/zones/modals/assign-zone-modal/assign-zone-modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordResetModalComponent } from '../modals/password-reset-modal/password-reset-modal.component';
import { DeactivateComponent } from '../modals/deactivate/deactivate.component';
import { ActivateComponent } from '../modals/activate/activate.component';


@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],

  providers: [
    UserListService,
    ScreenSizeService
  ],
})
export class UserListComponent implements OnInit {
  temp = [];
  selected = [];
  users = [];
  public filterdUsers = [];
  columnMode: ColumnMode = ColumnMode.force;
  SelectionType = SelectionType;
  rowHeight: 'auto' | number = 'auto'
  scrollbarH: boolean = false
  public bsModalRef: BsModalRef;
  value = false;
  public loadingIndicator = true;
  showSearchFields: boolean = false;
  public searchForm: FormGroup;
  public searchTerm: string = '';
  public totalItems: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public totalPages: number = 0;
  public pages: number[] = [];
  public showPrevious: boolean = true;
  public showNext: string | boolean = true;
  public showPagination: boolean = true;
  public pageSizeOptions: number[] = [10, 20, 30, 50, 100];
  public isAdvancedSearch = false;
  public isSmallScreen: boolean = false;

  statuses = [
    { value: true, label: 'Active ', ps: "فعال", dr: "فعال", en: 'Active' },
    { value: false, label: 'In Active', ps: "غیر فعال", dr: "غیر فعال", en: 'In Active' }
  ]

  // Pangination Attributes
  public totalCount = 0;
  public page: number
  public role;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  constructor(
    private tableSvc: UserListService,
    private cdr: ChangeDetectorRef,
    private screenSizeSvc: ScreenSizeService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private authService: AuthService,
    private translate: TranslateService,
    private fb: FormBuilder


  ) {
    this.screenSizeSvc.onResize$.pipe(delay(0)).subscribe(sizes => {
      const sizeTabletAbove = sizes.includes(SCREEN_SIZE.XXL) || sizes.includes(SCREEN_SIZE.XL) || sizes.includes(SCREEN_SIZE.LG)
      if (sizeTabletAbove) {
        this.rowHeight = 'auto'
        this.scrollbarH = false
        this.columnMode = ColumnMode.force;
      } else {
        this.rowHeight = 68
        this.scrollbarH = true
        this.columnMode = ColumnMode.force;
      }
      this.cdr.markForCheck()
    });
  }

  @HostListener('window:resize', ['$event']) windowResize(event) {
    this.getScreenWidth(event.target.innerWidth)
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.route.queryParams.subscribe({
      next: (response: any) => {
        // Check if the response object contains the 'page' property
        if (response && response.page) {
          this.currentPage = Number(response.page)
          this.pageSize = Number(response.size)// Assign the 'page' to currentPage
        } else {
          this.fetch();
        }
       
      },
    });
    this.initializeSearch()
    this.getAuthUser();
    this.fetch();
    this.loadPaginatedData();

    this.cdr.markForCheck();
    this.cdr.detectChanges();

  }

      @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 768; // small screen breakpoint
    }
  }
  initializeSearch() {
    this.searchForm = this.fb.group({
      first_name: [''],
      last_name: [''],

      father_name: [''],
      grand_father_name: [''],
      tazkira: ['', [Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      phone: [''],
      email: [''],
      is_active: [null]
    })
  }

  public getAuthUser() {
    this.authService.getCurrentUser()
      .subscribe({
        next: (user: any) => {
          this.role = user?.authenticatedUser?.role?.code
        }
      })
  }

  public assignzone(row) {
    this.bsModalRef = this.modalService.show(AssignZoneModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        data: row
      }
    });


  }

  fetch() {
    this.tableSvc.getUsersList()
      .subscribe({
        next: (response: any) => {
          this.users = response.users?.results;
          this.cdr.markForCheck();
        }
      })
  }


  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) { return }

  getScreenWidth(size: number) {
    this.screenSizeSvc.onResize(size)
  }
  public createUser() {

    this.router.navigate(['create'], { relativeTo: this.route });
  }

  public editUser(id: number) {

    this.router.navigate([`pages/users/${id}/edit`], { queryParams: { page: this.currentPage, size: this.pageSize } })
  }

  public viewUser(id: number) {
    this.router.navigate([`pages/users/${id}/view`], { queryParams: { page: this.currentPage, size: this.pageSize } })
  }


  openModal(id: number) {
    this.bsModalRef = this.modalService.show(DeletemodelComponent);

    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.deleteUser(id);

      }
    });
  }

  public userStatus(id: number, status: string) {
    if(status === 'activate') {
      this.bsModalRef = this.modalService.show(ActivateComponent);
      this.bsModalRef.onHide.subscribe(() => {
        const modalContent = this.bsModalRef?.content;
        if (modalContent && modalContent.result === 'yes') {
          this.activateUser(id);
        }
      });
    }else if(status === 'deactivate') {
      this.bsModalRef = this.modalService.show(DeactivateComponent);
      this.bsModalRef.onHide.subscribe(() => {
        const modalContent = this.bsModalRef?.content;
        if (modalContent && modalContent.result === 'yes') {
          this.deactivateUser(id);
        }
      });
    }
  }

  openPasswordReset(id: number) {
    this.bsModalRef = this.modalService.show(PasswordResetModalComponent);
    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.resetPassword(id);


      }
    });
  }

  public resetPassword(id: number) {
    this.tableSvc.resetPassword(id)
      .subscribe({
        next: (response: any) => {
          if (response.detail == 'User not found.') {
            this.translate.get('TR.no_user').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
          } else {
            this.translate.get('TR.password_reset').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toastr.success(message, title);
              });
            });
          }
        }
      })
  }

  public deleteUser(id: number) {
    this.tableSvc.deleteUser(id)
      .subscribe({
        next: (userdelete: any) => {
          if (userdelete) {

            this.translate.get('TR.delete_msg').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toastr.success(message, title);
              });
            });
            if (userdelete) {
              this.users = this.users.filter(user => user.id !== id);
              this.cdr.detectChanges()
            }

          }
        }
      })

  }
  public loadPaginatedData() {

    if (this.isAdvancedSearch) {
      let payload = {
        ...this.searchForm.value,
        'user_type': 'normal'
      }
      this.tableSvc.advanceSearch(payload, this.currentPage, this.pageSize)
        .subscribe({
          next: (response: any) => {
            this.users = response?.users?.results;
            this.totalItems = response?.users?.count;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            this.showPagination = true;
            this.cdr.detectChanges()
          }
        })

    } else {
      this.tableSvc.sharedLoadData(
        this.tableSvc.getUserListPaginated(this.currentPage, this.pageSize),
        this.totalItems,
        this.totalPages,
        this.pageSize,
        this.loadingIndicator,
        this.showNext,
        (result: any) => {
          this.users = result?.list;
          this.totalItems = result?.total_items;
          this.loadingIndicator = result?.loadingIndicator;
          this.totalPages = result?.total_pages;
          this.cdr.detectChanges();
        }
      );

    }


  }

  public setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPaginatedData();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    }
  }

  public getPaginationArray() {
    return this.tableSvc.getPaginationArray(this.totalPages, this.currentPage);
  }

  public firstPage() {
    this.setPage(1);
  }
  public lastPage() {
    this.setPage(this.totalPages);
  }
  public previous() {
    if (this.currentPage > 1) {
      this.setPage(this.currentPage - 1);
      this.loadPaginatedData();
    }
  }

  public next() {
    if (this.currentPage < this.totalPages) {
      this.setPage(this.currentPage + 1);
      this.loadPaginatedData();
    }
  }

  public itemsPerPage(event: any) {
    const pageSize = parseInt(event.target.value, 10);
    if (!isNaN(pageSize) && pageSize > 0) {
      this.pageSize = pageSize;
      this.currentPage = 1; // reset to first page
      this.loadPaginatedData();
      this.cdr.detectChanges();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    }
  }


  public search() {
    this.loadingIndicator = true;
    this.users = [];
    if (!this.searchTerm) {
      this.showPagination = true;
      this.currentPage = 1;
      this.loadOriginalData();
    } else {
      this.showPagination = false;
      this.fetchSearchResults(this.searchTerm, 10);
    }
    this.searchTerm = '';
  }
  private loadOriginalData() {
    this.tableSvc.OriginalData(
      this.tableSvc.search('', this.currentPage, this.pageSize),
      this.totalItems,
      this.totalPages,
      this.pageSize,
      this.loadingIndicator,
      this.pages,
      (result: any) => {
        this.users = result?.list;
        this.totalItems = result?.total_items;
        this.totalPages = result?.total_pages;
        this.loadingIndicator = result?.loadingIndicator;
        this.pages = result?.allPages;
        this.cdr.detectChanges();

      }
    );
  }
  private fetchSearchResults(searchTerm, pageSize: number) {
    const page = 1;
    this.tableSvc.SearchResults(
      this.tableSvc.search(searchTerm, page, pageSize),
      this.searchTerm,
      this.totalItems,
      this.pageSize,
      this.loadingIndicator,
      (result: any) => {
        this.users = result?.list;
        this.totalItems = result?.total_items;
        this.loadingIndicator = result?.loadingIndicator;
        this.cdr.detectChanges();
      }
    )
  }


  toggleSearchFields() {
    this.showSearchFields = !this.showSearchFields;
    this.fetch();
  }

  public advanceSearch() {
    this.isAdvancedSearch = true;
    this.currentPage = 1;
      let payload = {
        ...this.searchForm.value,
        'user_type': 'normal'
      }
    this.tableSvc.advanceSearch(payload, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: any) => {
          if (response?.users?.count == 0) {

            this.translate.get('TR.search_notify').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
            this.users = [];
            this.showPagination = false;
            this.cdr.detectChanges();
            return
          }

          this.users = response?.users?.results;
          this.totalItems = response?.users?.count;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.showPagination = true;
          this.cdr.detectChanges()
        }
      })

  }

  public deactivateUser(userId: number) {
    this.tableSvc.updateUser(userId, {is_active: false})
      .subscribe({
        next: (data:any) => {
          if(data) {
            let index = this.users.findIndex(user => user?.id == userId);
            if(index !== -1) {
              this.users[index] = data?.user;
              this.users = [...this.users];
            }
            this.toastr.success('User deactivated successfully!', "User Deactivated")
          }
        }
      })
  }
  public activateUser(userId: number) {
    this.tableSvc.updateUser(userId, {is_active: true})
      .subscribe({
        next: (data: any) => {
          if(data) {
            this.toastr.success('User activated successfully!', "User Activated")
            let index = this.users.findIndex(user => user?.id == userId);
            if(index !== -1) {
              this.users[index] = data?.user;
              this.users = [...this.users];
            }
          }
        }
      })
  }
  public reset() {
    this.searchForm.reset();
    this.fetch();
    this.cdr.detectChanges();
  }

}
