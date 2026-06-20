import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { StaffService } from '../../service/staff.service';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import {  ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { delay } from 'rxjs';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { DeletemodelComponent } from '@app/views/auth/modals/deletemodel/deletemodel.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserListService } from '@app/views/auth/user-list/user-list.services';

@Component({
  selector: 'app-list-staff',
  templateUrl: './list-staff.component.html',
  styleUrls: ['./list-staff.component.css']
})
export class ListStaffComponent implements OnInit {

   genders=[
    {value: 'MALE', label: 'Male',ps:"نارینه", dr:"مرد"},
    {value: 'FEMALE',label: 'Female',ps:"ښځینه", dr:"زن"}
  ]

  statuses=[
    {value: true, label: 'Approved ', ps: "فعال", dr: "فعال"},
    {value: false,label: 'Pending', ps:"غیر فعال",dr:"غیر فعال"}
  ]

  temp = [];
    selected = [];
    staff = [];
    public filterstaff = [];
    columnMode: ColumnMode = ColumnMode.force;
    SelectionType = SelectionType;
    rowHeight: 'auto' | number = 'auto'
    scrollbarH: boolean = false
    public bsModalRef: BsModalRef;
    value = false;
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
  showSearchFields: boolean = false;
  public searchForm: FormGroup;
  public currentLang;
  public hotels;
  public isAdvancedSearch = false;
  public isSmallScreen: boolean = false;



     // Pangination Attributes
     public totalCount = 0;
     public page: number
     public role;
     public bsmodalRef: BsModalRef
    @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private service: StaffService,
    private cdr: ChangeDetectorRef,
    private screenSizeSvc: ScreenSizeService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private translate: TranslateService,
    private bsmodalService: BsModalService,
    private fb: FormBuilder,
    private userService: UserListService,
    private route: ActivatedRoute,

  ) {
    this.screenSizeSvc.onResize$.pipe(delay(0)).subscribe(sizes => {
      const sizeTabletAbove = sizes.includes(SCREEN_SIZE.XXL) ||  sizes.includes(SCREEN_SIZE.XL) || sizes.includes(SCREEN_SIZE.LG)
      if(sizeTabletAbove){
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

   @HostListener('window:resize', ['$event'])windowResize(event) {
    this.getScreenWidth(event.target.innerWidth)
}

ngOnInit(): void {
  this.checkScreenSize();
   this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });

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

    this.getHotels();
    this.getAuthUser();
    this.initializeSearch();
    this.fetch();
    this.loadPaginatedData();

    this.cdr.markForCheck();
    this.cdr.detectChanges();

}

  public getHotels(){
    this.userService.getHotels()
    .subscribe({
        next: (hotels: any)=>{
            this.hotels= hotels?.hotels

        }
    })
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
    first_name: [''],
    last_name: [''],

    father_name: [''],
    grand_father_name: [''],
    tazkira: ['', [Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
    phone: [''],
    gender: [''],
    email:[''],
    is_approved: [null],
    hotel: ['']
  })
}

public getAuthUser(){
  this.authService.getCurrentUser()
  .subscribe({
    next: (user: any)=>{
      this.role = user?.authenticatedUser?.role?.code


    }
  })
}
fetch() {
    this.service.getStaffList()
    .subscribe({
        next: (response: any) => {
          this.staff = response.staff?.results;
          this.cdr.markForCheck();
        }
      })
}
onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
}

public onActivate(id: number) {
  this.service.setStaffStatus(id, 'activate')
    .subscribe({
      next: (staff: any) => {
        this.toastr.success('Staff Activated Successfully', 'Success');
              let index = this.staff.findIndex(staff => staff.id === id);
        if(index !== -1) {
          this.staff[index] = staff?.staff;
          this.staff = [...this.staff];

        }
        this.cdr.markForCheck();
      }
    })
}

public onDeactivate(id: number) {
    this.service.setStaffStatus(id, 'deactivate')
    .subscribe({
      next: (staff: any) => {
        this.toastr.error('Staff Deactivated Successfully', 'Success');
        let index = this.staff.findIndex(staff => staff.id === id);
        if(index !== -1) {
          this.staff[index] = staff?.staff;
          this.staff = [...this.staff];
        }
        this.cdr.markForCheck();
      }
    })
}

getScreenWidth(size:number) {
    this.screenSizeSvc.onResize(size)
}

public createStaff() {
  this.router

  this.router.navigate(['staff/create']);
}

public editStaff(id:number){

  this.router.navigate([`staff/${id}/edit`],{ queryParams: { page: this.currentPage, size:this.pageSize} })
}

public viewStaff(id:number){
  this.router.navigate([`staff/${id}/view`],{ queryParams: { page: this.currentPage, size:this.pageSize} })
}

public loadPaginatedData() {
  if(this.isAdvancedSearch){

    this.service.advanceSearch(this.searchForm.value, this.currentPage, this.pageSize)
  .subscribe({
    next: (response: any)=>{
     this.staff = response?.staff?.results
      this.totalItems = response?.staff?.count;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.showPagination = true;
      this.cdr.detectChanges();
    }
  })



  }else{
    this.service.sharedLoadData(
    this.service.getStaffListPaginated(this.currentPage, this.pageSize),
    this.totalItems,
    this.totalPages,
    this.pageSize,
    this.loadingIndicator,
    this.showNext,
    (result: any) => {
      this.staff = result?.list;
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

openModal(id: number) {
  this.bsModalRef = this.bsmodalService.show(DeletemodelComponent);
  // Subscribe to the onHide event to get the result from the modal
  this.bsModalRef.onHide.subscribe(() => {
    const modalContent = this.bsModalRef?.content;
    if (modalContent && modalContent.result === 'yes') {
      this.deleteStaff(id);
    }
  });
}

public deleteStaff(id: number){
  this.service.deleteStaff(id)
  .subscribe({
      next: (deleteStaff: any)=>{


        this.translate.get('TR.delete_msg').subscribe((message: string) => {
          this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
            this.toastr.success(message, title);
          });
        });

              this.staff = this.staff.filter(staff => staff.id !== id);
              this.cdr.detectChanges()
      }
  })
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
  this.staff = [];
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
      this.staff = result?.list;
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
      this.staff = result?.list;
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
      if(response?.staff?.count == 0){

        this.translate.get('TR.search_notify').subscribe((message: string) => {
          this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
            this.toastr.warning(message, title);
          });
        });
        this.staff= [];
        this.showPagination = false
        this.cdr.detectChanges();
        return
      }
      this.staff = response?.staff?.results
      this.totalItems = response?.staff?.count;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.showPagination = true;
      this.cdr.detectChanges();
    }
  })

}
public reset(){
  this.searchForm.reset();
  this.cdr.detectChanges();
}




}
