import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { delay } from 'rxjs/operators';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { DeletemodelComponent } from '@app/views/auth/modals/deletemodel/deletemodel.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserListService } from '@app/views/auth/user-list/user-list.services';

@Component({
  selector: 'app-list-hotel',
  templateUrl: './list-hotel.component.html',
  styleUrls: ['./list-hotel.component.css']
})
export class ListhotelComponent implements OnInit {
  public isSmallScreen : boolean = false;
  temp = [];
  selected = [];
  hotelData = []
  public role;
  public settingsId;
   columnMode: 'force'|'standard'|'flex' = 'force';
  headerHeight = 50;
  footerHeight = 180;
  rowHeight: 'auto' | number = 'auto';
  scrollbarH = false;
  scrollbarV = false;
  SelectionType = SelectionType;
  showSearchFields: boolean = false;
  public searchForm: FormGroup;


   hotel_types = [
    { value: 'HOTEL', label: 'HOTEL',ps:'هوټل',dr:'هوتل' },
    { value: 'HOSTEL', label: 'HOSTEL',ps:'لیلیه',dr:'لیلیه' },
    { value: 'GUEST_HOUSE', label: 'GUEST HOUSE',ps:'میلمستون',dr:'مهمانخانه' },
    { value: 'MUSAFIR_KHANA', label: 'MUSAFIR KHANA',ps:'مسافرخانه',dr:'مسافرخانه' },
    { value: 'HOUSE', label: 'HOUSE',ps:'کور',dr:'حویلی' },
    { value: 'RENT_ROOM', label: 'RENT ROOM',ps:'کوټه',dr:'اطاق' },
    { value: 'COMPANY', label: 'COMPANY',ps:'کمپنی',dr:'کمپنی' },

  ];

  public isAdvancedSearch = false;
  public loadingIndicator = true;
  public searchTerm:string = '';
  public totalItems: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public totalPages: number = 0;
  public pages: number[] = [];
  public showPrevious: boolean = true;
  public showNext:string | boolean = true;
  public showPagination: boolean = true;
  public pageSizeOptions : number[] = [10,20,30,50,100];
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public bsModalRef: BsModalRef;

  public currentLang;


  constructor(
    private router: Router,
    private userService: UserListService,
    private modalService: BsModalService,
    private service: SettingsServiceService,
    private cdr: ChangeDetectorRef,
    private toastr:ToastrService,
    private authService: AuthService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private screenSizeSvc: ScreenSizeService) {
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
        // Load paginated data
        // this.loadPaginatedData();
      },
    });
    this.initializeSearch()
    this.getAuthUser();

    this.fetch();
    this.loadPaginatedData();

    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });
    this.applyResponsiveTable(window.innerWidth);
    this.cdr.detectChanges();
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

      @HostListener('window:resize', ['$event'])
    onResize(event: UIEvent): void {
      this.checkScreenSize();
    }

    private checkScreenSize(): void {
      if (typeof window !== 'undefined') {
        this.isSmallScreen = window.innerWidth < 768; // small screen breakpoint
      }
    }


  initializeSearch(){
    this.searchForm = this.fb.group({
      title:[''],
      phone: [''],
      email: ['', [
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]],
      hotel_type:['']
    })
  }

  fetch() {
    this.service.getConfigurationListData('hotels')
      .subscribe({
        next: (data: any) => {

          this.hotelData = data.hotels?.results;


          this.cdr.markForCheck();
        }
      })

  }


  public getAuthUser(){
    this.authService.getCurrentUser()
    .subscribe({
      next: (user: any)=>{
        this.role = user?.authenticatedUser?.role?.code;
        }
    })
  }










  public createHotel(){
    this.router.navigate([`settings/create-hotel`])
  }

  public viewWebConfig(id: number) {
    this.router.navigate([`settings/hotel/${id}/view`],{ queryParams: { page: this.currentPage, size:this.pageSize} })
  }
  public editWebConfig(id: number) {
    this.router.navigate([`settings/hotel/${id}/edit`],{ queryParams: { page: this.currentPage, size:this.pageSize} })
  }




  openModal(id: number) {
    this.bsModalRef = this.modalService.show(DeletemodelComponent);



    // Subscribe to the onHide event to get the result from the modal
    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.deleteHotel(id); // Perform the delete operation


      }
    });
  }

public deleteHotel(id: number){
    this.service.deleteConfiguration('hotels',id)
    .subscribe({
        next: (hotelDelete: any)=>{
            if(hotelDelete){
              this.translate.get('TR.delete_msg').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });

                this.hotelData = this.hotelData.filter(hotel => hotel.id !== id);
                this.cdr.detectChanges()


            }
        }
    })

}




public loadPaginatedData() {
  if(this.isAdvancedSearch){
    this.service.advanceSearch(this.searchForm.value, this.currentPage, this.pageSize)
  .subscribe({
    next: (response: any)=>{


      this.hotelData = response?.hotels?.results;
      this.totalItems = response?.hotels?.count;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.showPagination = true;
      this.cdr.detectChanges()


    }
  })

  }else{
     this.service.sharedLoadData(
    this.service.getHotleListPaginated(this.currentPage, this.pageSize),
    this.totalItems,
    this.totalPages,
    this.pageSize,
    this.loadingIndicator,
    this.showNext,
    (result: any) => {
      this.hotelData = result?.list;
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


public search(){
  this.loadingIndicator = true;
  this.hotelData = [];
  if(!this.searchTerm){
    this.showPagination = true;
    this.currentPage = 1;
    this.loadOriginalData();
  }else{
    this.showPagination = false;
    this.fetchSearchResults(this.searchTerm, 10);
  }
  this.searchTerm = '';
}
private loadOriginalData(){
  this.service.OriginalData(
    this.service.search('', this.currentPage, this.pageSize),
    this.totalItems,
    this.totalPages,
    this.pageSize,
    this.loadingIndicator,
    this.pages,
    (result: any) => {
      this.hotelData = result?.list;
      this.totalItems = result?.total_items;
      this.totalPages = result?.total_pages;
      this.loadingIndicator = result?.loadingIndicator;
      this.pages = result?.allPages;
      this.cdr.detectChanges();

      }
    );
}
private fetchSearchResults(searchTerm, pageSize: number){
  const page = 1;
  this.service.SearchResults(
    this.service.search(searchTerm, page, pageSize),
    this.searchTerm,
    this.totalItems,
    this.pageSize,
    this.loadingIndicator,
    (result: any) => {
      this.hotelData = result?.list;
      this.totalItems = result?.total_items;
      this.loadingIndicator = result?.loadingIndicator;
      this.cdr.detectChanges();
    }
  )
}


// Toggle function to show/hide search fields
toggleSearchFields() {
  this.showSearchFields = !this.showSearchFields;
}

public advanceSearch(){
  this.isAdvancedSearch = true;
  this.currentPage = 1;
  this.service.advanceSearch(this.searchForm.value, this.currentPage, this.pageSize)
  .subscribe({
    next: (response: any)=>{
      if(response?.hotels?.count == 0){

        this.translate.get('TR.search_notify').subscribe((message: string) => {
          this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
            this.toastr.warning(message, title);
          });
        });
        this.hotelData= [];
        this.showPagination = false
        this.cdr.detectChanges();
        return
      }

      this.hotelData = response?.hotels?.results;
      this.totalItems = response?.hotels?.count;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.showPagination = true;
      this.cdr.detectChanges()


    }
  })

}
public reset(){
  this.searchForm.reset();
  this.cdr.detectChanges();
}



}




