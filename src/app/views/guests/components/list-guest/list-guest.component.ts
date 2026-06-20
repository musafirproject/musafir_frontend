import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { delay, map } from 'rxjs/operators';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { GuestService } from '../../services/guest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeletemodelComponent } from '@app/views/auth/modals/deletemodel/deletemodel.component';
import { ToastrService } from 'ngx-toastr';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportModalComponent } from '../../modals/report-modal/report-modal.component';
import { ReportService } from '@app/views/reports/service/report.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-list-guest',
  templateUrl: './list-guest.component.html',
  styleUrls: ['./list-guest.component.css']
})
export class ListGuestComponent implements OnInit {

  temp = [];
  selected = [];
  guests: any[] = []
  filteredGuests: any[] = []; // Guests displayed after applying filters
  checkoutFilter: string = 'all';
  columnMode: ColumnMode = ColumnMode.force;
  SelectionType = SelectionType;
  rowHeight: 'auto' | number = 'auto'
  scrollbarH: boolean = false
  showSearchFields: boolean = false;
  public bsModalRef: BsModalRef;
  public searchForm: FormGroup;
  public isAdvancedSearch = false;
  isNidEnabled: boolean = true;
  public isSmallScreen = false;

  // Pangination Attributes


  public loadingIndicator = true;
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
  public role;
  public searchFilters;
  public countries;
  public cities;
  public hotels;
  public residenceMode = false;
  public residenceHotelId: number | null = null;
  public defaultPageSize: number = 10;
  public period: 'all' | '24h' | '7d' | 'month' | 'year' = 'all';

  genders = [
    { value: 'MALE', label: 'Male', ps: "نارینه", dr: "مرد" },
    { value: 'FEMALE', label: 'Female', ps: "ښځینه", dr: "زن" }
  ]


  guestTypes = [
    { value: 'NATIONAL', label: 'National', ps: "کورنی", dr: "داخلی" },
    { value: 'FOREIGN', label: 'FOREIGN', ps: "بهرنی", dr: "خارجې" }
  ]
  options = [
    { value: 'yes', label: 'Yes', ps: "هو", dr: "بلی" },
    { value: 'no', label: 'No', ps: "نه", dr: "نه خیر" }
  ]

  public currentLang;



  @ViewChild(DatatableComponent) table: DatatableComponent;
  constructor(
    private router: Router,
    private service: GuestService,
    private cdr: ChangeDetectorRef,
    private bsModalService: BsModalService,
    private toastr: ToastrService,
    private userService: UserListService,
    private screenSizeSvc: ScreenSizeService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private reportService: ReportService,
    private route: ActivatedRoute,

    private authService: AuthService) {
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
    combineLatest([this.route.paramMap, this.route.queryParams])
      .pipe(map(([params, qp]) => {
        // param first, otherwise qp
        const hidParam = params.get('hotel_id');
        const hidQuery = qp['hotel_id'];
        this.residenceHotelId = hidParam ? Number(hidParam) : (hidQuery ? Number(hidQuery) : null);
        this.residenceMode = !!this.residenceHotelId;

        this.currentPage = qp['page'] ? Number(qp['page']) : 1;
        this.pageSize = qp['size'] ? Number(qp['size']) : this.defaultPageSize;

        this.period = this.residenceMode ? ((qp['period'] as any) || 'all') : 'all';
      }))
      .subscribe(() => this.fetch());


    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });

    this.getCities();
    this.getCountries();
    this.getHotels();
    this.cdr.detectChanges();
    this.loadPaginatedData();
    this.getAuthUser();
    this.initializeSearch();
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
  public getCities() {
    this.userService.getCities()
      .subscribe({
        next: (cities: any) => {
          this.cities = cities?.cities;
        }
      })
  }
  public getCountries() {
    this.userService.getCountries()
      .subscribe({
        next: (countries: any) => {
          this.countries = countries?.countries;
        }
      })
  }

  public getHotels() {
    this.userService.getHotels()
      .subscribe({
        next: (hotels: any) => {
          this.hotels = hotels?.hotels

        }
      })
  }

  initializeSearch() {
    this.searchForm = this.fb.group({
      first_name: [''],
      last_name: [''],

      father_name: [''],
      grand_father_name: [''],
      tazkira: ['', [Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      phone: [''],
      gender: [''],
      guest_type: [''],
      date_of_entry: [''],
      date_of_exit: [''],
      passport_number: [''],
      passport_issue_country: [''],
      visa_number: [''],
      visa_issue_country: [''],
      current_city: [''],
      permanent_city: [''],
      hotel: [''],
      expired_passport: [''],
      expired_visa: [''],
      checked_out_value: [''],
      is_blacklist: ['']
    })
  }

  public getAuthUser() {
    this.authService.getCurrentUser()
      .subscribe({
        next: (user: any) => {
          this.role = user?.authenticatedUser?.role?.code;
          this.cdr.detectChanges();

        }
      })
  }


  private fetch() {
    const params: any = {};
    if (this.residenceMode) params.period = this.period;

    const req$ = this.residenceMode && this.residenceHotelId
      ? this.service.getGuestByResidenceAndPeriod(this.residenceHotelId, params)
      : this.service.getGuests();

    req$.subscribe((guests: any) => {
      this.guests = guests?.guests?.results;
      this.filteredGuests = guests?.guests?.results;
    });
  }




  applyCheckoutFilter(): void {
    if (this.checkoutFilter === 'all') {
      this.guests = [...this.filteredGuests];
    } else if (this.checkoutFilter === 'checkedOut') {
      this.guests = this.filteredGuests.filter(guest => guest.date_of_exit !== null);
    } else if (this.checkoutFilter === 'notCheckedOut') {
      this.guests = this.filteredGuests.filter(guest => guest.date_of_exit === null);
    }
  }
  getScreenWidth(size: number) {
    this.screenSizeSvc.onResize(size)
  }
  public viewGuest(id: number) {
    this.router.navigate([`guests/${id}/view`], { queryParams: { page: this.currentPage, size: this.pageSize } });
  }
  public editGuest(id: number) {
    this.router.navigate([`guests/${id}/edit`], { queryParams: { page: this.currentPage, size: this.pageSize } });
  }
  public create() {
    this.router.navigate([`guests/create`])
  }
  public guestHistory(tazkira: string, phone: string, id: string): void {
    this.router.navigate(['guests/history'], {
      queryParams: { tazkira, phone, id, page: this.currentPage, size: this.pageSize }
    });
  }


  onTazkiraInput(e: Event) {
    const input = e.target as HTMLInputElement;

    // keep only digits, cap at 13
    const digits = input.value.replace(/\D/g, '').slice(0, 13);

    // split 4-4-5
    const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 13)].filter(Boolean);
    const formatted = parts.join('-');

    // update control without re-triggering this handler
    this.searchForm.get('tazkira')!.setValue(formatted, { emitEvent: false });
  }

  prefillAfCode() {
    const ctrl = this.searchForm.get('phone')!;
    const v = (ctrl.value ?? '').toString();
    if (!v.trim()) {
      ctrl.setValue('+93 ', { emitEvent: false });
    }
  }

  onPhoneInput(e: Event) {
    const ctrl = this.searchForm.get('phone')!;
    const raw = (e.target as HTMLInputElement).value;

    // Keep only digits, but remember if user already typed +93 somewhere
    const digits = raw.replace(/\D/g, '');

    // Normalize to +93 and a 9-digit local mobile (Afghanistan: 7xx xx xxxx)
    // Accept inputs starting with 93, or with leading 0, or just local digits.
    let local = '';
    if (digits.startsWith('93')) {
      local = digits.slice(2);
    } else if (digits.startsWith('0')) {
      local = digits.slice(1);
    } else {
      local = digits;
    }
    // Cap to 9 local digits (7xx xx xxxx)
    local = local.slice(0, 9);

    // Build "+93 700 00 0000" => "+93 " + 3-2-4 grouping
    const p1 = local.slice(0, 3);        // 700
    const p2 = local.slice(3, 5);        // 00
    const p3 = local.slice(5, 9);        // 0000

    const formatted =
      '+93' +
      (p1 ? ' ' + p1 : '') +
      (p2 ? ' ' + p2 : '') +
      (p3 ? ' ' + p3 : '');

    // Update control without re-triggering this handler
    ctrl.setValue(formatted, { emitEvent: false });
  }


  openModal(id: number) {
    this.bsModalRef = this.bsModalService.show(DeletemodelComponent);
    // Subscribe to the onHide event to get the result from the modal
    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.deleteGuest(id);
      }
    });
  }

  public deleteGuest(id: number) {
    this.service.deleteGuest(id)
      .subscribe({
        next: (guestDelete: any) => {


          this.translate.get('TR.delete_msg').subscribe((message: string) => {
            this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
              this.toastr.success(message, title);
            });
          });

          this.guests = this.guests.filter(guest => guest.id !== id);
          this.filteredGuests = this.guests.filter(guest => guest.id !== id)

          this.cdr.detectChanges()
        }
      })
  }

  public checkout(id: number) {
  const today = new Date().toISOString();

  this.service.updateGuest(id, { date_of_exit: today }).subscribe({
    next: (update: any) => {
      if (update) {
        const index = this.guests.findIndex(guest => guest.id === id);
        if (index !== -1) {
          this.guests[index].date_of_exit = today;
        }

        this.translate.get('TR.check_out').subscribe((message: string) => {
          this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
            this.toastr.success(message, title);
          });
        });
        this.cdr.detectChanges();
      }
    },
    error: () => {
      this.translate.get('TR.server_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    },
  });
}





  public loadPaginatedData() {
    // Residence mode + advanced search
    if (this.residenceMode && this.residenceHotelId && this.isAdvancedSearch) {
      const params: any = {
        page: this.currentPage,
        page_size: this.pageSize,
        period: this.period,
        ...this.searchForm.value
      };
      this.loadingIndicator = true;
      this.service.getGuestByResidenceAndPeriod(this.residenceHotelId, params)
        .subscribe((res: any) => {
          const g = res?.guests || {};
          this.guests = g.results || [];
          this.filteredGuests = this.guests;
          this.totalItems = g.count || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.showNext = this.currentPage < this.totalPages;
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        }, _ => {
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        });
      return;
    }

    // Global advanced search
    if (this.isAdvancedSearch) {
      this.service.advanceSearch(this.searchForm.value, this.currentPage, this.pageSize)
        .subscribe((response: any) => {
          this.guests = response?.results || [];
          this.filteredGuests = this.guests;
          this.totalItems = response?.count || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.showNext = this.currentPage < this.totalPages;
          this.cdr.markForCheck();
        });
      return;
    }

    // Default list (original)
    this.loadOriginalData();
  }

 public setPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.loadPaginatedData();                 // single source of truth
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

  public getPaginationArray() {
    return this.service.getPaginationArray(this.totalPages, this.currentPage);
  }

  public firstPage() {
    this.setPage(1);
  }
  public lastPage() {
    this.setPage(this.totalPages);
  }
public previous() {
  if (this.currentPage > 1) {
    this.setPage(this.currentPage - 1);       // don’t call loadPaginatedData here
  }
}

public next() {
  if (this.currentPage < this.totalPages) {
    this.setPage(this.currentPage + 1);       // don’t call loadPaginatedData here
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
  const q = (this.searchTerm || '').trim();
  if (!q) {
    this.showPagination = true;
    this.currentPage = 1;
    this.isAdvancedSearch = false;  // ensure off
    this.loadOriginalData();        // back to default list
    return;
  }

  // lightweight one-off search; don’t mutate global paging permanently
  this.showPagination = false;
  this.loadingIndicator = true;

  this.service.SearchResults(
    this.service.search(q, 1, 10), // single page of quick results
    q,
    this.totalItems,
    this.pageSize,
    this.loadingIndicator,
    (result: any) => {
      this.guests = result?.list || [];
      this.filteredGuests = this.guests;
      this.totalItems = result?.total_items || 0;
      this.loadingIndicator = !!result?.loadingIndicator;
      this.cdr.markForCheck();
    }
  );

  this.searchTerm = '';
}


  /** Loads the original paginated list (no advanced filters, no free-text search) */
  private loadOriginalData(): void {
    const params: any = { page: this.currentPage, page_size: this.pageSize };

    if (this.residenceMode && this.residenceHotelId) {
      params.period = this.period;
      this.loadingIndicator = true;
      this.service.getGuestByResidenceAndPeriod(this.residenceHotelId, params)
        .subscribe((res: any) => {
          const g = res?.guests || {};
          this.guests = g.results || [];
          this.filteredGuests = this.guests;
          this.totalItems = g.count || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.showNext = this.currentPage < this.totalPages;
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        }, _ => {
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        });
    } else {
      this.loadingIndicator = true;
      this.service.sharedLoadData(
        this.service.getGuestListPaginated(this.currentPage, this.pageSize),
        this.totalItems,
        this.totalPages,
        this.pageSize,
        this.loadingIndicator,
        this.showNext,
        (result: any) => {
          this.guests = result?.list || [];
          this.filteredGuests = this.guests;
          this.totalItems = result?.total_items || 0;
          this.totalPages = result?.total_pages || Math.ceil(this.totalItems / this.pageSize);
          this.showNext = this.currentPage < this.totalPages;
          this.loadingIndicator = !!result?.loadingIndicator;
          this.cdr.markForCheck();
        }
      );
    }
  }

  private fetchSearchResults(searchTerm, pageSize: number) {
    const page = 1;
    this.service.SearchResults(
      this.service.search(searchTerm, page, pageSize),
      this.searchTerm,
      this.totalItems,
      this.pageSize,
      this.loadingIndicator,
      (result: any) => {
        this.guests = result?.list;
        this.filteredGuests = result?.list;
        this.totalItems = result?.total_items;
        this.loadingIndicator = result?.loadingIndicator;
        this.cdr.detectChanges();
      }
    )
  }
  // Toggle function to show/hide search fields
  toggleSearchFields() {
    this.showSearchFields = !this.showSearchFields;
    if (!this.showSearchFields) {
      this.reset();  // this will call loadOriginalPage()
    }
  }
public advanceSearch() {
  const entry = this.searchForm.get('date_of_entry')?.value;
  const exit  = this.searchForm.get('date_of_exit')?.value;
  if (entry) this.searchForm.patchValue({ date_of_entry: this.userService.formatDate(entry) });
  if (exit)  this.searchForm.patchValue({ date_of_exit:  this.userService.formatDate(exit) });

  this.isAdvancedSearch = true;
  this.currentPage = 1;
  this.showPagination = true;
  this.loadPaginatedData();
}

  public reset() {
    this.isAdvancedSearch = false;     // turn off advanced mode
    this.showPagination = true;
    this.searchForm.reset();           // clear filters
    this.currentPage = 1;              // start at first page
    this.loadOriginalData();           // ← one place to restore data
  }

  isLastRow(rowIndex: number): boolean {
  const totalRows = this.guests.length;
  const rowsPerPage = this.pageSize; // Your page size variable
  const currentPage = this.currentPage; // Your current page variable

  // Check if it's the last row on the current page
  return rowIndex === (this.guests.length - 1) % rowsPerPage;
}


  public guestReport() {
    this.bsModalRef = this.bsModalService.show(ReportModalComponent, {
      backdrop: 'static', // Prevent closing on backdrop click
      keyboard: false,
    })

    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;

      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
        modalContent.start_date = start_date
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
        modalContent.end_date = end_date
      }
      this.reportService.createGuestReport(modalContent.report_format, 'Guest Range Report Bt Guest Type', modalContent)

    });

  }

  public checkin_again(data: any) {
    this.service.cloneGuest(data.id, {})
      .subscribe({
        next: (response: any) => {
          this.translate.get('TR.re_entry_success').subscribe((message: string) => {
            this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
              this.toastr.success(message, title);
            });
          });
          this.ngOnInit();

        }, error: (err) => {
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toastr.error(message, title);
            });
          });

        },
      })
  }
}
