import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserListService } from '../../user-list/user-list.services';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth.service';
import { TranslateService } from '@ngx-translate/core';
import { delay } from 'rxjs';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { DeletemodelComponent } from '../../modals/deletemodel/deletemodel.component';
import { EditGuestUserComponent } from '../edit-guest-user/edit-guest-user.component';
import { PasswordResetModalComponent } from '../../modals/password-reset-modal/password-reset-modal.component';
import { ActivateComponent } from '../../modals/activate/activate.component';
import { DeactivateComponent } from '../../modals/deactivate/deactivate.component';

@Component({
  selector: 'app-guest-user',
  templateUrl: './guest-user.component.html',
  styleUrls: ['./guest-user.component.css']
})
export class GuestUserComponent implements OnInit {

  temp = [];
  selected = [];
  users = [];
  // public filterdUsers = [];
  columnMode: 'force' | 'standard' | 'flex' = 'force';
  headerHeight = 50;
  footerHeight = 180;
  rowHeight: 'auto' | number = 'auto';
  scrollbarH = false;
  scrollbarV = false;
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
  public isSmallScreen: boolean = false;

  // Pangination Attributes
  public totalCount = 0;
  public page: number
  public role;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  statuses = [
    { value: true, label: 'Active ', ps: "فعال", dr: "فعال", en: 'Active' },
    { value: false, label: 'In Active', ps: "غیر فعال", dr: "غیر فعال", en: 'In Active' }
  ]

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
    this.initializeSearch()
    this.getAuthUser();
    this.fetch();
    this.loadPaginatedData();
    this.applyResponsiveTable(window.innerWidth);
    this.cdr.markForCheck();
    this.cdr.detectChanges();

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
      occupation: [''],
      is_active: [''],
      can_see: [''],
      role_id: []
    })
  }




  private applyResponsiveTable(width: number) {
    const isSmall = width < 992; // pick your breakpoint (e.g. 768 or 992)

    if (isSmall) {
      // Mobile / small screens: allow both scrollbars
      this.scrollbarH = true;
      this.scrollbarV = true;
      this.rowHeight = 56;        // numeric required when scrollbarV = true
      this.columnMode = 'standard'; // avoids forced shrink on tiny widths
      this.footerHeight = 56;     // optional: smaller footer on mobile
    } else {
      // Desktop / laptop: your original behavior
      this.scrollbarH = false;
      this.scrollbarV = false;
      this.rowHeight = 'auto';
      this.columnMode = 'force';
      this.footerHeight = 180;
    }
  }

  public getAuthUser() {
    this.authService.getCurrentUser()
      .subscribe({
        next: (user: any) => {
          this.role = user?.authenticatedUser?.role?.code


        }
      })
  }



  fetch() {
    this.tableSvc.getGuestUsersList()
      .subscribe({
        next: (response: any) => {

          this.users = response?.users?.results;

          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      })
  }


  getScreenWidth(size: number) {
    this.screenSizeSvc.onResize(size)
  }
  public createUser() {

    this.router.navigate(['/pages/create-guestuser']);
  }

 

  public assignHotels(userId: string) {
    this.router.navigate([`/pages/${userId}/assign-hotels`]);

  }

  public editUser(id: number) {
    this.bsModalRef = this.modalService.show(EditGuestUserComponent, { backdrop: 'static', keyboard: false, class: 'modal-lg', initialState: { userId: id } });
    // Subscribe to the onHide event to get the result from the modal
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'success') {
        this.ngOnInit();
      } else {
        return;
      }
    });
  }



  openPasswordReset(id: number) {
    this.bsModalRef = this.modalService.show(PasswordResetModalComponent);
    // Subscribe to the onHide event to get the result from the modal
    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.resetPassword(id); // Perform the delete operation


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


  openModal(id: number) {
    this.bsModalRef = this.modalService.show(DeletemodelComponent);
    // Subscribe to the onHide event to get the result from the modal
    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.deleteUser(id); // Perform the delete operation
      }
    });
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
    this.tableSvc.sharedLoadData(
      this.tableSvc.getGuestUserListPaginated(this.currentPage, this.pageSize),
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
  public advanceSearch() {
    const formValues = this.searchForm.value;

    // ✅ Check if every value is null, empty string, or undefined
    const isEmpty = Object.values(formValues).every(
      v => v === null || v === '' || v === undefined
    );

    if (isEmpty) {
      this.showPagination = true
      this.ngOnInit();
    } else {
      let payload = {
        ...this.searchForm.value,
        "user_type": 'guest_user'
      }
      this.tableSvc.advanceSearchGuestUser(payload)
        .subscribe({
          next: (response: any) => {
            const userData = response?.users?.results;
            if (userData.length == 0) {

              this.translate.get('TR.search_notify').subscribe((message: string) => {
                this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                  this.toastr.warning(message, title);
                });
              });
              this.users = [];
              this.cdr.detectChanges();
            }

            this.users = userData;


            this.showPagination = false;
            this.cdr.detectChanges()


          }
        })
    }
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

  public activateUser(id: number) {
    this.tableSvc.updateUser(id, { is_active: true })
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toastr.success(message, title);
                this.ngOnInit()
              });
            });
          } else {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
          }
        }
      })
  }
  public deactivateUser(userId: number) {
    this.tableSvc.updateUser(userId, { is_active: false })
      .subscribe({
        next: (data: any) => {
          if (data) {
            let index = this.users.findIndex(user => user?.id == userId);
            if (index !== -1) {
              this.users[index] = data?.user;
              this.users = [...this.users];
            }
            this.toastr.success('User deactivated successfully!', "User Deactivated")
          }
        }
      })
  }

  public reset() {
    this.searchForm.reset();
    this.cdr.detectChanges();
  }
}
